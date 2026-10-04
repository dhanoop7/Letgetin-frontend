'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ConsentConfirmationCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ConsentConfirmationCheckbox: React.FC<
  ConsentConfirmationCheckboxProps
> = ({ checked, onChange, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`p-5 rounded-3xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
        checked
          ? 'bg-primary/5 border-primary/40 shadow-xs'
          : 'bg-surface border-border hover:border-border/80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="pt-0.5 shrink-0">
        <div
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            checked
              ? 'bg-gradient-brand border-primary text-primary-foreground shadow-glow'
              : 'border-border bg-surface hover:border-primary-glow/60'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <label
          htmlFor="consent-checkbox"
          className="text-xs font-semibold text-ink leading-relaxed cursor-pointer block"
        >
          I have read and understood the consent above, and I voluntarily
          authorize the company to verify my submitted certificates and
          documents and process them for recruitment, verification, and
          onboarding purposes in accordance with applicable company policies.
        </label>
        <p className="text-[11px] text-ink-soft">
          By checking this box, you confirm this digital authorization serves as your
          binding electronic acknowledgment.
        </p>
      </div>
    </div>
  );
};
