'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-primary/10 text-primary',
}) => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm ${iconBgColor}`}
      >
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-semibold text-ink-soft">{title}</p>
        <h4 className="text-lg sm:text-xl font-black text-ink truncate">{value}</h4>
        {subtitle && <p className="text-[11px] text-ink-soft truncate">{subtitle}</p>}
      </div>
    </div>
  );
};
