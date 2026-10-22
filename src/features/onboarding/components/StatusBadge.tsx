'use client';

import React from 'react';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { StepStatus } from '../types';

interface StatusBadgeProps {
  status: StepStatus;
  isLocked?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isLocked = false,
  size = 'sm',
}) => {
  if (isLocked) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full border bg-surface-alt text-ink-soft border-border ${
          size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
        }`}
      >
        <Lock className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        <span>Locked</span>
      </span>
    );
  }

  switch (status) {
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 ${
            size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
          }`}
        >
          <CheckCircle2 className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
          <span>Completed</span>
        </span>
      );
    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ${
            size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
          }`}
        >
          <Clock className={size === 'md' ? 'w-3.5 h-3.5 animate-spin' : 'w-3 h-3 animate-spin'} />
          <span>In Progress</span>
        </span>
      );
    case 'not_started':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full border bg-primary/10 text-primary border-primary/20 ${
            size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
          }`}
        >
          <span>Available</span>
        </span>
      );
  }
};
