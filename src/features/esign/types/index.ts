export type ConsentStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type SignatureType = 'drawn' | 'uploaded';

export interface ESignConsent {
  id: string;
  candidateId: string;
  documentName: string;
  documentSize: number;
  documentType: string;
  status: ConsentStatus;
  signedBy?: string;
  signedAt?: string;
  submittedAt?: string;
  rejectionReason?: string;
  signatureDataUrl?: string;
  signatureType?: SignatureType;
  signatureFileName?: string;
  signatureFileSize?: number;
  documentUrl?: string;
  documentChecksum?: string;
}

export interface ConsentSubmissionPayload {
  candidateId: string;
  signedBy: string;
  signatureDataUrl: string;
  signatureType?: SignatureType;
  signatureFileName?: string;
  signatureFileSize?: number;
  documentFile: File;
}
