import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherPill } from "../ui/FresherPill";
import type { Job } from "../../types";
import { Briefcase, PlusCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface Props {
  jobs: Job[];
  onOpenCreate: () => void;
}

export function JobsTab({ jobs, onOpenCreate }: Props) {
  const columns: FresherColumn<Job>[] = [
    {
      header: "Opportunity Title",
      render: (j) => (
        <div>
          <span className="font-extrabold text-ink group-hover:text-primary-glow transition-colors block">
            {j.title}
          </span>
          <span className="text-[11px] text-ink-soft">
            {j.department || "Engineering"} • {j.location || "Bengaluru / Hybrid"}
          </span>
        </div>
      ),
    },
    {
      header: "Intake Model",
      render: (j) => <span className="font-semibold text-ink">{j.type}</span>,
    },
    {
      header: "Eligible Qualification",
      render: (j) => <span className="text-ink-soft">{j.qualification}</span>,
    },
    {
      header: "Package / CTC",
      render: (j) => (
        <span className="font-bold text-ink">{j.salary || "Competitive"}</span>
      ),
    },
    {
      header: "Applications",
      render: (j) => (
        <span className="font-extrabold text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-lg text-xs">
          {j.applications} Applicants
        </span>
      ),
    },
    {
      header: "Status",
      render: (j) => <FresherPill tone={j.status.tone}>{j.status.label}</FresherPill>,
    },
    {
      header: "Action",
      className: "text-right",
      render: (j) => (
        <button
          type="button"
          onClick={() => toast.info(`Viewing applicant pipeline for ${j.title}`)}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink hover:text-primary-glow transition cursor-pointer"
        >
          View Pipeline
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Fresher Job Opportunities"
        description="Publish entry-level positions, graduate training batches, and associate opportunities across hiring channels."
        icon={Briefcase}
        action={
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Fresher Job</span>
          </button>
        }
      />

      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-ink">Active Fresher Roles</h3>
            <p className="text-xs text-ink-soft">Track real-time applicant volume and screening</p>
          </div>
          <span className="text-xs font-bold text-ink-soft">{jobs.length} Active Openings</span>
        </div>

        <FresherDataTable
          columns={columns}
          rows={jobs}
          getKey={(j) => j.id || j.title}
        />
      </div>
    </div>
  );
}
