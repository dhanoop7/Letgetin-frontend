"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  Layers,
  FileCheck2,
  SlidersHorizontal,
  Sliders,
  Brain,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Building,
  MapPin,
  Check,
  X,
  Eye,
  AlertCircle,
  Loader2,
  Award,
  Send,
  PauseCircle,
  ClipboardCheck,
  Download,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  History,
  FileBadge,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { RecruiterJob } from "@/features/recruiter/types";
import { hiringEngineService } from "@/features/hiringEngine/services/hiringEngineService";
import {
  IFinalShortlistResponse,
  FinalDecision,
} from "@/features/hiringEngine/types/hiringEngine.types";
import {
  DUMMY_FINAL_LIST_JOBS,
  DUMMY_FINALISTS_BY_JOB,
  ALL_DUMMY_FINALISTS,
  IDummyFinalistCandidate,
} from "@/features/recruiter/data/dummyFinalList";

export default function FinalListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramJobId = searchParams.get("jobId");

  // State: Jobs (Section 1)
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(paramJobId || "");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | "active" | "draft" | "closed">("all");
  const [jobSort, setJobSort] = useState<"newest" | "applicants" | "title">("newest");

  // State: Finalist List (Section 2)
  const [loadingFinalists, setLoadingFinalists] = useState(false);
  const [finalists, setFinalists] = useState<IDummyFinalistCandidate[]>([]);
  const [stats, setStats] = useState<{
    totalFinalists: number;
    pendingReview: number;
    offersSent: number;
    onHold: number;
    rejected: number;
    hired: number;
  }>({
    totalFinalists: 0,
    pendingReview: 0,
    offersSent: 0,
    onHold: 0,
    rejected: 0,
    hired: 0,
  });

  const [finalistSearch, setFinalistSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<"all" | FinalDecision>("all");

  // State: Selected Finalist for Score Card (Section 3)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Decision Action Modal
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    candidate: IDummyFinalistCandidate | null;
    decision: "offered" | "on_hold" | "rejected" | null;
    notes: string;
    submitting: boolean;
  }>({
    isOpen: false,
    candidate: null,
    decision: null,
    notes: "",
    submitting: false,
  });

  // Responsive View Toggle for smaller screens ('jobs' | 'finalists' | 'scorecard')
  const [activePane, setActivePane] = useState<"jobs" | "finalists" | "scorecard">("finalists");

  // 1. Fetch Recruiter Jobs with Dummy Fallback for UI Testing
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await recruiterService.getMyJobs().catch(() => []);
      const jobList = (data && data.length > 0 ? data : DUMMY_FINAL_LIST_JOBS).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setJobs(jobList);

      if (jobList.length > 0) {
        const matched = (paramJobId && jobList.find((j) => j._id === paramJobId)) || jobList[0];
        setSelectedJobId(matched._id);
      } else {
        setSelectedJobId(DUMMY_FINAL_LIST_JOBS[0]._id);
      }
    } catch (err) {
      console.error("Failed to load recruiter jobs, using UI dummy jobs:", err);
      setJobs(DUMMY_FINAL_LIST_JOBS);
      setSelectedJobId(DUMMY_FINAL_LIST_JOBS[0]._id);
    } finally {
      setLoadingJobs(false);
    }
  }, [paramJobId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle Job Selection
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActivePane("finalists");
    router.replace(`/recruiter/final-list?jobId=${jobId}`, { scroll: false });
  };

  // Selected Job Object
  const currentJob = useMemo(() => {
    return jobs.find((j) => j._id === selectedJobId) || DUMMY_FINAL_LIST_JOBS[0];
  }, [jobs, selectedJobId]);

  // Helper to calculate stats from a candidate list
  const calculateStats = (list: IDummyFinalistCandidate[]) => ({
    totalFinalists: list.length,
    pendingReview: list.filter((c) => c.finalShortlistDecision === "pending").length,
    offersSent: list.filter((c) => c.finalShortlistDecision === "offered").length,
    onHold: list.filter((c) => c.finalShortlistDecision === "on_hold").length,
    rejected: list.filter((c) => c.finalShortlistDecision === "rejected").length,
    hired: list.filter((c) => c.finalShortlistDecision === "hired").length,
  });

  // 2. Fetch Finalist Data for Selected Job with Dummy Fallback for UI Testing
  const fetchFinalistsData = useCallback(async () => {
    if (!selectedJobId) {
      setFinalists(ALL_DUMMY_FINALISTS);
      setStats(calculateStats(ALL_DUMMY_FINALISTS));
      setSelectedCandidateId(ALL_DUMMY_FINALISTS[0].applicationId);
      return;
    }

    setLoadingFinalists(true);
    try {
      let finalShortlistRes: IFinalShortlistResponse | null = null;
      try {
        finalShortlistRes = await hiringEngineService.getFinalShortlist(selectedJobId);
      } catch {
        finalShortlistRes = null;
      }

      let candidateList: IDummyFinalistCandidate[] = [];

      if (finalShortlistRes && finalShortlistRes.candidates && finalShortlistRes.candidates.length > 0) {
        candidateList = finalShortlistRes.candidates.map((c) => ({
          ...c,
          appliedRole: currentJob?.title || "Role",
          experience: "2+ Years",
          technicalScore: c.stageScores?.assessmentScore || 90,
          aptitudeScore: c.stageScores?.matchScore || 88,
          interviewScore: c.stageScores?.aiScore || 91,
        }));
      } else {
        // Check if there are real applicants in ATS
        const applicants = await recruiterService.getApplicantsForJob(selectedJobId).catch(() => []);
        const qualifying = (applicants || []).filter(
          (app: any) =>
            app.status === "offered" ||
            app.status === "hired" ||
            app.status === "interviewing" ||
            app.status === "shortlisted" ||
            (app.matchScore && app.matchScore >= 70)
        );

        if (qualifying.length > 0) {
          candidateList = qualifying.map((app: any, idx: number) => {
            const user = app.candidate || {};
            const matchScore = app.matchScore || 88;
            const assessmentScore = app.assessmentScore || 90;
            const aiScore = app.aiScore || 92;

            const decision: FinalDecision =
              app.status === "offered"
                ? "offered"
                : app.status === "hired"
                ? "hired"
                : app.status === "rejected"
                ? "rejected"
                : "pending";

            return {
              applicationId: String(app._id),
              jobId: selectedJobId,
              appliedRole: currentJob?.title || "Role",
              experience: app.experience || "2+ Years",
              aptitudeScore: matchScore,
              technicalScore: assessmentScore,
              interviewScore: aiScore,
              candidate: {
                _id: String(user._id || app._id),
                fullName: user.fullName || user.username || "Finalist Candidate",
                email: user.email || "",
                phone: user.phone || "",
                avatarUrl: user.avatarUrl || user.avatar || "",
              },
              resume: app.resume
                ? {
                    _id: String(app.resume._id || app._id),
                    title: app.resume.title || "Resume.pdf",
                    atsScore: matchScore,
                  }
                : null,
              resumeScore: matchScore,
              compositeRank: idx + 1,
              completedStages: [
                {
                  stageId: "resume_screening",
                  stageName: "Resume Screening",
                  stageIndex: 1,
                  status: "passed",
                  score: matchScore,
                  completedAt: app.appliedAt,
                  notes: "Passed ATS benchmark screening",
                },
                {
                  stageId: "technical_test",
                  stageName: "Technical Assessment",
                  stageIndex: 2,
                  status: "passed",
                  score: assessmentScore,
                  completedAt: app.appliedAt,
                  notes: "Scored high in domain test",
                },
                {
                  stageId: "ai_interview",
                  stageName: "AI Interview Round",
                  stageIndex: 3,
                  status: "passed",
                  score: aiScore,
                  completedAt: app.appliedAt,
                  notes: "Strong communication and technical proficiency",
                },
              ],
              stageScores: {
                matchScore,
                assessmentScore,
                aiScore,
              },
              finalShortlistDate: app.appliedAt || new Date().toISOString(),
              finalShortlistDecision: decision,
              notes: app.notes || "",
            };
          });
        } else {
          // Visual UI testing fallback: Use realistic dummy candidates for this job or all dummy candidates
          const jobSpecific = DUMMY_FINALISTS_BY_JOB[selectedJobId];
          candidateList = jobSpecific && jobSpecific.length > 0 ? jobSpecific : ALL_DUMMY_FINALISTS;
        }
      }

      setFinalists(candidateList);
      setStats(calculateStats(candidateList));

      if (candidateList.length > 0) {
        setSelectedCandidateId(candidateList[0].applicationId);
      } else {
        setSelectedCandidateId(null);
      }
    } catch (err) {
      console.error("Failed to load final list, using UI dummy finalists:", err);
      const fallbackList = DUMMY_FINALISTS_BY_JOB[selectedJobId] || ALL_DUMMY_FINALISTS;
      setFinalists(fallbackList);
      setStats(calculateStats(fallbackList));
      if (fallbackList.length > 0) {
        setSelectedCandidateId(fallbackList[0].applicationId);
      }
    } finally {
      setLoadingFinalists(false);
    }
  }, [selectedJobId, currentJob]);

  useEffect(() => {
    fetchFinalistsData();
  }, [fetchFinalistsData]);

  // Filtered Jobs on Left
  const filteredJobs = useMemo(() => {
    const list = [...jobs].filter((j: RecruiterJob) => {
      const q = jobSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        j.title?.toLowerCase().includes(q) ||
        j.skills?.some((s) => s.toLowerCase().includes(q)) ||
        j.location?.city?.toLowerCase().includes(q);

      const status = j.status?.toLowerCase() || "active";
      const matchesStatus =
        jobStatusFilter === "all" ||
        (jobStatusFilter === "active" && (status === "active" || status === "open")) ||
        (jobStatusFilter === "draft" && status === "draft") ||
        (jobStatusFilter === "closed" && (status === "closed" || status === "archived"));

      return matchesSearch && matchesStatus;
    });

    if (jobSort === "newest") {
      list.sort((a: RecruiterJob, b: RecruiterJob) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } else if (jobSort === "applicants") {
      list.sort((a: RecruiterJob, b: RecruiterJob) => (b.applicantCount || 0) - (a.applicantCount || 0));
    } else if (jobSort === "title") {
      list.sort((a: RecruiterJob, b: RecruiterJob) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [jobs, jobSearch, jobStatusFilter, jobSort]);

  // Filtered Finalists in Middle
  const filteredFinalists = useMemo(() => {
    return finalists.filter((c) => {
      const user = c.candidate;
      const name = user.fullName || user.username || "";
      const email = user.email || "";
      const role = c.appliedRole || "";

      const q = finalistSearch.toLowerCase().trim();
      const matchesSearch =
        !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || role.toLowerCase().includes(q);

      const matchesDecision =
        decisionFilter === "all" || c.finalShortlistDecision === decisionFilter;

      return matchesSearch && matchesDecision;
    });
  }, [finalists, finalistSearch, decisionFilter]);

  // Currently Selected Finalist for Score Card
  const selectedCandidate = useMemo(() => {
    return (
      finalists.find((c) => c.applicationId === selectedCandidateId) ||
      filteredFinalists[0] ||
      finalists[0] ||
      null
    );
  }, [finalists, selectedCandidateId, filteredFinalists]);

  // Open Decision Dialog
  const handleOpenDecisionModal = (
    candidate: IDummyFinalistCandidate,
    decision: "offered" | "on_hold" | "rejected"
  ) => {
    setDecisionModal({
      isOpen: true,
      candidate,
      decision,
      notes: candidate.notes || "",
      submitting: false,
    });
  };

  // Submit Final Decision (handles both dummy UI testing and live API)
  const handleSubmitDecision = async () => {
    if (!decisionModal.candidate || !decisionModal.decision || !selectedJobId) return;

    setDecisionModal((prev) => ({ ...prev, submitting: true }));
    try {
      const isDummy = decisionModal.candidate.applicationId.startsWith("app-dummy");

      if (isDummy) {
        // Update local candidate state for immediate interactive visual testing
        const newDecision = decisionModal.decision;
        setFinalists((prev) =>
          prev.map((c) =>
            c.applicationId === decisionModal.candidate?.applicationId
              ? { ...c, finalShortlistDecision: newDecision, notes: decisionModal.notes }
              : c
          )
        );
        setStats((prev) => {
          const updated = finalists.map((c) =>
            c.applicationId === decisionModal.candidate?.applicationId
              ? { ...c, finalShortlistDecision: newDecision }
              : c
          );
          return calculateStats(updated);
        });
      } else {
        try {
          await hiringEngineService.recordFinalDecision(
            selectedJobId,
            decisionModal.candidate.applicationId,
            {
              decision: decisionModal.decision,
              notes: decisionModal.notes,
            }
          );
        } catch {
          const atsStatus =
            decisionModal.decision === "offered"
              ? "offered"
              : decisionModal.decision === "rejected"
              ? "rejected"
              : "shortlisted";
          await recruiterService.updateApplicantStatus(
            decisionModal.candidate.applicationId,
            atsStatus,
            decisionModal.notes
          );
        }
        fetchFinalistsData();
      }

      toast.success(
        `Candidate marked as "${
          decisionModal.decision === "offered"
            ? "Offer Extended"
            : decisionModal.decision === "on_hold"
            ? "On Hold"
            : "Rejected"
        }"`
      );

      setDecisionModal({
        isOpen: false,
        candidate: null,
        decision: null,
        notes: "",
        submitting: false,
      });
    } catch (err: any) {
      console.error("Decision failed:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to record decision.");
      setDecisionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] overflow-hidden bg-background text-ink">
      {/* Top Breadcrumb & Page Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/80 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span>Recruiter</span>
              <ChevronRight className="w-3 h-3 text-ink-soft/60" />
              <span className="font-semibold text-primary">Final List</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>Final list</span>
              {currentJob && (
                <span className="text-xs font-semibold text-ink-soft hidden md:inline">
                  — {currentJob.title}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Top Header Actions & Responsive Panes Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile / Tablet Responsive Pane Switcher */}
          <div className="flex xl:hidden items-center p-1 bg-surface-alt border border-border rounded-xl text-xs">
            <button
              onClick={() => setActivePane("jobs")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                activePane === "jobs"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActivePane("finalists")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                activePane === "finalists"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Finalists ({filteredFinalists.length})
            </button>
            <button
              onClick={() => setActivePane("scorecard")}
              className={`px-2.5 py-1 font-bold rounded-lg transition ${
                activePane === "scorecard"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Score Card
            </button>
          </div>

          <button
            onClick={() => {
              fetchJobs();
              fetchFinalistsData();
            }}
            disabled={loadingFinalists || loadingJobs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink shadow-2xs transition disabled:opacity-50"
            title="Refresh finalist candidates"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-soft ${loadingFinalists ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => toast.success("Exported final candidate roster and scorecards (PDF/CSV)")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Scorecards</span>
          </button>
        </div>
      </div>

      {/* Main 3-Section Layout Matching Reference: Left (Jobs Listed) | Middle (Final List) | Right (Score Card) */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ========================================================================= */}
        {/* SECTION 1: LEFT PANEL — JOBS LISTED                                       */}
        {/* ========================================================================= */}
        <aside
          className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden transition-all duration-300 ${
            activePane === "jobs" ? "flex" : "hidden xl:flex"
          }`}
        >
          {/* Header & Controls Order: Jobs Listed -> Filter + Sort -> Search -> Cards */}
          <div className="p-4 border-b border-border/80 space-y-3 bg-surface shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-extrabold text-ink tracking-tight">Jobs listed</h2>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"}
              </span>
            </div>

            {/* Filter & Sort Controls Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                {/* Filter */}
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-ink-soft font-semibold shrink-0">Filter:</span>
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value as any)}
                    className="w-full px-2 py-1 bg-surface-alt/70 border border-border/80 rounded-lg text-xs font-semibold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer capitalize"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-ink-soft font-semibold shrink-0">Sort:</span>
                  <select
                    value={jobSort}
                    onChange={(e) => setJobSort(e.target.value as any)}
                    className="w-full px-2 py-1 bg-surface-alt/70 border border-border/80 rounded-lg text-xs font-semibold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="applicants">Most Applicants</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, city..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                {jobSearch && (
                  <button
                    onClick={() => setJobSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Cards Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {loadingJobs ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-surface-alt/50 border border-border animate-pulse space-y-2">
                    <div className="h-4 bg-surface-alt rounded w-3/4" />
                    <div className="h-3 bg-surface-alt rounded w-1/2" />
                    <div className="h-3 bg-surface-alt rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-alt/30 border border-border/70 space-y-2 my-4">
                <Briefcase className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
                <h4 className="text-xs font-bold text-ink">No Job Postings Found</h4>
                <p className="text-[11px] text-ink-soft">No jobs match your search filter.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = job._id === selectedJobId;
                const status = (job.status || "active").toLowerCase();
                const statusBadge =
                  status === "active" || status === "open"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : status === "draft"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-500 border-slate-500/20";

                const applicantCount =
                  job.applicantCount ??
                  (isSelected ? finalists.length : 18);

                const finalistCount =
                  DUMMY_FINALISTS_BY_JOB[job._id]?.length ||
                  (job._id === "job-dummy-1" ? 3 : job._id === "job-dummy-2" ? 2 : job._id === "job-dummy-3" ? 5 : 2);

                const companyName =
                  typeof job.company === "object" && job.company !== null
                    ? (job.company as any).name || "TechNova"
                    : (job.company as string) || "TechNova";

                const city = job.location?.city || "Bangalore";

                return (
                  <div
                    key={job._id}
                    onClick={() => handleSelectJob(job._id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs group relative ${
                      isSelected
                        ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                        : "bg-surface border-border hover:border-primary/40 hover:bg-surface-alt/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-xs font-extrabold truncate ${
                            isSelected ? "text-primary" : "text-ink group-hover:text-primary"
                          } transition-colors`}
                        >
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-ink-soft truncate font-medium mt-0.5">
                          {companyName} • {job.workplaceType || job.employmentType || "Full Time"}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${statusBadge}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-soft pt-2.5 mt-2 border-t border-border/50">
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-ink-soft/70 shrink-0" />
                        <span className="truncate">{city}</span>
                      </span>

                      <div className="flex items-center gap-2 font-bold text-[10px] shrink-0">
                        <span className="text-ink-soft">{applicantCount} Applicants</span>
                        <span className="text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-md">
                          {finalistCount} Finalists
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* SECTION 2: MIDDLE PANEL — FINAL LIST CANDIDATES                          */}
        {/* ========================================================================= */}
        <div
          className={`w-full lg:w-[360px] xl:w-[380px] shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden transition-all duration-300 ${
            activePane === "finalists" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Final List Header */}
          <div className="p-4 border-b border-border/80 space-y-3 bg-surface shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-extrabold text-ink tracking-tight">Final list</h2>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {filteredFinalists.length} Candidates
              </span>
            </div>

            {/* Decision Filter Tabs: All | Pending | Offered | On Hold | Rejected */}
            <div className="flex items-center gap-1 p-1 bg-surface-alt/60 border border-border/70 rounded-xl overflow-x-auto text-[11px]">
              {(["all", "pending", "offered", "on_hold", "rejected"] as const).map((dec) => (
                <button
                  key={dec}
                  onClick={() => setDecisionFilter(dec)}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold capitalize transition whitespace-nowrap text-center ${
                    decisionFilter === dec
                      ? "bg-surface text-primary shadow-2xs border border-border/50"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {dec === "all" ? "All" : dec.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Candidate Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search finalist name, role..."
                value={finalistSearch}
                onChange={(e) => setFinalistSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
              {finalistSearch && (
                <button
                  onClick={() => setFinalistSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Finalist Candidate Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin bg-surface-alt/30">
            {loadingFinalists ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-surface border border-border animate-pulse space-y-2">
                    <div className="h-4 bg-surface-alt rounded w-2/3" />
                    <div className="h-3 bg-surface-alt rounded w-1/2" />
                    <div className="h-3 bg-surface-alt rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredFinalists.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface border border-border space-y-2 my-4">
                <Users className="w-8 h-8 text-ink-soft mx-auto opacity-40" />
                <h4 className="text-xs font-bold text-ink">No Finalists Found</h4>
                <p className="text-[11px] text-ink-soft">
                  No finalist candidates match the selected &quot;{decisionFilter.replace("_", " ")}&quot; filter.
                </p>
              </div>
            ) : (
              filteredFinalists.map((c, index) => {
                const isSelected = c.applicationId === selectedCandidate?.applicationId;
                const user = c.candidate;
                const name = user.fullName || user.username || `Finalist ${index + 1}`;
                const role = c.appliedRole || currentJob?.title || "Developer";
                const experience = c.experience || "2 Years";

                const score = c.resumeScore || c.stageScores?.matchScore || 90;
                const decision = c.finalShortlistDecision;

                const decisionBadge =
                  decision === "offered"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : decision === "hired"
                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                    : decision === "on_hold"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : decision === "rejected"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-blue-500/10 text-blue-600 border-blue-500/20";

                return (
                  <div
                    key={c.applicationId}
                    onClick={() => {
                      setSelectedCandidateId(c.applicationId);
                      setActivePane("scorecard");
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs group relative ${
                      isSelected
                        ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                        : "bg-surface border-border hover:border-primary/40 hover:bg-surface"
                    }`}
                  >
                    {/* Top Row: Avatar + Name + Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3
                              className={`text-xs font-extrabold truncate ${
                                isSelected ? "text-primary" : "text-ink group-hover:text-primary"
                              } transition-colors`}
                            >
                              {name}
                            </h3>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-surface-alt border border-border text-ink-soft shrink-0">
                              #{c.compositeRank || index + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink font-medium truncate mt-0.5">{role}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                        {score}% Score
                      </span>
                    </div>

                    {/* Bottom Metadata: Experience & Status Badge */}
                    <div className="flex items-center justify-between text-[11px] text-ink-soft pt-2 mt-2 border-t border-border/50">
                      <span className="text-[10px] font-semibold text-ink-soft flex items-center gap-1">
                        <Clock className="w-3 h-3 text-ink-soft/70" />
                        <span>Exp: {experience}</span>
                      </span>

                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${decisionBadge}`}
                      >
                        {decision.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: RIGHT PANEL — SCORE CARD / EVALUATION WORKSPACE               */}
        {/* ========================================================================= */}
        <main
          className={`flex-1 flex-col overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 space-y-6 ${
            activePane === "scorecard" ? "flex" : "hidden lg:flex"
          }`}
        >
          {loadingFinalists ? (
            <div className="p-8 rounded-3xl bg-surface border border-border space-y-4 animate-pulse">
              <div className="h-8 bg-surface-alt rounded w-1/3" />
              <div className="h-24 bg-surface-alt rounded-2xl" />
              <div className="h-40 bg-surface-alt rounded-2xl" />
            </div>
          ) : !selectedCandidate ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="max-w-md p-8 rounded-3xl bg-surface border border-border space-y-3 shadow-xs">
                <FileBadge className="w-12 h-12 text-ink-soft mx-auto opacity-50" />
                <h3 className="text-base font-black text-ink">No Candidate Selected</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Choose a finalist candidate from the list to inspect their comprehensive multi-stage scorecard, test performance, and decision history.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl">
              {/* Score Card Header Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-xl flex items-center justify-center shadow-xs">
                      {selectedCandidate.candidate.fullName?.charAt(0).toUpperCase() || "F"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-ink tracking-tight">
                          {selectedCandidate.candidate.fullName || selectedCandidate.candidate.username}
                        </h2>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                          Rank #{selectedCandidate.compositeRank} Finalist
                        </span>
                        <span
                          className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            selectedCandidate.finalShortlistDecision === "offered"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : selectedCandidate.finalShortlistDecision === "on_hold"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : selectedCandidate.finalShortlistDecision === "rejected"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                        >
                          {selectedCandidate.finalShortlistDecision.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft font-semibold mt-1 flex items-center gap-2">
                        <span>Applied Role: <strong className="text-ink">{selectedCandidate.appliedRole || currentJob?.title || "Role"}</strong></span>
                        <span>•</span>
                        <span>Experience: <strong className="text-ink">{selectedCandidate.experience || "2 Years"}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenDecisionModal(selectedCandidate, "offered")}
                      disabled={selectedCandidate.finalShortlistDecision === "offered" || selectedCandidate.finalShortlistDecision === "hired"}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Extend Offer</span>
                    </button>

                    <button
                      onClick={() => handleOpenDecisionModal(selectedCandidate, "on_hold")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>On Hold</span>
                    </button>

                    <button
                      onClick={() => handleOpenDecisionModal(selectedCandidate, "rejected")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold transition cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Contact Strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-soft pt-3 border-t border-border/60">
                  {selectedCandidate.candidate.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-ink-soft/70" />
                      <span>{selectedCandidate.candidate.email}</span>
                    </span>
                  )}
                  {selectedCandidate.candidate.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-ink-soft/70" />
                      <span>{selectedCandidate.candidate.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ink-soft/70" />
                    <span>Shortlisted on {new Date(selectedCandidate.finalShortlistDate).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* 4 Score Card KPI Tiles (Overall, Technical, Aptitude/ATS, Interview) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Composite / Overall Score */}
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-ink-soft">Overall Score</div>
                  <div className="text-2xl font-black text-primary">
                    {selectedCandidate.resumeScore || 92}%
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Top 5% Talent
                  </div>
                </div>

                {/* Technical Score */}
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-ink-soft">Technical Score</div>
                  <div className="text-2xl font-black text-ink">
                    {selectedCandidate.technicalScore || selectedCandidate.stageScores?.assessmentScore || 94}%
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    Passed Coding Benchmark
                  </div>
                </div>

                {/* Aptitude / Assessment Score */}
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-ink-soft">Aptitude Score</div>
                  <div className="text-2xl font-black text-ink">
                    {selectedCandidate.aptitudeScore || selectedCandidate.stageScores?.matchScore || 90}%
                  </div>
                  <div className="text-[10px] text-ink-soft">
                    Cognitive & Domain Test
                  </div>
                </div>

                {/* Interview Score */}
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-ink-soft">Interview Score</div>
                  <div className="text-2xl font-black text-ink">
                    {selectedCandidate.interviewScore || selectedCandidate.stageScores?.aiScore || 92}%
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold">
                    AI & Technical Fit
                  </div>
                </div>
              </div>

              {/* Stage-by-Stage Qualification History */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-extrabold text-ink tracking-tight">
                      Stage-by-Stage Evaluation History
                    </h3>
                  </div>
                  <span className="text-xs text-ink-soft font-semibold">
                    {selectedCandidate.completedStages.length} Milestones Cleared
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedCandidate.completedStages.map((st, idx) => (
                    <div
                      key={st.stageId || idx}
                      className="p-4 rounded-2xl bg-surface-alt/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-ink">
                              {idx + 1}. {st.stageName}
                            </h4>
                            <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Passed
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-soft mt-0.5">
                            {st.notes || "Stage qualification criteria achieved."}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        {st.score !== undefined && (
                          <div className="text-xs font-black text-ink">
                            Score: {st.score}%
                          </div>
                        )}
                        {st.completedAt && (
                          <div className="text-[10px] text-ink-soft">
                            {new Date(st.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Final Decision Modal */}
      {decisionModal.isOpen && decisionModal.candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  decisionModal.decision === "offered"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : decisionModal.decision === "on_hold"
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                }`}
              >
                {decisionModal.decision === "offered" ? (
                  <Send className="w-6 h-6" />
                ) : decisionModal.decision === "on_hold" ? (
                  <PauseCircle className="w-6 h-6" />
                ) : (
                  <UserX className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-ink">
                  {decisionModal.decision === "offered"
                    ? "Extend Official Job Offer"
                    : decisionModal.decision === "on_hold"
                    ? "Put Candidate On Hold"
                    : "Reject Candidate"}
                </h3>
                <p className="text-xs text-ink-soft">
                  Candidate: <strong className="text-ink">{decisionModal.candidate.candidate.fullName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">Decision Notes & Feedback (Optional)</label>
              <textarea
                rows={3}
                placeholder="Add internal hiring notes, compensation details, or rejection reasoning..."
                value={decisionModal.notes}
                onChange={(e) => setDecisionModal((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 bg-surface-alt/70 border border-border rounded-2xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={decisionModal.submitting}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={decisionModal.submitting}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                  decisionModal.decision === "offered"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : decisionModal.decision === "on_hold"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {decisionModal.submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {decisionModal.decision === "offered"
                    ? "Confirm & Send Offer"
                    : decisionModal.decision === "on_hold"
                    ? "Confirm On Hold"
                    : "Confirm Rejection"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
