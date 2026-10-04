'use client';

import React from 'react';
import { ESignConsent } from '../types';
import { ESignStatusBadge } from './ESignStatusBadge';
import {
  CheckCircle2,
  FileCheck2,
  Calendar,
  User,
  ShieldCheck,
  RotateCcw,
  Download,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ESignSubmittedViewProps {
  consent: ESignConsent;
  onResubmit?: () => void;
}

export const ESignSubmittedView: React.FC<ESignSubmittedViewProps> = ({
  consent,
  onResubmit,
}) => {
  const formattedDate = consent.submittedAt
    ? new Date(consent.submittedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isRejected = consent.status === 'REJECTED';
  const isApproved = consent.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-7 border shadow-xs transition-all ${
          isRejected
            ? 'bg-rose-500/5 border-rose-500/20'
            : isApproved
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-primary/5 border-primary/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isRejected
                  ? 'bg-rose-500 text-white'
                  : isApproved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-brand text-primary-foreground shadow-glow'
              }`}
            >
              {isRejected ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-ink tracking-tight">
                  {isRejected
                    ? 'Consent Requires Revision'
                    : isApproved
                    ? 'Consent Approved & Verified'
                    : 'Consent Submitted Successfully'}
                </h3>
                <ESignStatusBadge status={consent.status} size="sm" />
              </div>
              <p className="text-xs text-ink-soft max-w-xl">
                {isRejected
                  ? 'The company reviewed your submitted documents and requested a correction.'
                  : isApproved
                  ? 'Your electronic consent and certificates have been verified and approved.'
                  : 'Your electronic consent has been recorded and is now available for verification.'}
              </p>
            </div>
          </div>

          {onResubmit && (
            <button
              type="button"
              onClick={onResubmit}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary-glow" />
              <span>Resubmit Consent</span>
            </button>
          )}
        </div>

        {/* Rejection Reason if available */}
        {isRejected && consent.rejectionReason && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <span className="font-bold">Reason for Rejection:</span>
            <p>{consent.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Verification & Audit Details Card */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">
                Consent Audit & Submission Record
              </h4>
              <p className="text-xs text-ink-soft">
                Official electronic authorization record details.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-ink-soft/70 bg-surface-alt border border-border px-2 py-0.5 rounded-md">
            ID: {consent.id.substring(0, 16)}...
          </span>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status */}
          <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-1">
            <div className="text-[11px] font-medium text-ink-soft">
              Consent Status
            </div>
            <div className="pt-1">
              <ESignStatusBadge status={consent.status} size="md" />
            </div>
          </div>

          {/* Document */}
          <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-1">
            <div className="text-[11px] font-medium text-ink-soft">
              Submitted Document
            </div>
            <div className="text-xs font-bold text-ink truncate flex items-center gap-1.5 pt-1">
              <FileCheck2 className="w-4 h-4 text-primary-glow shrink-0" />
              <span className="truncate">{consent.documentName}</span>
            </div>
            <div className="text-[10px] text-ink-soft">
              {formatFileSize(consent.documentSize)} • PDF Document
            </div>
          </div>

          {/* Signed By */}
          <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-1">
            <div className="text-[11px] font-medium text-ink-soft">
              Signed By
            </div>
            <div className="text-xs font-bold text-ink truncate flex items-center gap-1.5 pt-1">
              <User className="w-4 h-4 text-primary-glow shrink-0" />
              <span>{consent.signedBy || 'Candidate'}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Identity Verified
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-1 sm:col-span-2 lg:col-span-3">
            <div className="text-[11px] font-medium text-ink-soft">
              Signed & Submitted Date
            </div>
            <div className="text-xs font-bold text-ink flex items-center gap-1.5 pt-1">
              <Calendar className="w-4 h-4 text-primary-glow shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Digital Signature Preview */}
        {consent.signatureDataUrl && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Recorded Electronic Signature</span>
              <span className="text-[10px] text-ink-soft bg-surface-alt px-2 py-0.5 rounded-md border border-border">
                {consent.signatureType === 'uploaded'
                  ? 'Uploaded Image'
                  : 'Digitally Drawn'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-alt/40 border border-border flex items-center justify-center">
              <img
                src={consent.signatureDataUrl}
                alt="Electronic Signature"
                className="max-h-24 max-w-full object-contain filter contrast-125"
              />
            </div>
          </div>
        )}

        {/* Policy Notice Box */}
        <div className="p-4 rounded-2xl bg-surface-alt/40 border border-border/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary-glow shrink-0 mt-0.5" />
          <p className="text-xs text-ink-soft leading-relaxed">
            This electronic consent serves as your active authorization for LetGetIn and
            authorized verification partners to verify educational certificates, employment
            records, and background checks in compliance with applicable company policies.
          </p>
        </div>
      </div>
    </div>
  );
};
