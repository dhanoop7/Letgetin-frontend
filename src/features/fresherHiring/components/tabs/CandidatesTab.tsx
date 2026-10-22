import React from "react";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherFilterSelect } from "../ui/FresherFilterSelect";
import { FresherPill } from "../ui/FresherPill";
import { FILTERS, STAGE_TONE } from "../../constants/forms";
import type { Candidate } from "../../types";
import {
  Search,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  candidates: Candidate[];
  search: string;
  onSearchChange: (val: string) => void;
  qualification: string;
  onQualificationChange: (val: string) => void;
  stage: string;
  onStageChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  onExport: () => void;
}

export function CandidatesTab({
  candidates,
  search,
  onSearchChange,
  qualification,
  onQualificationChange,
  stage,
  onStageChange,
  location,
  onLocationChange,
  onExport,
}: Props) {
  const columns: FresherColumn<Candidate>[] = [
    {
      header: "Candidate & Details",
      render: (c) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          {c.avatar ? (
            <img
              src={c.avatar}
              alt={c.name}
              className="w-10 h-10 rounded-2xl object-cover ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-glow font-extrabold flex items-center justify-center text-xs shrink-0">
              {c.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-ink group-hover:text-primary-glow transition-colors truncate">
                {c.name}
              </span>
              {c.verified && (
                <span title="Verified Credentials" className="inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft truncate">{c.college}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Degree & Stream",
      render: (c) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-ink">{c.education}</p>
          {c.cgpa && (
            <span className="text-[10px] text-ink-soft font-semibold">
              CGPA {c.cgpa}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Skills",
      render: (c) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {c.skills.split(",").map((s) => (
            <span
              key={s.trim()}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-alt border border-border text-ink-soft"
            >
              {s.trim()}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Assessment Score",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-xs">
            {c.score}
          </span>
        </div>
      ),
    },
    {
      header: "Stage",
      render: (c) => (
        <FresherPill tone={STAGE_TONE[c.stage] || "gray"}>{c.stage}</FresherPill>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      render: (c) => (
        <button
          type="button"
          onClick={() => toast.info(c.actionMessage)}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink hover:text-primary-glow hover:border-primary/40 transition cursor-pointer"
        >
          {c.actionLabel}
        </button>
      ),
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-ink">
            Fresher Candidate Pool
          </h3>
          <p className="text-xs text-ink-soft">
            Explore 2,846 pre-screened graduates with verified college records & scores
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Shortlist</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidate name, skills, target role, or college..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-xs text-ink placeholder:text-ink-soft outline-none focus:border-primary transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <FresherFilterSelect
            label="Qualification"
            value={qualification}
            options={FILTERS.qualification}
            onChange={onQualificationChange}
          />
          <FresherFilterSelect
            label="Stage"
            value={stage}
            options={FILTERS.stage}
            onChange={onStageChange}
          />
          <FresherFilterSelect
            label="Location"
            value={location}
            options={FILTERS.location}
            onChange={onLocationChange}
          />
        </div>
      </div>

      {/* Table */}
      <FresherDataTable
        columns={columns}
        rows={candidates}
        getKey={(c) => c.id}
        emptyText="No fresher candidates match the chosen criteria."
      />
    </div>
  );
}
