import React from "react";
import { FresherKpiGrid } from "../ui/FresherKpiCard";
import { FresherPipeline, FresherProgressList } from "../ui/FresherProgress";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherPill } from "../ui/FresherPill";
import { FresherQuickCard } from "../ui/FresherQuickCard";
import { STAGE_TONE } from "../../constants/forms";
import { QUICK_LINKS } from "../../constants/navigation";
import {
  OVERVIEW_KPIS,
  HIRING_PIPELINE,
  HIRING_MIX,
  EVENTS,
} from "../../services/fresherHiringService";
import type { Candidate, FresherTab } from "../../types";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  candidates: Candidate[];
  onNavigateTab: (tab: FresherTab) => void;
}

export function OverviewTab({ candidates, onNavigateTab }: Props) {
  const candidateColumns: FresherColumn<Candidate>[] = [
    {
      header: "Candidate",
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.avatar ? (
            <img
              src={c.avatar}
              alt={c.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-glow font-extrabold flex items-center justify-center text-xs">
              {c.initials}
            </div>
          )}
          <div>
            <p className="font-extrabold text-ink">{c.name}</p>
            <p className="text-[10.5px] text-ink-soft">{c.college}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Qualification",
      render: (c) => <span className="text-ink">{c.education}</span>,
    },
    {
      header: "Target Role",
      render: (c) => (
        <span className="font-semibold text-primary-glow">{c.target}</span>
      ),
    },
    {
      header: "Score",
      render: (c) => (
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px]">
          {c.score}
        </span>
      ),
    },
    {
      header: "Pipeline Stage",
      render: (c) => (
        <FresherPill tone={STAGE_TONE[c.stage] || "gray"}>{c.stage}</FresherPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <FresherKpiGrid items={OVERVIEW_KPIS} />

      {/* Grid: Pipeline & Hiring Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-ink">
                Fresher Hiring Funnel & Milestones
              </h3>
              <p className="text-xs text-ink-soft">
                Live status of campus applicants across all screening gates
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-glow bg-primary/10 px-3 py-1 rounded-xl">
              2026-27 Intake Cycle
            </span>
          </div>
          <FresherPipeline stages={HIRING_PIPELINE} />
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-ink">
                  Early-Career Intake Mix
                </h3>
                <p className="text-xs text-ink-soft">Distribution across program models</p>
              </div>
            </div>
            <FresherProgressList items={HIRING_MIX} />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-ink-soft">Total Target Quota:</span>
            <span className="font-extrabold text-ink">450 Freshers</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Candidates & Upcoming Campus Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates Table */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-ink">
                Recent Fresher Candidates
              </h3>
              <p className="text-xs text-ink-soft">
                Pre-screened applicants ready for immediate assessment
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("candidates")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-glow hover:underline cursor-pointer"
            >
              <span>View All 2,846</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <FresherDataTable
            columns={candidateColumns}
            rows={candidates.slice(0, 4)}
            getKey={(c) => c.id}
          />
        </div>

        {/* Campus Activities Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-ink">
                Campus Activities
              </h3>
              <p className="text-xs text-ink-soft">Upcoming university hiring drives</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("drives")}
              className="text-xs font-bold text-primary-glow hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {EVENTS.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-2xl bg-surface-alt/60 border border-border flex items-start gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-black flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-sm leading-none">{e.day}</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-80">
                    {e.month}
                  </span>
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-extrabold text-ink truncate">{e.title}</h4>
                  <p className="text-[11px] text-ink-soft line-clamp-2">{e.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-ink">
            Quick Modules & Hiring Pipelines
          </h3>
          <span className="text-xs text-ink-soft">Direct access to specialized workflows</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((q) => (
            <FresherQuickCard
              key={q.tab}
              icon={q.icon}
              title={q.title}
              description={q.description}
              badge={q.badge}
              onClick={() => onNavigateTab(q.tab)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
