import React, { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function FresherEmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  action,
}: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[220px]">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-extrabold text-base text-ink">{title}</h3>
      <p className="text-xs text-ink-soft max-w-md leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
