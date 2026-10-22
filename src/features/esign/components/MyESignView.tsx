'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { SignatureType } from '../types';
import { ESignService } from '../services/eSignService';
import { SignatureCanvasPad } from './SignatureCanvasPad';
import { toast } from 'sonner';

export const MyESignView: React.FC = () => {
  const { user } = useAuthStore();
  const candidateId = user?._id || user?.id || 'default_candidate';
  const candidateDefaultName = user?.fullName || user?.username || '';

  const [fullName, setFullName] = useState(candidateDefaultName);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');
  const [signatureFileName, setSignatureFileName] = useState<string | undefined>();
  const [signatureFileSize, setSignatureFileSize] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt to load existing signature data if previously saved
  useEffect(() => {
    let isMounted = true;
    const loadExisting = async () => {
      try {
        const consent = await ESignService.getConsentStatus(candidateId);
        if (isMounted && consent) {
          if (consent.signedBy && !fullName) {
            setFullName(consent.signedBy);
          }
          if (consent.signatureDataUrl) {
            setSignatureDataUrl(consent.signatureDataUrl);
            setSignatureType(consent.signatureType || 'drawn');
            setSignatureFileName(consent.signatureFileName);
            setSignatureFileSize(consent.signatureFileSize);
          }
        }
      } catch (err) {
        console.warn('Could not load signature state:', err);
      }
    };
    loadExisting();
    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  // Sync default candidate name when user profile loads
  useEffect(() => {
    if (!fullName && candidateDefaultName) {
      setFullName(candidateDefaultName);
    }
  }, [candidateDefaultName, fullName]);

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

  const handleSubmit = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Please enter your full legal name before submitting.');
      return;
    }

    if (!signatureDataUrl || signatureDataUrl.trim().length === 0) {
      toast.error('Please provide an electronic signature (draw or upload) before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await ESignService.submitSignature({
        candidateId,
        signedBy: fullName.trim(),
        signatureDataUrl,
        signatureType,
        signatureFileName,
        signatureFileSize,
      });

      toast.success('Electronic Signature Submitted Successfully', {
        description: 'Your digital signature has been verified and saved to your profile.',
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'Failed to submit electronic signature. Please try again.';
      toast.error('Submission Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <SignatureCanvasPad
        fullName={fullName}
        onFullNameChange={setFullName}
        signatureDataUrl={signatureDataUrl}
        signatureType={signatureType}
        signatureFileName={signatureFileName}
        signatureFileSize={signatureFileSize}
        onSignatureChange={handleSignatureChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Submit E-Sign"
      />
    </div>
  );
};
