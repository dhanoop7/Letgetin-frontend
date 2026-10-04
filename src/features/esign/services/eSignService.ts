import { ESignConsent, ConsentStatus, SignatureType } from '../types';

const STORAGE_PREFIX = 'letgetin_esign_consent_';
const MAX_DOCUMENT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SIGNATURE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface DocumentValidationResult {
  isValid: boolean;
  error?: string;
}

export class ESignService {
  /**
   * Validate that a file is a valid non-empty PDF under 10MB
   */
  static async validatePdfDocument(file: File): Promise<DocumentValidationResult> {
    if (!file) {
      return { isValid: false, error: 'No file selected.' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'The selected file is empty.' };
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      };
    }

    // Check extension & mime type
    const isPdfMime = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime) {
      return { isValid: false, error: 'Only PDF documents (.pdf) are allowed.' };
    }

    // Deep check: Magic bytes check (%PDF -> 0x25, 0x50, 0x44, 0x46)
    try {
      const slice = file.slice(0, 4);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const isMagicPdf =
        bytes[0] === 0x25 && // %
        bytes[1] === 0x50 && // P
        bytes[2] === 0x44 && // D
        bytes[3] === 0x46; // F

      if (!isMagicPdf) {
        return { isValid: false, error: 'The file does not appear to be a valid PDF format.' };
      }
    } catch {
      // If array buffer inspection fails, fallback to mime check
    }

    return { isValid: true };
  }

  /**
   * Validate that an uploaded signature file is a valid non-empty PNG, JPG, or JPEG under 5MB
   */
  static async validateSignatureImage(file: File): Promise<DocumentValidationResult> {
    if (!file) {
      return { isValid: false, error: 'No signature file selected.' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'The signature file is empty.' };
    }

    if (file.size > MAX_SIGNATURE_IMAGE_SIZE_BYTES) {
      return {
        isValid: false,
        error: 'Signature image must be smaller than 5 MB.',
      };
    }

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    if (isPdf) {
      return {
        isValid: false,
        error: 'Please upload a PNG, JPG, or JPEG signature image (PDF is not allowed for signatures).',
      };
    }

    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg'];

    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = validMimes.includes(file.type.toLowerCase());

    if (!hasValidExt && !hasValidMime) {
      return {
        isValid: false,
        error: 'Please upload a PNG, JPG, or JPEG signature image.',
      };
    }

    return { isValid: true };
  }

  /**
   * Convert image file to data URL
   */
  static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get consent record for a candidate
   */
  static async getConsentStatus(candidateId: string = 'default_candidate'): Promise<ESignConsent | null> {
    try {
      if (typeof window === 'undefined') return null;
      const key = `${STORAGE_PREFIX}${candidateId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ESignConsent;
      return parsed;
    } catch (err) {
      console.warn('Failed to retrieve consent status from storage:', err);
      return null;
    }
  }

  /**
   * Submit electronic consent
   */
  static async submitConsent(params: {
    candidateId: string;
    signedBy: string;
    signatureDataUrl: string;
    signatureType?: SignatureType;
    signatureFileName?: string;
    signatureFileSize?: number;
    documentFile: File;
  }): Promise<ESignConsent> {
    const {
      candidateId,
      signedBy,
      signatureDataUrl,
      signatureType = 'drawn',
      signatureFileName,
      signatureFileSize,
      documentFile,
    } = params;

    // Validate document
    const validation = await this.validatePdfDocument(documentFile);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid PDF file.');
    }

    if (!signedBy || signedBy.trim().length < 2) {
      throw new Error('Please enter your full legal name for the signature.');
    }

    if (!signatureDataUrl || signatureDataUrl.trim().length === 0) {
      throw new Error('Please provide an electronic signature (draw or upload).');
    }

    // Simulate safe network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date().toISOString();
    const consentRecord: ESignConsent = {
      id: `esign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      candidateId: candidateId || 'default_candidate',
      documentName: documentFile.name,
      documentSize: documentFile.size,
      documentType: documentFile.type || 'application/pdf',
      status: 'SUBMITTED',
      signedBy: signedBy.trim(),
      signedAt: now,
      submittedAt: now,
      signatureDataUrl: signatureDataUrl,
      signatureType: signatureType,
      signatureFileName: signatureFileName,
      signatureFileSize: signatureFileSize,
    };

    try {
      if (typeof window !== 'undefined') {
        const key = `${STORAGE_PREFIX}${consentRecord.candidateId}`;
        localStorage.setItem(key, JSON.stringify(consentRecord));
      }
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    return consentRecord;
  }

  /**
   * Reset consent (for re-submission if rejected or testing new consent submission)
   */
  static async resetConsent(candidateId: string = 'default_candidate'): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const key = `${STORAGE_PREFIX}${candidateId}`;
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('Failed to reset consent:', err);
    }
  }

  /**
   * Get consent details by ID
   */
  static async getConsentDetails(consentId: string, candidateId: string = 'default_candidate'): Promise<ESignConsent | null> {
    const record = await this.getConsentStatus(candidateId);
    if (record && record.id === consentId) {
      return record;
    }
    return record;
  }
}
