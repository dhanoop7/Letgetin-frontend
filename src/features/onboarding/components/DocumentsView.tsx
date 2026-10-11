'use client';

import React from 'react';
import { AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { StepId, UploadedDoc } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { DOC_CONFIGS } from '../lib/constants';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { FileDropzone } from './FileDropzone';
import { StatusBadge } from './StatusBadge';

interface DocumentsViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onSelectStep }) => {
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const uploadedDocs = useCandidateOnboardingStore((state) => state.uploadedDocs);
  const addUploadedDoc = useCandidateOnboardingStore((state) => state.addUploadedDoc);
  const removeUploadedDoc = useCandidateOnboardingStore((state) => state.removeUploadedDoc);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);

  const requiredConfigs = DOC_CONFIGS.filter((c) => c.required);
  const uploadedRequiredCount = requiredConfigs.filter((cfg) =>
    uploadedDocs.some((d) => d.type === cfg.id),
  ).length;

  const canContinue = uploadedRequiredCount === requiredConfigs.length;

  const handleUploadSuccess = (doc: UploadedDoc) => {
    addUploadedDoc(doc);
  };

  const handleRemove = (docId: string) => {
    removeUploadedDoc(docId);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setStepStatus('documents', 'completed');
    onSelectStep('bank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="documents"
        title="Document Verification & Records"
        description="Upload official government proofs, university certificates, and previous employment letters for compliance background check."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              {uploadedRequiredCount} of {requiredConfigs.length} Required
            </span>
            <StatusBadge status={stepStatus.documents} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* Guidelines Card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink">
              Secure Document Compliance Guidelines
            </h4>
            <p className="text-xs text-ink-soft leading-relaxed">
              Files are securely encrypted in transit and at rest in compliance with SOC2 Type II and
              global privacy standards. Scans should be clear and legible with all details visible.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of File Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOC_CONFIGS.map((config) => {
          const uploaded = uploadedDocs.find((d) => d.type === config.id);
          return (
            <FileDropzone
              key={config.id}
              config={config}
              uploadedDoc={uploaded}
              onUploadSuccess={handleUploadSuccess}
              onRemove={handleRemove}
            />
          );
        })}
      </div>

      {/* Warning if missing required */}
      {!canContinue && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Please upload all {requiredConfigs.length} mandatory documents ({uploadedRequiredCount}/{requiredConfigs.length} uploaded) to continue to Bank & Tax setup.
          </span>
        </div>
      )}

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('personal')}
        backText="Personal Info"
        canContinue={canContinue}
        onContinue={handleContinue}
        continueText="Continue to Bank & Tax"
      />
    </div>
  );
};
