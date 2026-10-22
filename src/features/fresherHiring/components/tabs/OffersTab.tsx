import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherPipeline, FresherProgressList } from "../ui/FresherProgress";
import { OFFER_PIPELINE, JOINING_RISK } from "../../services/fresherHiringService";
import { FileCheck, PlusCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function OffersTab() {
  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Offer Rollout & Joining Management"
        description="Issue standardized offer letters, track acceptance turnaround, and mitigate student drop-off risk before day 1."
        icon={FileCheck}
        action={
          <button
            type="button"
            onClick={() => toast.info("Bulk offer generator opened")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Offer Letters</span>
          </button>
        }
      />

      {/* Offer Pipeline */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-ink">Offer Conversion Pipeline</h3>
            <p className="text-xs text-ink-soft">
              Current lifecycle of all extended campus offer letters
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
            87.6% Acceptance
          </span>
        </div>
        <FresherPipeline stages={OFFER_PIPELINE} fourCols />
      </div>

      {/* Joining Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Candidate Engagement & Drop-off Risk
              </h3>
              <p className="text-xs text-ink-soft">
                AI engagement telemetry measuring pre-joining risk
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <FresherProgressList items={JOINING_RISK} />
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-ink mb-1">
              Pre-boarding & Buddy Connect
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Automated pre-joining engagement sequences keep fresh graduates connected
              with their team, manager, and buddy before day one.
            </p>

            <div className="space-y-2 mt-4">
              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border text-xs flex items-center justify-between font-bold text-ink">
                <span>Welcome Kit & Welcome Video Sent</span>
                <span className="text-emerald-500">184 Delivered</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border text-xs flex items-center justify-between font-bold text-ink">
                <span>Manager 1-on-1 Coffee Chat Scheduled</span>
                <span className="text-primary-glow">142 Completed</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => toast.success("Automated nudge sent to 19 pending offer holders")}
              className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer text-center"
            >
              Send Pre-Joining Engagement Nudge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
