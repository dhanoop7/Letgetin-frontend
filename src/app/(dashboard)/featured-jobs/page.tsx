"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { jobService } from "@/features/jobs/services/jobService";
import {
  IJob,
  JobFilterParams,
  WorkplaceType,
  ExperienceLevel,
  EmploymentType,
} from "@/features/jobs/types/job.types";
import { DUMMY_FEATURED_JOBS } from "@/features/jobs/data/mockExploreJobs";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobDetailDrawer } from "@/features/jobs/components/JobDetailDrawer";
import { JobApplyModal } from "@/features/jobs/components/JobApplyModal";
import { AIChat } from "@/features/aiAssistant/components/AIChat";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ArrowLeft,
  Briefcase,
  Layers,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { applicationService } from "@/features/applications/services/applicationService";

export default function FeaturedJobsPage() {
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<IJob | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumebuildai_applied_jobs");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedSourceMap, setAppliedSourceMap] = useState<
    Record<string, "ai_apply" | "manual">
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const recordsStr = localStorage.getItem(
          "resumebuildai_applied_records",
        );
        const records: any[] = recordsStr ? JSON.parse(recordsStr) : [];
        const map: Record<string, "ai_apply" | "manual"> = {};
        records.forEach((r) => {
          const id = r.job?._id || r.jobId;
          if (id) {
            map[id] = r.source === "ai_apply" ? "ai_apply" : "manual";
          }
        });
        return map;
      } catch {
        return {};
      }
    }
    return {};
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumebuildai_saved_jobs");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [filters, setFilters] = useState<JobFilterParams>({
    page: 1,
    limit: 16,
    sort: "recommended",
    workplaceType: "all",
    experienceLevel: "all",
    employmentType: "all",
    search: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      if (typeof window !== "undefined") {
        localStorage.setItem("resumebuildai_saved_jobs", JSON.stringify(next));
      }
      return next;
    });
  };

  const handleApplicationSuccess = (
    jobId: string,
    appliedJob?: IJob | null,
    createdApp?: any,
  ) => {
    setAppliedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev : [...prev, jobId];
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "resumebuildai_applied_jobs",
          JSON.stringify(next),
        );
      }
      return next;
    });
    showToast("Application submitted successfully and saved!");
  };

  const handleOpenApplyModal = (job: IJob) => {
    setJobToApply(job);
    setIsApplyModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 16,
      sort: "recommended",
      workplaceType: "all",
      experienceLevel: "all",
      employmentType: "all",
      search: "",
      minScore: undefined,
    });
  };

  const filteredJobs = useMemo(() => {
    let list: IJob[] = DUMMY_FEATURED_JOBS;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)) ||
          (j.location.city && j.location.city.toLowerCase().includes(q)),
      );
    }

    if (filters.workplaceType && filters.workplaceType !== "all") {
      list = list.filter((j) => j.workplaceType === filters.workplaceType);
    }

    if (filters.experienceLevel && filters.experienceLevel !== "all") {
      list = list.filter((j) => j.experienceLevel === filters.experienceLevel);
    }

    if (filters.employmentType && filters.employmentType !== "all") {
      list = list.filter((j) => j.employmentType === filters.employmentType);
    }

    if (filters.minScore) {
      list = list.filter((j) => (j.matchScore || 0) >= (filters.minScore || 0));
    }

    if (filters.sort === "recent") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } else if (filters.sort === "salary") {
      list = [...list].sort(
        (a, b) => (b.salary?.max || 0) - (a.salary?.max || 0),
      );
    } else {
      list = [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return list;
  }, [filters]);

  const workplaceOptions: Array<{
    label: string;
    value: WorkplaceType | "all";
  }> = [
    { label: "All", value: "all" },
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Onsite", value: "onsite" },
  ];

  const experienceOptions: Array<{
    label: string;
    value: ExperienceLevel | "all";
  }> = [
    { label: "All Levels", value: "all" },
    { label: "Junior (1-2y)", value: "junior" },
    { label: "Mid-Level (3-5y)", value: "mid" },
    { label: "Senior (5+y)", value: "senior" },
    { label: "Lead / Staff", value: "lead" },
  ];

  const employmentOptions: Array<{
    label: string;
    value: EmploymentType | "all";
  }> = [
    { label: "All Types", value: "all" },
    { label: "Full-time", value: "full-time" },
    { label: "Part-time", value: "part-time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
  ];

  const hasActiveFilters =
    !!filters.search ||
    (filters.workplaceType && filters.workplaceType !== "all") ||
    (filters.experienceLevel && filters.experienceLevel !== "all") ||
    (filters.employmentType && filters.employmentType !== "all") ||
    (filters.minScore && filters.minScore > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1780px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5345ec] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            <Link
              href="/explore"
              className="hover:text-primary transition flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>
            <span>/</span>
            <span className="text-ink">Featured Jobs</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              All Featured Jobs
            </h1>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {filteredJobs.length} Positions Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft">
            Comprehensive list of high-priority featured roles with verified direct-apply pipelines.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 bg-surface-alt hover:bg-secondary border border-border px-4 py-2 rounded-xl text-xs font-bold text-ink transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-ink-soft" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              placeholder="Search featured roles by title, skill (React, Python, AWS), company..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink placeholder:text-ink-soft/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, search: "", page: 1 })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative min-w-[180px]">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.sort || "recommended"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sort: e.target.value as any,
                  page: 1,
                })
              }
              aria-label="Sort jobs"
              className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
            >
              <option value="recommended">Best AI Match</option>
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-ink-soft mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters:
          </span>

          {workplaceOptions.map((opt) => {
            const isSelected = (filters.workplaceType || "all") === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    workplaceType: opt.value,
                    page: 1,
                  })
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-alt text-ink border-border hover:bg-secondary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                minScore: filters.minScore === 80 ? undefined : 80,
                page: 1,
              })
            }
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1 cursor-pointer ${
              filters.minScore === 80
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-surface-alt text-emerald-700 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>High Match (80%+)</span>
          </button>

          <select
            value={filters.experienceLevel || "all"}
            onChange={(e) =>
              setFilters({
                ...filters,
                experienceLevel: e.target.value as any,
                page: 1,
              })
            }
            aria-label="Filter by experience level"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-surface-alt text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {experienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filters.employmentType || "all"}
            onChange={(e) =>
              setFilters({
                ...filters,
                employmentType: e.target.value as any,
                page: 1,
              })
            }
            aria-label="Filter by employment type"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-surface-alt text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {employmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border text-ink-soft hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition cursor-pointer ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of All Featured Jobs */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.includes(job._id);
            const isSaved = savedJobIds.includes(job._id);

            return (
              <JobCard
                key={job._id}
                job={job}
                isSelected={selectedJob?._id === job._id}
                onSelect={(j) => setSelectedJob(j)}
                isSaved={isSaved}
                onToggleSave={handleToggleSave}
                isApplied={isApplied}
                appliedSource={
                  appliedSourceMap[job._id] ||
                  (isApplied ? "manual" : undefined)
                }
                layoutMode="grid"
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-ink">
            No matching featured jobs
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed">
            Try adjusting your search query or reset your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 bg-primary text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-primary-deep transition shadow-xs cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Slide-over Drawer for Job Details */}
      <JobDetailDrawer
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob._id) : false}
        onToggleSave={handleToggleSave}
        onStartApplication={handleOpenApplyModal}
        isApplied={selectedJob ? appliedJobIds.includes(selectedJob._id) : false}
      />

      {/* Multi-Step Application Modal */}
      <JobApplyModal
        isOpen={isApplyModalOpen}
        job={jobToApply}
        allJobs={filteredJobs}
        onClose={() => {
          setIsApplyModalOpen(false);
          setJobToApply(null);
        }}
        onSuccess={handleApplicationSuccess}
      />

      {/* Contextual AI Assistant */}
      <AIChat
        context="explore"
        contextPayload={{ selectedJobId: selectedJob?._id }}
      />
    </div>
  );
}
