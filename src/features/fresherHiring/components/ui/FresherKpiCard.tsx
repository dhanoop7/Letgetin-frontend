import React from "react";
import type { Kpi } from "../../types";

export function FresherKpiCard({ label, icon: Icon, value, trend, description }: Kpi) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between text-ink-soft mb-2">
        <span className="text-xs font-bold text-ink-soft group-hover:text-ink transition-colors">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-primary-glow group-hover:bg-primary/10 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-black text-ink tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
              {trend}
            </span>
          </div>
        )}
        {description && (
          <p className="text-[11px] text-ink-soft pt-1 line-clamp-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export function FresherKpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map((k) => (
        <FresherKpiCard key={k.id} {...k} />
      ))}
    </div>
  );
}
