import React from "react";
import type { PipelineStage, ProgressItem } from "../../types";

export function FresherProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i.id} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">{i.label}</span>
            <span className="font-bold text-ink-soft">{i.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                i.color || "bg-primary"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, i.percent))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FresherPipeline({
  stages,
  fourCols = false,
}: {
  stages: PipelineStage[];
  fourCols?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 ${
        fourCols
          ? "grid-cols-2 lg:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      }`}
    >
      {stages.map((s, idx) => (
        <div
          key={s.id}
          className="p-3.5 sm:p-4 rounded-2xl bg-surface-alt/60 border border-border flex flex-col justify-between space-y-2.5 relative group hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-ink-soft uppercase tracking-wider">
              Step {idx + 1}
            </span>
            {s.percent !== undefined && (
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                {s.percent}%
              </span>
            )}
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-ink">{s.value}</div>
            <p className="text-xs font-bold text-ink-soft mt-0.5">{s.label}</p>
            {s.subtext && (
              <p className="text-[10px] text-ink-soft/80 mt-1 line-clamp-1">{s.subtext}</p>
            )}
          </div>
          {s.percent !== undefined && (
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-brand rounded-full transition-all duration-500"
                style={{ width: `${s.percent}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
