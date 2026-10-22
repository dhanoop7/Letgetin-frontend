import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherKpiGrid } from "../ui/FresherKpiCard";
import { FresherProgressList } from "../ui/FresherProgress";
import {
  ANALYTICS_KPIS,
  QUALITY_OF_HIRE,
  SOURCE_EFFECTIVENESS,
} from "../../services/fresherHiringService";
import { BarChart3, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Fresher Talent Insights & Analytics"
        description="Comprehensive intelligence on recruitment velocity, cost efficiency, university source effectiveness, and post-hire retention."
        icon={BarChart3}
        action={
          <button
            type="button"
            onClick={() => toast.success("Campus hiring executive analytics report generated (PDF)")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics Report</span>
          </button>
        }
      />

      <FresherKpiGrid items={ANALYTICS_KPIS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Effectiveness */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                University & Sourcing Channel ROI
              </h3>
              <p className="text-xs text-ink-soft">
                Yield percentage across university drives & marketplace
              </p>
            </div>
            <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-xl">
              2026 Batch
            </span>
          </div>
          <FresherProgressList items={SOURCE_EFFECTIVENESS} />
        </div>

        {/* Quality of Hire */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Quality of Hire & Manager Ratings
              </h3>
              <p className="text-xs text-ink-soft">
                Performance indices measured over the first 90 days
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
              High Performing
            </span>
          </div>
          <FresherProgressList items={QUALITY_OF_HIRE} />
        </div>
      </div>
    </div>
  );
}
