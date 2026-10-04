'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, X, Sparkles, Award } from 'lucide-react';
import { IResume } from '../../types';

interface ResumeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: IResume | null;
  onConfirmVerification: (resume: IResume) => Promise<void>;
}

export const ResumeVerificationModal: React.FC<ResumeVerificationModalProps> = ({
  isOpen,
  onClose,
  resume,
  onConfirmVerification,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resume) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      await onConfirmVerification(resume);
      setIsVerifying(false);
      onClose();
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err?.message || 'Failed to verify resume. Please try again.');
      setIsVerifying(false);
    }
  };

  const verificationPoints = [
    {
      title: 'Identity & Contact Verification',
      desc: 'Validates candidate name, verified email address, phone, and professional profiles.',
    },
    {
      title: 'Experience Timeline & Employment Audit',
      desc: 'Checks chronological consistency and structured responsibilities across work history.',
    },
    {
      title: 'Skills & Education Credential Scoring',
      desc: 'Evaluates education degrees, technical skill benchmarks, and certificates against ATS standards.',
    },
    {
      title: 'ATS Compliance Badge Certification',
      desc: 'Applies the official LetGetIn Verified Candidate badge to boost recruiter visibility.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-surface border border-white/20 rounded-3xl p-6 sm:p-8 shadow-elegant text-ink overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink transition-colors rounded-xl hover:bg-surface-alt disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-brand text-primary-foreground rounded-2xl shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Verify & Certify Resume</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Official LetGetIn verification for <strong className="text-ink">{resume.title}</strong>
              </p>
            </div>
          </div>

          {/* Verification Points */}
          <div className="space-y-2.5 my-5">
            {verificationPoints.map((pt, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-surface-alt border border-border flex items-start gap-3"
              >
                <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">{pt.title}</h4>
                  <p className="text-[11px] text-ink-soft leading-tight mt-0.5">{pt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl transition-all shadow-elegant hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Verify & Certify Resume</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
