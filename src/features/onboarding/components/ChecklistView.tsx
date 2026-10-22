'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Laptop,
  Users,
  Building,
  ShieldCheck,
  Send,
  PartyPopper,
  Check,
  X,
} from 'lucide-react';
import { StepId, ChecklistItem } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface ChecklistViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ onSelectStep }) => {
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const checklist = useCandidateOnboardingStore((state) => state.checklist);
  const toggleChecklistItem = useCandidateOnboardingStore((state) => state.toggleChecklistItem);
  const isSubmitted = useCandidateOnboardingStore((state) => state.isSubmitted);
  const submitOnboarding = useCandidateOnboardingStore((state) => state.submitOnboarding);
  const candidate = useCandidateOnboardingStore((state) => state.candidate);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.isCompleted).length;
  const percentage = Math.round((completedItems / totalItems) * 100);
  const isAllChecklistDone = completedItems === totalItems;

  const handleToggle = (item: ChecklistItem) => {
    toggleChecklistItem(item.id);
  };

  const handleConfirmSubmit = () => {
    submitOnboarding();
    setIsConfirmOpen(false);
    setShowCelebration(true);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    IT: <Laptop className="w-3.5 h-3.5" />,
    Team: <Users className="w-3.5 h-3.5" />,
    HR: <ShieldCheck className="w-3.5 h-3.5" />,
    Workspace: <Building className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="checklist"
        title="Day-1 Readiness & Final Submission"
        description="Verify your first-day schedule, hardware deliveries, and complete final submission of your onboarding dossier."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              {completedItems} of {totalItems} Ready
            </span>
            <StatusBadge status={stepStatus.checklist} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* Progress Card */}
      <div
        className={`p-6 rounded-3xl border transition-all duration-300 ${
          isAllChecklistDone
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl'
            : 'bg-surface border-border shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isAllChecklistDone ? 'text-emerald-100' : 'text-primary'
                }`}
              >
                Day-1 Preparedness Score
              </span>
              {isAllChecklistDone && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  100% Completed
                </span>
              )}
            </div>

            <h3
              className={`text-xl sm:text-2xl font-black ${
                isAllChecklistDone ? 'text-white' : 'text-ink'
              }`}
            >
              {isAllChecklistDone ? '🎉 All Day-1 Tasks Completed!' : `${percentage}% Ready for Day 1`}
            </h3>

            <p
              className={`text-xs leading-relaxed max-w-lg ${
                isAllChecklistDone ? 'text-white/90' : 'text-ink-soft'
              }`}
            >
              {isAllChecklistDone
                ? 'Your welcome checklist is 100% satisfied. Submit your dossier to finalize candidate induction.'
                : 'Check off each operational item as you complete setup before your official start date.'}
            </p>
          </div>

          <div className="shrink-0">
            {isSubmitted ? (
              <div className="px-4 py-2.5 rounded-2xl bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Onboarding Submitted!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
                  isAllChecklistDone
                    ? 'bg-white text-emerald-800 hover:bg-white/90 shadow-lg'
                    : 'bg-primary text-white hover:bg-primary-glow'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Onboarding Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAllChecklistDone ? 'bg-white' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider">
          Day-1 Operational Tasks
        </h3>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item)}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer select-none ${
                item.isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-surface border-border hover:border-primary/40'
              }`}
            >
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer"
              />

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft">
                    {categoryIcons[item.category]}
                    <span>{item.category}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-primary">{item.dueDate}</span>
                  <h4
                    className={`text-xs sm:text-sm font-bold truncate ${
                      item.isCompleted ? 'text-ink-soft line-through' : 'text-ink'
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('team')}
        backText="Team"
        canContinue={true}
        onContinue={() => onSelectStep('dashboard')}
        continueText="Return to Dashboard"
      />

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">Submit Onboarding Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-ink leading-relaxed">
              <p>
                You are about to formally submit your completed onboarding records to{' '}
                <strong>{candidate.company}</strong> People Operations.
              </p>
              <ul className="list-disc pl-4 text-ink-soft space-y-1 pt-1">
                <li>Signed Employment Agreement</li>
                <li>Verified Government & Academic Credentials</li>
                <li>Bank Disbursement & Tax Slabs</li>
                <li>Signed IT Security & Ethics Policies</li>
                <li>Completed Orientation Modules & Day-1 Checklist</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant hover:shadow-glow transition cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <PartyPopper className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-ink">Congratulations, {candidate.name}! 🚀</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Your candidate onboarding dossier has been verified and registered with{' '}
                <strong>{candidate.company}</strong>. We look forward to seeing you on Day 1!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCelebration(false);
                  onSelectStep('dashboard');
                }}
                className="w-full px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant transition cursor-pointer"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
