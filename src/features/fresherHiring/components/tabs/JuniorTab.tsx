import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherPill } from "../ui/FresherPill";
import type { JuniorRole } from "../../types";
import { Sparkles, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  juniorRoles: JuniorRole[];
  onOpenCreate: () => void;
}

export function JuniorTab({ juniorRoles, onOpenCreate }: Props) {
  const columns: FresherColumn<JuniorRole>[] = [
    {
      header: "Role Title",
      render: (r) => (
        <div>
          <span className="font-extrabold text-ink block group-hover:text-primary-glow transition-colors">
            {r.title}
          </span>
          <span className="text-[11px] text-ink-soft">
            {r.department} • {r.salary || "Market Standard"}
          </span>
        </div>
      ),
    },
    {
      header: "Experience Bracket",
      render: (r) => (
        <span className="font-bold text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-lg text-xs">
          {r.experience}
        </span>
      ),
    },
    {
      header: "Location",
      render: (r) => <span className="font-semibold text-ink">{r.location}</span>,
    },
    {
      header: "Applicants",
      render: (r) => (
        <span className="font-bold text-ink">{r.applicants} Applicants</span>
      ),
    },
    {
      header: "Status",
      render: (r) => <FresherPill tone={r.status.tone}>{r.status.label}</FresherPill>,
    },
    {
      header: "Action",
      className: "text-right",
      render: (r) => (
        <button
          type="button"
          onClick={() => toast.info(`Managing applicants for ${r.title}`)}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink hover:text-primary-glow transition cursor-pointer"
        >
          Manage Role
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Junior Lateral & Early-Career Hiring"
        description="Source high-potential candidates with 0 to 2 years of work experience across engineering, design, marketing, and operations."
        icon={Sparkles}
        action={
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Junior Role</span>
          </button>
        }
      />

      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-ink">Active Junior Positions</h3>
            <p className="text-xs text-ink-soft">
              Early-career openings with structured onboarding paths
            </p>
          </div>
          <span className="text-xs font-bold text-ink-soft">
            {juniorRoles.length} Open Positions
          </span>
        </div>

        <FresherDataTable
          columns={columns}
          rows={juniorRoles}
          getKey={(r) => r.id || r.title}
        />
      </div>
    </div>
  );
}
