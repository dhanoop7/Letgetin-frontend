import React, { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function FresherPageHeader({
  title,
  description,
  badge,
  icon: Icon,
  action,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          {Icon && <Icon className="w-6 h-6 text-primary-glow shrink-0" />}
          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-[11px] font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-ink-soft max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
