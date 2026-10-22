'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';

interface StepFooterProps {
  onBack?: () => void;
  backText?: string;
  canContinue?: boolean;
  onContinue: () => void;
  continueText?: string;
  isSubmitting?: boolean;
  saveStatus?: 'saved' | 'saving' | null;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  onBack,
  backText = 'Back',
  canContinue = true,
  onContinue,
  continueText = 'Save & Continue',
  isSubmitting = false,
  saveStatus,
}) => {
  return (
    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backText}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {saveStatus === 'saving' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Save className="w-3 h-3 animate-pulse" />
            <span>Autosaving...</span>
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="w-3 h-3" />
            <span>Saved</span>
          </span>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-elegant transition cursor-pointer ${
            canContinue && !isSubmitting
              ? 'bg-gradient-brand text-white hover:shadow-glow hover:scale-101'
              : 'bg-surface-alt text-ink-soft opacity-60 cursor-not-allowed border border-border'
          }`}
        >
          <span>{continueText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
