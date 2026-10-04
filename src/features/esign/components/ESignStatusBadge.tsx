'use client';

import React from 'react';
import { ConsentStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface ESignStatusBadgeProps {
  status: ConsentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ESignStatusBadge: React.FC<ESignStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const config = {
    PENDING: {
      label: 'Pending Consent',
      icon: Clock,
      className:
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dotClass: 'bg-amber-500',
    },
    SUBMITTED: {
      label: 'Submitted',
      icon: CheckCircle2,
      className:
        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotClass: 'bg-blue-500',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      icon: FileCheck2,
      className:
        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      dotClass: 'bg-indigo-500 animate-pulse',
    },
    APPROVED: {
      label: 'Approved',
      icon: CheckCircle2,
      className:
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-500',
    },
    REJECTED: {
      label: 'Rejected',
      icon: XCircle,
      className:
        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dotClass: 'bg-rose-500',
    },
  }[status] || {
    label: 'Pending Consent',
    icon: Clock,
    className:
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-500',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs font-semibold gap-2',
    lg: 'px-4 py-2 text-sm font-bold gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-all ${config.className} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
};
