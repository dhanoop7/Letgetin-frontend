import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherProgressList } from "../ui/FresherProgress";
import {
  APPRENTICESHIP_PIPELINE,
  PROGRAM_CONTROLS,
} from "../../services/fresherHiringService";
import { Wrench, PlusCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onOpenCreate: () => void;
}

export function ApprenticeshipsTab({ onOpenCreate }: Props) {
  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Apprenticeship & NATS Workforce"
        description="Manage learn-and-earn structured apprenticeship cohorts, statutory verification, training logbooks, and permanent conversion."
        icon={Wrench}
        action={
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Apprenticeship</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apprenticeship Pipeline Progress */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Apprenticeship Intake Pipeline
              </h3>
              <p className="text-xs text-ink-soft">
                Cohort progression from statutory check to permanent hire
              </p>
            </div>
            <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-xl">
              NATS Compliant
            </span>
          </div>
          <FresherProgressList items={APPRENTICESHIP_PIPELINE} />
        </div>

        {/* Program Controls & Compliance Checklist */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Apprenticeship Governance Controls
              </h3>
              <p className="text-xs text-ink-soft">Automated quality & statutory checkpoints</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="space-y-2.5">
            {PROGRAM_CONTROLS.map((control) => (
              <div
                key={control}
                className="p-3.5 rounded-2xl bg-surface-alt/60 border border-border flex items-center gap-3 text-xs font-bold text-ink hover:bg-surface-alt transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{control}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => toast.info("Audit log & compliance dossier downloaded")}
              className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer text-center"
            >
              Download NATS Compliance Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
