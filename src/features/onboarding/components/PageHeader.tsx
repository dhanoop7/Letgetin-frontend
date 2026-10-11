'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { StepId } from '../types';
import { STEP_CONFIG } from '../lib/constants';

interface PageHeaderProps {
  stepId?: StepId;
  title: string;
  description: string;
  badge?: React.ReactNode;
  onBackToDashboard?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  stepId,
  title,
  description,
  badge,
  onBackToDashboard,
}) => {
  const meta = stepId ? STEP_CONFIG[stepId] : null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-primary transition cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}

          {meta && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Step {meta.stepNumber} of 8
            </span>
          )}
          <h1 className="text-base sm:text-lg font-black text-ink tracking-tight">{title}</h1>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed max-w-2xl">{description}</p>
      </div>

      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  );
};
