'use client';

import React, { useState, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CheckCheck,
  FileCheck,
  AlertCircle,
  X,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { StepId, Policy } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { mockPolicies } from '../mocks/policies';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface PoliciesViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ onSelectStep }) => {
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const readPolicyIds = useCandidateOnboardingStore((state) => state.readPolicyIds);
  const acknowledgedPolicyIds = useCandidateOnboardingStore((state) => state.acknowledgedPolicyIds);
  const markPolicyAsRead = useCandidateOnboardingStore((state) => state.markPolicyAsRead);
  const acknowledgePolicy = useCandidateOnboardingStore((state) => state.acknowledgePolicy);
  const acknowledgeAllPolicies = useCandidateOnboardingStore((state) => state.acknowledgeAllPolicies);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);

  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const totalPolicies = mockPolicies.length;
  const acknowledgedCount = acknowledgedPolicyIds.length;
  const allRead = mockPolicies.every((p) => readPolicyIds.includes(p.id));
  const allAcknowledged = acknowledgedCount === totalPolicies;

  const handleOpenPolicy = (policy: Policy) => {
    setActivePolicy(policy);
    setHasScrolledToEnd(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToEnd(true);
    }
  };

  const handleConfirmRead = () => {
    if (activePolicy) {
      markPolicyAsRead(activePolicy.id);
      setActivePolicy(null);
    }
  };

  const handleAcknowledgeToggle = (policyId: string) => {
    if (!readPolicyIds.includes(policyId)) return;
    acknowledgePolicy(policyId);
  };

  const handleAcknowledgeAll = () => {
    if (!allRead) return;
    acknowledgeAllPolicies();
  };

  const handleContinue = () => {
    if (!allAcknowledged) return;
    setStepStatus('policies', 'completed');
    onSelectStep('training');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="policies"
        title="Company Policies & Governance"
        description="Review and digitally acknowledge organizational compliance, data protection standards, and codes of conduct."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              {acknowledgedCount} of {totalPolicies} Acknowledged
            </span>
            <StatusBadge status={stepStatus.policies} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* Control bar: Progress + Acknowledge All */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-ink">
              Mandatory Governance Acknowledgment
            </h4>
            <p className="text-xs text-ink-soft">
              {allAcknowledged
                ? 'All 6 policies have been acknowledged.'
                : 'Click "Read Policy" to review. Checkbox unlocks after reading.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!allRead || allAcknowledged}
          onClick={handleAcknowledgeAll}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            allRead && !allAcknowledged
              ? 'bg-primary text-white hover:bg-primary-glow shadow-xs'
              : 'bg-surface-alt text-ink-soft opacity-60 cursor-not-allowed border border-border'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>Acknowledge All ({acknowledgedCount}/{totalPolicies})</span>
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPolicies.map((policy) => {
          const isRead = readPolicyIds.includes(policy.id);
          const isAcknowledged = acknowledgedPolicyIds.includes(policy.id);

          return (
            <div
              key={policy.id}
              className={`p-5 rounded-2xl border transition text-left space-y-3 flex flex-col justify-between ${
                isAcknowledged
                  ? 'bg-surface border-emerald-500/30'
                  : 'bg-surface border-border hover:border-primary/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {policy.category}
                  </span>
                  <span className="text-[11px] text-ink-soft flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {policy.readingTime}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-ink leading-snug">
                  {policy.title}
                </h4>

                <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                  {policy.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPolicy(policy)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isRead ? 'Review Again' : 'Read Policy'}</span>
                </button>

                <label
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold select-none ${
                    isRead ? 'cursor-pointer text-ink' : 'cursor-not-allowed text-ink-soft/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!isRead}
                    checked={isAcknowledged}
                    onChange={() => handleAcknowledgeToggle(policy.id)}
                    className="rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span>Acknowledge</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Banner */}
      {!allAcknowledged && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Please read and acknowledge all 6 policies to continue to orientation modules ({acknowledgedCount}/6 acknowledged).
          </span>
        </div>
      )}

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('bank')}
        backText="Bank & Tax"
        canContinue={allAcknowledged}
        onContinue={handleContinue}
        continueText="Continue to Training"
      />

      {/* Policy Reader Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-ink">{activePolicy.title}</h3>
                  <p className="text-[11px] text-ink-soft">
                    {activePolicy.category} • {activePolicy.version} • Effective: {activePolicy.effectiveDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div
              onScroll={handleScroll}
              className="p-6 overflow-y-auto space-y-4 text-xs text-ink leading-relaxed"
            >
              <div className="p-3.5 rounded-xl bg-surface-alt/60 border border-border text-ink-soft text-[11px]">
                💡 <strong>Reading Requirement:</strong> Scroll to the bottom of this policy text to activate the acknowledgment button.
              </div>

              {activePolicy.content.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}

              <div className="pt-4 border-t border-border/70 text-[11px] text-ink-soft">
                © {new Date().getFullYear()} LetGetIn Enterprise Compliance & Talent Operations. All rights reserved.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-surface-alt/30 shrink-0">
              <span className="text-[11px] text-ink-soft">
                {hasScrolledToEnd ? '✓ Reached document end' : 'Scroll down to confirm reading'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!hasScrolledToEnd}
                  onClick={handleConfirmRead}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    hasScrolledToEnd
                      ? 'bg-primary text-white hover:bg-primary-glow shadow-xs'
                      : 'bg-surface-alt text-ink-soft opacity-60 cursor-not-allowed border border-border'
                  }`}
                >
                  Mark as Read
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
