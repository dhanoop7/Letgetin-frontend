'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ESignConsent, ConsentStatus, SignatureType } from '../types';
import { ESignService } from '../services/eSignService';
import { ESignStatusBadge } from './ESignStatusBadge';
import { ConsentTermsCard } from './ConsentTermsCard';
import { ConsentPdfUploader } from './ConsentPdfUploader';
import { SignatureCanvasPad } from './SignatureCanvasPad';
import { ConsentConfirmationCheckbox } from './ConsentConfirmationCheckbox';
import { ESignSubmittedView } from './ESignSubmittedView';
import {
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const ESignWorkspace: React.FC = () => {
  const { user } = useAuthStore();
  const [existingConsent, setExistingConsent] = useState<ESignConsent | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');
  const [signatureFileName, setSignatureFileName] = useState<string | undefined>();
  const [signatureFileSize, setSignatureFileSize] = useState<number | undefined>();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const candidateId = user?._id || user?.id || 'default_candidate';
  const candidateDefaultName =
    user?.fullName || user?.username || '';

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const consent = await ESignService.getConsentStatus(candidateId);
        if (isMounted) {
          setExistingConsent(consent);
          if (candidateDefaultName) {
            setFullName(candidateDefaultName);
          }
        }
      } catch (err) {
        console.warn('Failed to load consent status:', err);
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [candidateId, candidateDefaultName]);

  // If user info loads later and name is empty, sync it
  useEffect(() => {
    if (!fullName && candidateDefaultName) {
      setFullName(candidateDefaultName);
    }
  }, [candidateDefaultName, fullName]);

  const currentStatus: ConsentStatus = useMemo(() => {
    if (isResubmitting) return 'PENDING';
    return existingConsent?.status || 'PENDING';
  }, [existingConsent, isResubmitting]);

  const handleSignatureChange = (
    dataUrl: string,
    type: SignatureType,
    fileInfo?: { name: string; size: number }
  ) => {
    setSignatureDataUrl(dataUrl);
    setSignatureType(type);
    setSignatureFileName(fileInfo?.name);
    setSignatureFileSize(fileInfo?.size);
  };

  // Validation conditions
  const isPdfValid = !!selectedFile;
  const isSignatureValid = !!signatureDataUrl && signatureDataUrl.trim().length > 0;
  const isNameValid = fullName.trim().length >= 2;
  const isCheckboxValid = isConsentChecked;

  const canSubmit =
    isPdfValid &&
    isSignatureValid &&
    isNameValid &&
    isCheckboxValid &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please upload your PDF consent document before submitting.');
      return;
    }

    if (!signatureDataUrl) {
      toast.error('Please provide your electronic signature (draw or upload).');
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Please enter your full legal name.');
      return;
    }

    if (!isConsentChecked) {
      toast.error('Please check the authorization agreement box.');
      return;
    }

    setIsSubmitting(true);

    try {
      const consent = await ESignService.submitConsent({
        candidateId,
        signedBy: fullName.trim(),
        signatureDataUrl,
        signatureType,
        signatureFileName,
        signatureFileSize,
        documentFile: selectedFile,
      });

      setExistingConsent(consent);
      setIsResubmitting(false);

      toast.success('Consent submitted successfully', {
        description:
          'Your electronic consent has been recorded and is now available for verification.',
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'Failed to submit electronic consent. Please try again.';
      toast.error('Submission Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartResubmit = () => {
    setIsResubmitting(true);
    setSelectedFile(null);
    setSignatureDataUrl('');
    setSignatureType('drawn');
    setSignatureFileName(undefined);
    setSignatureFileSize(undefined);
    setIsConsentChecked(false);
  };

  if (isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
        <p className="text-xs text-ink-soft">Loading E-Sign authorization status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <FileSignature className="w-3 h-3" /> E-SIGN
              </span>
              <span className="text-[10px] font-semibold text-ink-soft">
                Candidate Authorization Suite
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Electronic Consent & Authorization
            </h1>

            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              Provide your consent to allow LetGetIn and the authorized company
              to verify your submitted certificates and process your information
              according to applicable company policies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Consent Status
              </span>
              <ESignStatusBadge status={currentStatus} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {existingConsent && !isResubmitting ? (
        <ESignSubmittedView
          consent={existingConsent}
          onResubmit={handleStartResubmit}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Consent Terms */}
          <ConsentTermsCard />

          {/* Step 2: PDF Upload Area */}
          <ConsentPdfUploader
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            disabled={isSubmitting}
          />

          {/* Step 3: Electronic Signature (Draw or Upload) */}
          <SignatureCanvasPad
            fullName={fullName}
            onFullNameChange={setFullName}
            signatureDataUrl={signatureDataUrl}
            signatureType={signatureType}
            signatureFileName={signatureFileName}
            signatureFileSize={signatureFileSize}
            onSignatureChange={handleSignatureChange}
            disabled={isSubmitting}
          />

          {/* Step 4: Explicit Consent Checkbox */}
          <ConsentConfirmationCheckbox
            checked={isConsentChecked}
            onChange={setIsConsentChecked}
            disabled={isSubmitting}
          />

          {/* Step 5: Submission Bar with Requirements Checklist */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-xs font-bold text-ink">Required steps:</div>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    isPdfValid ? 'text-emerald-600' : 'text-ink-soft'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isPdfValid ? 'text-emerald-500' : 'text-ink-soft/40'
                    }`}
                  />
                  PDF uploaded
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    isSignatureValid ? 'text-emerald-600' : 'text-ink-soft'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isSignatureValid ? 'text-emerald-500' : 'text-ink-soft/40'
                    }`}
                  />
                  Signature provided
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    isCheckboxValid ? 'text-emerald-600' : 'text-ink-soft'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isCheckboxValid ? 'text-emerald-500' : 'text-ink-soft/40'
                    }`}
                  />
                  Consent confirmed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isResubmitting && (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-2xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition-all cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Consent...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Consent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
