import React, { ReactNode } from "react";
import type { Tone } from "../../types";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  blue: "bg-primary/10 text-primary-glow border-primary/20",
  orange: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  gray: "bg-surface-alt text-ink-soft border-border",
};

export function FresherPill({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.gray;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
