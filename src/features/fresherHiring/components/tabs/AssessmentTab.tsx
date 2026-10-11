import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherProgressList } from "../ui/FresherProgress";
import { FresherQuickCard } from "../ui/FresherQuickCard";
import {
  ASSESSMENT_PERFORMANCE,
  ASSESSMENT_TILES,
} from "../../services/fresherHiringService";
import { CheckCircle2, PlusCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AssessmentTab() {
  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Fresher Tests & Automated Assessments"
        description="Configure customized screening modules, proctored coding sandboxes, cognitive aptitude tests, and AI behavioral evaluations."
        icon={CheckCircle2}
        action={
          <button
            type="button"
            onClick={() => toast.info("New assessment test creator opened")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Test Suite</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Categories */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Evaluation Test Modules
              </h3>
              <p className="text-xs text-ink-soft">
                Pre-configured assessments calibrated for entry-level candidates
              </p>
            </div>
            <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-xl">
              AI-Proctored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ASSESSMENT_TILES.map((t) => (
              <FresherQuickCard
                key={t.id}
                icon={t.icon}
                title={t.title}
                description={t.description}
                badge={t.category}
                onClick={() =>
                  toast.info(`Opening assessment configuration for: ${t.title}`)
                }
              />
            ))}
          </div>
        </div>

        {/* Assessment Performance Metrics */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-extrabold text-ink">
                  Batch 2026 Test Benchmark
                </h3>
                <p className="text-xs text-ink-soft">Average candidate test outcomes</p>
              </div>
            </div>
            <FresherProgressList items={ASSESSMENT_PERFORMANCE} />
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => toast.info("Comprehensive assessment rubric exported")}
              className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer text-center"
            >
              Export Assessment Rubric & Cutoffs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
