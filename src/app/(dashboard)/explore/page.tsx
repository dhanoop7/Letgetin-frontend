"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { jobService } from "@/features/jobs/services/jobService";

import {
  IJob,
  JobFilterParams,
  CandidateProfileSummary,
  WorkplaceType,
  ExperienceLevel,
  EmploymentType,
} from "@/features/jobs/types/job.types";
import {
  DUMMY_FEATURED_JOBS,
  DUMMY_RECENT_JOBS,
  DUMMY_NORMAL_JOBS,
} from "@/features/jobs/data/mockExploreJobs";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobDetailDrawer } from "@/features/jobs/components/JobDetailDrawer";
import { JobApplyModal } from "@/features/jobs/components/JobApplyModal";
import { ExploreHero } from "@/features/jobs/components/ExploreHero";
import { AIChat } from "@/features/aiAssistant/components/AIChat";
import {
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Briefcase,
  MapPin,
  Building2,
  Send,
  Zap,
  Banknote,
  ChevronsRight,
} from "lucide-react";

import { applicationService } from "@/features/applications/services/applicationService";

const AVATAR_BG_COLORS = [
  "bg-[#7c3aed]", // vibrant purple
  "bg-[#15803d]", // dark green
  "bg-[#2563eb]", // royal blue
  "bg-[#b45309]", // amber
  "bg-[#0f766e]", // teal
  "bg-[#c026d3]", // fuchsia
  "bg-[#be123c]", // rose
  "bg-[#4338ca]", // indigo
];

function getAvatarBg(name?: string) {
  if (!name) return AVATAR_BG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_BG_COLORS.length;
  return AVATAR_BG_COLORS[index];
}

