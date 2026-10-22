'use client';

import React from 'react';
import { LayoutDashboard, CheckCircle2, Lock, Clock } from 'lucide-react';
import { StepId, StepProgressState } from '../types';
import { STEP_ORDER, STEP_CONFIG } from '../lib/constants';
import { isStepLocked } from '../store/useCandidateOnboardingStore';

interface OnboardingStepNavProps {
  activeStep: 'dashboard' | StepId;
  stepStatus: StepProgressState;
  onSelectStep: (step: 'dashboard' | StepId) => void;
}

export const OnboardingStepNav: React.FC<OnboardingStepNavProps> = ({
  activeStep,
  stepStatus,
  onSelectStep,
}) => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
      {/* Dashboard Overview Tab */}
      <button
        type="button"
        onClick={() => onSelectStep('dashboard')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
          activeStep === 'dashboard'
            ? 'bg-gradient-brand text-white shadow-elegant'
            : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
        }`}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </button>

      <div className="w-px h-4 bg-border mx-1 shrink-0" />

      {/* 8 Candidate Steps */}
      {STEP_ORDER.map((stepId) => {
        const meta = STEP_CONFIG[stepId];
        const status = stepStatus[stepId];
        const locked = isStepLocked(stepId, stepStatus);
        const isActive = activeStep === stepId;

        return (
          <button
            key={stepId}
            type="button"
            disabled={locked}
            onClick={() => onSelectStep(stepId)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-primary text-white shadow-xs'
                : locked
                  ? 'text-ink-soft/40 cursor-not-allowed'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt cursor-pointer'
            }`}
          >
            {status === 'completed' ? (
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}
              />
            ) : locked ? (
              <Lock className="w-3.5 h-3.5 text-ink-soft/40" />
            ) : status === 'in_progress' ? (
              <Clock
                className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-500'}`}
              />
            ) : (
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-alt text-ink-soft'
                }`}
              >
                {meta.stepNumber}
              </span>
            )}
            <span>{meta.shortTitle}</span>
          </button>
        );
      })}
    </div>
  );
};
