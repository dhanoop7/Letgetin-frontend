import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherKpiGrid } from "../ui/FresherKpiCard";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherPill } from "../ui/FresherPill";
import { INTERNSHIP_KPIS } from "../../services/fresherHiringService";
import type { Program } from "../../types";
import { GraduationCap, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  programs: Program[];
  onOpenCreate: () => void;
}

export function InternshipsTab({ programs, onOpenCreate }: Props) {
  const columns: FresherColumn<Program>[] = [
    {
      header: "Internship Program",
      render: (p) => (
        <div>
          <span className="font-extrabold text-ink block group-hover:text-primary-glow transition-colors">
            {p.name}
          </span>
          <span className="text-[11px] text-ink-soft">
            {p.department} • {p.stipend || "Stipend provided"}
          </span>
        </div>
      ),
    },
    {
      header: "Duration",
      render: (p) => <span className="font-semibold text-ink">{p.duration}</span>,
    },
    {
      header: "Applicants",
      render: (p) => (
        <span className="font-bold text-ink">{p.applicants} Applicants</span>
      ),
    },
    {
      header: "Senior Mentors",
      render: (p) => (
        <span className="font-bold text-ink-soft">{p.mentors} Mentors</span>
      ),
    },
    {
      header: "PPO Conversion",
      render: (p) => (
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-xs">
          {p.conversion}
        </span>
      ),
    },
    {
      header: "Status",
      render: (p) => <FresherPill tone={p.status.tone}>{p.status.label}</FresherPill>,
    },
    {
      header: "Action",
      className: "text-right",
      render: (p) => (
        <button
          type="button"
          onClick={() => toast.info(`Managing internship cohort: ${p.name}`)}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink hover:text-primary-glow transition cursor-pointer"
        >
          Manage Cohort
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Internship & PPO Programs"
        description="Launch structured 3 to 6 month graduate internship cohorts, pair applicants with senior mentors, and track permanent PPO conversions."
        icon={GraduationCap}
        action={
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Internship</span>
          </button>
        }
      />

      <FresherKpiGrid items={INTERNSHIP_KPIS} />

      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-ink">Active Internship Tracks</h3>
            <p className="text-xs text-ink-soft">
              Monitor applicant pipelines, mentor capacity, and evaluation milestones
            </p>
          </div>
          <span className="text-xs font-bold text-ink-soft">{programs.length} Active Tracks</span>
        </div>

        <FresherDataTable
          columns={columns}
          rows={programs}
          getKey={(p) => p.id || p.name}
        />
      </div>
    </div>
  );
}
