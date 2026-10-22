'use client';

import React, { useState } from 'react';
import {
  FileText,
  Eye,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  UserCheck,
  Award,
  Sparkles,
  Download,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { StepId } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { DEFAULT_OFFER_DETAILS } from '../lib/constants';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface WelcomeViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectStep }) => {
  const candidate = useCandidateOnboardingStore((state) => state.candidate);
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const offerAccepted = useCandidateOnboardingStore((state) => state.offerAccepted);
  const acceptOffer = useCandidateOnboardingStore((state) => state.acceptOffer);

  const [isChecked, setIsChecked] = useState(offerAccepted);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  const handleAcceptAndContinue = () => {
    if (!isChecked) return;
    acceptOffer();
    setIsSuccessFeedback(true);
    setTimeout(() => {
      onSelectStep('personal');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="welcome"
        title="Employment Offer & Terms"
        description="Review your compensation structure, reporting relationship, and formally accept your employment contract."
        badge={<StatusBadge status={stepStatus.welcome} size="md" />}
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* Offer Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-primary text-xs font-bold">
            <UserCheck className="w-4 h-4" />
            <span>Position & Role</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {candidate.role}
          </p>
          <p className="text-xs text-ink-soft">{DEFAULT_OFFER_DETAILS.band}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <DollarSign className="w-4 h-4" />
            <span>Total Annual CTC</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {DEFAULT_OFFER_DETAILS.annualCTC}
          </p>
          <p className="text-xs text-ink-soft">Fixed + Variable Component</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Equity Grant (ESOPs)</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {DEFAULT_OFFER_DETAILS.equityGrant.split('(')[0]}
          </p>
          <p className="text-xs text-ink-soft">4-year vesting schedule</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Joining Bonus</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {DEFAULT_OFFER_DETAILS.joiningBonus.split('(')[0]}
          </p>
          <p className="text-xs text-ink-soft">Disbursed with 1st payroll cycle</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Calendar className="w-4 h-4" />
            <span>Target Start Date</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {DEFAULT_OFFER_DETAILS.joiningDate}
          </p>
          <p className="text-xs text-ink-soft">{candidate.location || 'Hybrid / Remote'}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-ink-soft text-xs font-bold">
            <Building2 className="w-4 h-4" />
            <span>Reporting Manager</span>
          </div>
          <p className="text-sm sm:text-base font-black text-ink truncate">
            {candidate.manager?.name || 'Sarah Jenkins'}
          </p>
          <p className="text-xs text-ink-soft">{candidate.manager?.role || 'VP of Engineering'}</p>
        </div>
      </div>

      {/* Official Offer Document Card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Official Employment Offer Letter & Agreement
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Ref: LETGETIN-OFFER-2026-0941 • Signed with 256-bit Digital Signature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Preview Letter</span>
            </button>
          </div>
        </div>

        {/* Embedded Letter Highlights */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-alt/50 border border-border/80 space-y-3 text-xs text-ink leading-relaxed font-mono">
          <div className="text-ink-soft border-b border-border/60 pb-2 flex justify-between items-center text-[11px]">
            <span>LETGETIN TALENT CONTRACTS • STRICTLY CONFIDENTIAL</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>
          <p>
            Dear <strong>{candidate.name}</strong>,
          </p>
          <p>
            On behalf of <strong>{candidate.company}</strong>, we are thrilled to extend an official offer of
            employment for the position of <strong>{candidate.role}</strong> within our{' '}
            <strong>{candidate.department}</strong>.
          </p>
          <p>
            You will receive a total annual compensation package of{' '}
            <strong>{DEFAULT_OFFER_DETAILS.annualCTC}</strong> along with{' '}
            <strong>{DEFAULT_OFFER_DETAILS.equityGrant}</strong>. This appointment is contingent upon
            satisfactory completion of educational and prior employment verification.
          </p>
          <div className="pt-2 text-[11px] text-ink-soft">
            * Formal acceptance initiates your background verification and hardware provisioning.
          </div>
        </div>

        {/* Acceptance Declaration Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-ink">
                I formally accept the offer of employment and agree to the contractual terms.
              </span>
              <p className="text-ink-soft leading-relaxed">
                By ticking this box, you confirm your intent to join on{' '}
                <strong>{DEFAULT_OFFER_DETAILS.joiningDate}</strong> and authorize document verification.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('dashboard')}
        backText="Dashboard"
        canContinue={isChecked}
        onContinue={handleAcceptAndContinue}
        continueText={offerAccepted ? 'Continue to Personal Info' : 'Sign & Accept Offer'}
      />

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">Employment Agreement Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-ink leading-relaxed p-4 bg-surface-alt/40 rounded-2xl border border-border">
              <h4 className="font-bold text-sm text-ink">{candidate.company} Employment Contract</h4>
              <p>
                Candidate Name: <strong>{candidate.name}</strong>
              </p>
              <p>
                Role: <strong>{candidate.role}</strong> • Department: <strong>{candidate.department}</strong>
              </p>
              <p>
                Compensation: <strong>{DEFAULT_OFFER_DETAILS.annualCTC}</strong>
              </p>
              <p>
                Probation Period: <strong>{DEFAULT_OFFER_DETAILS.probationPeriod}</strong>
              </p>
              <p>
                Standard benefits include comprehensive family medical coverage, annual wellness reimbursement,
                flexible work arrangement, and continuous learning allowance.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
