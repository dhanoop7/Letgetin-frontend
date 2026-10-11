import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherFilterSelect } from "../ui/FresherFilterSelect";
import { FresherPill } from "../ui/FresherPill";
import { FILTERS } from "../../constants/forms";
import type { Drive } from "../../types";
import {
  Building2,
  Calendar,
  MapPin,
  PlusCircle,
  Search,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  drives: Drive[];
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  collegeType: string;
  onCollegeTypeChange: (val: string) => void;
  onOpenCreate: () => void;
}

export function DrivesTab({
  drives,
  search,
  onSearchChange,
  status,
  onStatusChange,
  collegeType,
  onCollegeTypeChange,
  onOpenCreate,
}: Props) {
  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Campus Recruitment & Placement Drives"
        description="Partner with premier university campuses, coordinate placement schedules, and manage on-campus selection slots."
        icon={Building2}
        action={
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campus Drive</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campus drive name, college or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-xs text-ink placeholder:text-ink-soft outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FresherFilterSelect
            label="Drive Status"
            value={status}
            options={FILTERS.driveStatus}
            onChange={onStatusChange}
          />
          <FresherFilterSelect
            label="College Type"
            value={collegeType}
            options={FILTERS.college}
            onChange={onCollegeTypeChange}
          />
        </div>
      </div>

      {/* Drives Cards */}
      <div className="space-y-4">
        {drives.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-dashed border-border text-ink-soft text-xs">
            No campus drives match the selected filters.
          </div>
        ) : (
          drives.map((d) => (
            <div
              key={d.id}
              className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs hover:border-primary/40 transition-all space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-base font-extrabold text-ink group-hover:text-primary-glow transition-colors">
                      {d.title}
                    </h4>
                    <FresherPill tone={d.status.tone}>{d.status.label}</FresherPill>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">{d.detail}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toast.info(`Managing drive: ${d.title}`)}
                  className="self-start px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink hover:text-primary-glow transition cursor-pointer"
                >
                  Manage Drive
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {d.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-2xl bg-surface-alt/60 border border-border/70 space-y-0.5"
                  >
                    <p className="text-base sm:text-lg font-black text-ink">{m.value}</p>
                    <span className="text-[10.5px] font-semibold text-ink-soft block truncate">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