function getJobRelativeTime(job: IJob) {
  if (job.relativeTime) return job.relativeTime;
  if (!job.publishedAt) return "Just now";
  const diffMs = Date.now() - new Date(job.publishedAt).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMins < 60) return `Posted ${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Posted ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function formatJobSalary(salary?: IJob["salary"]) {
  if (!salary || (!salary.min && !salary.max)) return null;
  const currencySymbol =
    salary.currency === "INR"
      ? "₹"
      : salary.currency === "USD"
      ? "$"
      : salary.currency || "$";

  const formatNum = (num?: number) => {
    if (!num) return "";
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  let periodStr = "";
  if (salary.period === "monthly") periodStr = " a month";
  else if (salary.period === "yearly") periodStr = " a year";
  else if (salary.period === "hourly") periodStr = " an hour";

  if (salary.min && salary.max) {
    return `${currencySymbol}${formatNum(salary.min)}–${currencySymbol}${formatNum(salary.max)}${periodStr}`;
  }
  if (salary.min) {
    return `From ${currencySymbol}${formatNum(salary.min)}${periodStr}`;
  }
  if (salary.max) {
    return `Up to ${currencySymbol}${formatNum(salary.max)}${periodStr}`;
  }
  return null;
}

type TabMode = "recommendations" | "all" | "saved";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabMode>("recommendations");
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<
    CandidateProfileSummary | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination & Filter state for Search bar
  const [filters, setFilters] = useState<JobFilterParams>({
    page: 1,
    limit: 16,
    sort: "recommended",
    workplaceType: "all",
    experienceLevel: "all",
    employmentType: "all",
  });

  // Featured Carousel State
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Normal Jobs Pagination State (4x3 Grid = 12 items per page)
  const [normalPage, setNormalPage] = useState(1);
  const NORMAL_PAGE_SIZE = 12;

  // Recently Posted Jobs Sidebar Filter & Sort State
  const [recentFilter, setRecentFilter] = useState<string>("all");
  const [recentSort, setRecentSort] = useState<"recent" | "match" | "salary">("recent");

  // Selected Job for Drawer
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<IJob | null>(null);

  // Applied Jobs Tracking
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

  // Applied Source Map (AI Apply vs Manual Apply)
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

  // Saved Jobs in localStorage
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

  // Sync applied jobs from database on mount
  useEffect(() => {
    let isCancelled = false;
    const syncAppliedJobsFromDb = async () => {
      try {
        const res = await applicationService.getApplications({ limit: 100 });
        if (!isCancelled && res?.applications) {
          const dbAppliedIds = res.applications
            .map((app) => {
              if (typeof app.job === "object" && app.job?._id) {
                return String(app.job._id);
              }
              return (app as any).jobId ? String((app as any).jobId) : null;
            })
            .filter(Boolean) as string[];

          if (dbAppliedIds.length > 0) {
            setAppliedJobIds((prev) => {
              const merged = Array.from(new Set([...prev, ...dbAppliedIds]));
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "resumebuildai_applied_jobs",
                  JSON.stringify(merged),
                );
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Could not sync applied jobs from database:", err);
      }
    };

    syncAppliedJobsFromDb();

    return () => {
      isCancelled = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync applied jobs from backend API on mount
  useEffect(() => {
    let isCancelled = false;
    const fetchAppliedHistory = async () => {
      try {
        const appRes = await applicationService.getApplications({ limit: 100 });
        const apps = appRes.applications || [];
        if (!isCancelled && apps.length > 0) {
          const backendIds: string[] = [];
          const sourceMap: Record<string, "ai_apply" | "manual"> = {};

          apps.forEach((a) => {
            const id = a.job?._id || a._id;
            if (id) {
              backendIds.push(id);
              sourceMap[id] = a.source === "ai_apply" ? "ai_apply" : "manual";
            }
          });

          setAppliedJobIds((prev) => {
            const combined = Array.from(new Set([...prev, ...backendIds]));
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "resumebuildai_applied_jobs",
                JSON.stringify(combined),
              );
            }
            return combined;
          });

          setAppliedSourceMap((prev) => ({
            ...prev,
            ...sourceMap,
          }));
        }
      } catch (err) {
        console.warn("Could not fetch applied history from API:", err);
      }
    };

    fetchAppliedHistory();
    return () => {
      isCancelled = true;
    };
  }, []);

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
    showToast("Application submitted successfully and saved to database!");
  };

  // Fetch jobs based on current tab and filters (Preserving API integration architecture)
  const fetchJobs = useCallback(
    async (isCancelledCheck: () => boolean = () => false) => {
      try {
        if (activeTab === "recommendations") {
          const data = await jobService.getRecommendations(filters);
          if (!isCancelledCheck() && data?.candidateProfile) {
            setCandidateProfile(data.candidateProfile);
          }
        }
      } catch (err: any) {
        if (!isCancelledCheck()) {
          console.warn("API recommendations sync note:", err?.message || err);
        }
      }
    },
    [activeTab, filters],
  );

  useEffect(() => {
    let isCancelled = false;
    fetchJobs(() => isCancelled);

    return () => {
      isCancelled = true;
    };
  }, [fetchJobs]);

  const handleSyncProfile = async () => {
    setIsSyncing(true);
    try {
      await jobService.syncProfile();
      await fetchJobs();
      showToast("Candidate profile & AI match re-synced!");
    } catch (err: any) {
      console.warn("Sync profile warning:", err);
    } finally {
      setIsSyncing(false);
    }
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
    setNormalPage(1);
  };

  const handleOpenApplyModal = (job: IJob) => {
    setJobToApply(job);
    setIsApplyModalOpen(true);
  };

  // Filtered Featured Jobs pool
  const displayFeaturedJobs = useMemo(() => {
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

  // Featured Jobs Carousel movement handlers
  const totalFeatured = displayFeaturedJobs.length;

  const nextFeatured = useCallback(() => {
    if (totalFeatured <= 4) return;
    setFeaturedIndex((prev) => (prev + 1) % totalFeatured);
  }, [totalFeatured]);

  const prevFeatured = useCallback(() => {
    if (totalFeatured <= 4) return;
    setFeaturedIndex((prev) => (prev - 1 + totalFeatured) % totalFeatured);
  }, [totalFeatured]);

  // Auto-movement interval (Right -> Left movement) with cleanup & pause on hover
  useEffect(() => {
    if (isCarouselHovered || totalFeatured <= 4) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % totalFeatured);
    }, 4000);

    return () => clearInterval(interval);
  }, [isCarouselHovered, totalFeatured]);

  // 4 Featured cards visible in carousel at a time
  const visibleFeaturedJobs = useMemo(() => {
    if (totalFeatured === 0) return [];
    if (totalFeatured <= 4) return displayFeaturedJobs;
    const cards: IJob[] = [];
    for (let i = 0; i < 4; i++) {
      cards.push(displayFeaturedJobs[(featuredIndex + i) % totalFeatured]);
    }
    return cards;
  }, [displayFeaturedJobs, featuredIndex, totalFeatured]);

  // Filtered Normal Jobs pool (4x3 Grid)
  const displayNormalJobs = useMemo(() => {
    let list: IJob[] = DUMMY_NORMAL_JOBS;

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

  const totalNormalPages = Math.max(1, Math.ceil(displayNormalJobs.length / NORMAL_PAGE_SIZE));
  const paginatedNormalJobs = useMemo(() => {
    const start = (normalPage - 1) * NORMAL_PAGE_SIZE;
    return displayNormalJobs.slice(start, start + NORMAL_PAGE_SIZE);
  }, [displayNormalJobs, normalPage]);

  // Filtered & Sorted Recently Posted Jobs (Sidebar)
  const displayRecentJobs = useMemo(() => {
    let list: IJob[] = DUMMY_RECENT_JOBS;

    if (recentFilter === "remote") {
      list = list.filter((j) => j.workplaceType === "remote");
    } else if (recentFilter === "hybrid") {
      list = list.filter((j) => j.workplaceType === "hybrid");
    } else if (recentFilter === "full-time") {
      list = list.filter((j) => j.employmentType === "full-time");
    }

    if (recentSort === "recent") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } else if (recentSort === "match") {
      list = [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (recentSort === "salary") {
      list = [...list].sort(
        (a, b) => (b.salary?.max || 0) - (a.salary?.max || 0),
      );
    }

    return list;
  }, [recentFilter, recentSort]);

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

      {/* Hero Banner with Candidate Profile Insights */}
      <ExploreHero
        candidateProfile={candidateProfile}
        onSyncProfile={handleSyncProfile}
        isSyncing={isSyncing}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchJobs()}
            className="font-semibold underline hover:no-underline text-xs cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ============================================================
          MAIN PAGE STRUCTURE:
          - TOP: Filter / Search bar (Kept in same position below blue header)
          - LEFT/MIDDLE:
            1. FEATURED JOBS (4 Cards Carousel with Auto Right -> Left + View More)
            2. HORIZONTAL DIVIDER
            3. NORMAL JOBS (4 x 3 Cards Grid with Pagination)
          - RIGHT: RECENTLY POSTED JOBS (with Filter & Sort controls below heading)
          ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Reserved Grid Column for Alignment */}
        <div
          className="hidden xl:block xl:col-span-1 2xl:col-span-1"
          aria-hidden="true"
        />

        {/* ------------------------------------------------------------
            MIDDLE AREA — MAIN CONTENT (FEATURED CAROUSEL + NORMAL GRID)
            ------------------------------------------------------------ */}
        <main className="col-span-12 xl:col-span-8 2xl:col-span-8 space-y-6">
          {/* ------------------------------------------------------------
              FILTER / SEARCH / SORT BAR (BELOW BLUE HEADER)
              ------------------------------------------------------------ */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Top Row: Search input + Sort dropdown */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                  placeholder="Search by title, skills (e.g. React, Python), company..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink placeholder:text-ink-soft/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({ ...filters, search: "", page: 1 })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Order Dropdown */}
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

            {/* Bottom Row: Quick Filter Chips & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-xs font-semibold text-ink-soft mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Filters:
              </span>

              {/* Workplace Options */}
              {workplaceOptions.map((opt) => {
                const isSelected =
                  (filters.workplaceType || "all") === opt.value;
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

              {/* High Match 80%+ Toggle */}
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

              {/* Experience Level Dropdown */}
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

              {/* Employment Type Dropdown */}
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

              {/* Reset Active Filters Button */}
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

          {/* ------------------------------------------------------------
              SECTION DIVIDER ABOVE FEATURED JOBS
              ------------------------------------------------------------ */}
          <hr className="border-border/70 my-5" />

          {/* ------------------------------------------------------------
              1. FEATURED JOBS SECTION (AUTO-MOVING CAROUSEL: 4 CARDS)
              ------------------------------------------------------------ */}
          <section className="space-y-3.5">
            {/* Heading & Carousel Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                  Featured Jobs
                </h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {displayFeaturedJobs.length} Roles
                </span>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevFeatured}
                  aria-label="Previous featured jobs"
                  className="p-1.5 rounded-xl border border-border bg-card hover:bg-surface-alt text-ink hover:text-primary transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextFeatured}
                  aria-label="Next featured jobs"
                  className="p-1.5 rounded-xl border border-border bg-card hover:bg-surface-alt text-ink hover:text-primary transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div
              className="relative overflow-hidden rounded-2xl"
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
            >
              {visibleFeaturedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {visibleFeaturedJobs.map((job, idx) => {
                    const isApplied = appliedJobIds.includes(job._id);
                    const isSaved = savedJobIds.includes(job._id);

                    return (
                      <div
                        key={`${job._id}-${featuredIndex}-${idx}`}
                        className="animate-in fade-in slide-in-from-right-3 duration-500 fill-mode-both h-full"
                      >
                        <JobCard
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-ink-soft">
                  No featured jobs match your current search filters.
                </div>
              )}

              {/* View More >> Button */}
              <div className="flex justify-end pt-3">
                <Link
                  href="/featured-jobs"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-deep bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl transition-all group cursor-pointer"
                >
                  <span>View More</span>
                  <ChevronsRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------
              SECTION DIVIDER ABOVE EXPLORE ALL JOBS (Matching Reference Layout)
              ------------------------------------------------------------ */}
          <hr className="border-border/70 my-6" />

          {/* ------------------------------------------------------------
              2. NORMAL JOBS SECTION (4 x 3 CARDS GRID = 12 CARDS)
              ------------------------------------------------------------ */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-ink tracking-tight">
                  Explore All Jobs
                </h2>
                <span className="text-xs font-bold text-ink-soft bg-surface-alt px-2.5 py-0.5 rounded-full border border-border">
                  {displayNormalJobs.length} Available
                </span>
              </div>
            </div>

            {paginatedNormalJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {paginatedNormalJobs.map((job) => {
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

                {/* ------------------------------------------------------------
                    PAGINATION CONTROLS: — 1 2 3 — (Matching sketch)
                    ------------------------------------------------------------ */}
                {totalNormalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                    <div className="h-px bg-border/80 w-10 sm:w-16" />
                    <button
                      type="button"
                      onClick={() => setNormalPage((p) => Math.max(1, p - 1))}
                      disabled={normalPage === 1}
                      aria-label="Previous normal jobs page"
                      className="p-1.5 rounded-lg border border-border bg-card text-ink-soft hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalNormalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setNormalPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                            normalPage === pageNum
                              ? "bg-primary text-white shadow-xs"
                              : "bg-surface-alt text-ink hover:bg-secondary border border-border"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setNormalPage((p) => Math.min(totalNormalPages, p + 1))
                      }
                      disabled={normalPage === totalNormalPages}
                      aria-label="Next normal jobs page"
                      className="p-1.5 rounded-lg border border-border bg-card text-ink-soft hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="h-px bg-border/80 w-10 sm:w-16" />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center space-y-4 max-w-md mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-base text-ink">
                  No matching jobs found
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Try adjusting your search terms or clearing active filters to view
                  available jobs.
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
          </section>
        </main>

        {/* ------------------------------------------------------------
            3. RIGHT AREA — RECENTLY POSTED JOBS (SIDEBAR)
            ------------------------------------------------------------ */}
        <aside className="col-span-12 xl:col-span-3 2xl:col-span-3 space-y-3.5">
          {/* Section Heading: RECENTLY POSTED JOBS */}
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-ink tracking-tight">
                RECENTLY POSTED JOBS
              </h2>
            </div>
            <span className="text-[11px] font-bold text-ink-soft bg-surface-alt px-2 py-0.5 rounded-md border border-border">
              {displayRecentJobs.length} latest
            </span>
          </div>

          {/* ------------------------------------------------------------
              FILTER & SORT CONTROLS BELOW RECENTLY POSTED JOBS HEADING
              ------------------------------------------------------------ */}
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-1 bg-surface-alt/70 border border-border/70 p-1 rounded-xl flex-1 min-w-0">
              <SlidersHorizontal className="w-3 h-3 text-ink-soft ml-1 shrink-0" />
              <select
                value={recentFilter}
                onChange={(e) => setRecentFilter(e.target.value)}
                aria-label="Filter recent jobs"
                className="bg-transparent text-[11px] font-semibold text-ink focus:outline-none w-full cursor-pointer truncate"
              >
                <option value="all">All Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-surface-alt/70 border border-border/70 p-1 rounded-xl flex-1 min-w-0">
              <ArrowUpDown className="w-3 h-3 text-ink-soft ml-1 shrink-0" />
              <select
                value={recentSort}
                onChange={(e) => setRecentSort(e.target.value as any)}
                aria-label="Sort recent jobs"
                className="bg-transparent text-[11px] font-semibold text-ink focus:outline-none w-full cursor-pointer truncate"
              >
                <option value="recent">Latest</option>
                <option value="match">Best Match</option>
                <option value="salary">Top Salary</option>
              </select>
            </div>
          </div>

          {/* Compact Feed of Recently Posted Jobs */}
          {displayRecentJobs.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border/80 shadow-2xs divide-y divide-border/60 overflow-hidden">
              {displayRecentJobs.map((job) => {
                const isApplied = appliedJobIds.includes(job._id);
                const isSaved = savedJobIds.includes(job._id);
                const initial = (job.company.name || "C").trim().charAt(0).toUpperCase();
                const avatarBg = getAvatarBg(job.company.name);

                // Location & source
                const locParts = [job.location?.city, job.location?.country || job.location?.state].filter(Boolean);
                const locationText =
                  locParts.length > 0
                    ? locParts.join(", ")
                    : job.workplaceType === "remote"
                    ? "Remote"
                    : "Location not specified";

                const sourceText =
                  job.source === "letgetin_direct"
                    ? "via LetGetIn"
                    : job.source
                    ? `via ${job.source}`
                    : "via Direct";

                const formattedSalary = formatJobSalary(job.salary);

                return (
                  <article
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className="group p-3.5 sm:p-4 hover:bg-surface-alt/40 transition-colors duration-150 cursor-pointer text-left"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Company Logo / Avatar Box */}
                      {job.company?.logo ? (
                        <div className="w-11 h-11 rounded-xl border border-border/70 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-xl ${avatarBg} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {initial}
                        </div>
                      )}

                      {/* Job Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4
                          className="font-bold text-sm text-ink group-hover:text-primary transition-colors leading-tight line-clamp-1"
                          title={job.title}
                        >
                          {job.title}
                        </h4>

                        <p className="text-xs text-ink-soft font-medium truncate">
                          {job.company.name}
                        </p>

                        <p className="text-xs text-ink-soft/80 truncate">
                          <span>{locationText}</span>
                          <span className="mx-1.5 text-border">•</span>
                          <span>{sourceText}</span>
                        </p>

                        {/* Metadata Row with Icons */}
                        <div className="flex items-center gap-3 sm:gap-4 pt-1.5 text-xs text-ink-soft/90 flex-wrap">
                          <div className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-ink-soft/70 shrink-0" />
                            <span>{getJobRelativeTime(job)}</span>
                          </div>

                          {formattedSalary && (
                            <div className="flex items-center gap-1 shrink-0 font-medium text-ink">
                              <Banknote className="w-3.5 h-3.5 text-ink-soft/70 shrink-0" />
                              <span>{formattedSalary}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-ink-soft/70 shrink-0" />
                            <span className="capitalize">
                              {job.employmentType || "Full-time"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-ink-soft">
              No recent jobs matching selected filter.
            </div>
          )}
        </aside>
      </div>

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
        allJobs={[...displayFeaturedJobs, ...displayNormalJobs]}
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
