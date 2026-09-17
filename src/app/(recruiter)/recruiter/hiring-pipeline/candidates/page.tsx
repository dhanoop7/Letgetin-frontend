"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Eye,
  ArrowRight,
  UserX,
  Clock,
  Sparkles,
  Loader2,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  PlusCircle,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import { HiringPipelineHeader } from "@/features/hiringEngine/components/HiringPipelineHeader";
import { CandidateDetailDrawer } from "@/features/hiringEngine/components/CandidateDetailDrawer";
import {
  ConfirmActionModal,
  ConfirmModalType,
} from "@/features/hiringEngine/components/ConfirmActionModal";
import { InitPipelineModal } from "@/features/hiringEngine/components/InitPipelineModal";
import { hiringEngineService } from "@/features/hiringEngine/services/hiringEngineService";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import {
  IFunnelMetricsReport,
  HiringEngineCandidate,
  PopulatedUser,
  PopulatedResume,
  CandidatePoolType,
  CandidateStageStatus,
} from "@/features/hiringEngine/types/hiringEngine.types";
import { RecruiterJob } from "@/features/recruiter/types";

export default function CandidateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramJobId = searchParams.get("jobId");
  const paramStageId = searchParams.get("stageId");

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(paramJobId || "");
  const [metrics, setMetrics] = useState<IFunnelMetricsReport | null>(null);
  const [candidates, setCandidates] = useState<HiringEngineCandidate[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(paramStageId || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [poolFilter, setPoolFilter] = useState<string>("all");

  // Candidate detail drawer
  const [selectedCandidate, setSelectedCandidate] = useState<HiringEngineCandidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirmation modal
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: ConfirmModalType;
    title: string;
    description: string;
    candidate?: HiringEngineCandidate;
  }>({
    isOpen: false,
    type: "advance",
    title: "",
    description: "",
  });

  // Init pipeline modal
  const [showInitModal, setShowInitModal] = useState(false);

  // 1. Load recruiter jobs
  useEffect(() => {
    recruiterService
      .getMyJobs()
      .then((data) => {
        const jobList = data || [];
        setJobs(jobList);
        if (jobList.length > 0) {
          const matchingJob = (paramJobId && jobList.find((j) => j._id === paramJobId)) || jobList[0];
          setSelectedJobId(matchingJob._id);
        } else {
          setSelectedJobId("");
        }
      })
      .catch((err) => {
        console.error("Failed to load recruiter jobs:", err);
      })
      .finally(() => setLoadingJobs(false));
  }, [paramJobId]);

  // 2. Load candidates across all stages for selected job
  const loadCandidatesData = useCallback(async () => {
    if (!selectedJobId) {
      setMetrics(null);
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      const metricsData = await hiringEngineService.getFunnelMetrics(selectedJobId);
      setMetrics(metricsData);

      if (metricsData?.stages && metricsData.stages.length > 0) {
        const stageResults = await Promise.all(
          metricsData.stages.map((stage) =>
            hiringEngineService
              .getStageCandidates(selectedJobId, stage.stageId)
              .catch(() => ({ stageId: stage.stageId, primary: [], reserve: [] }))
          )
        );

        const seenIds = new Set<string>();
        const combined: HiringEngineCandidate[] = [];

        stageResults.forEach((res) => {
          [...res.primary, ...res.reserve].forEach((c) => {
            if (!seenIds.has(c._id)) {
              seenIds.add(c._id);
              combined.push(c);
            }
          });
        });

        // Sort by compositeRank / matchScore descending
        combined.sort((a, b) => (b.compositeRank || b.matchScore || 0) - (a.compositeRank || a.matchScore || 0));
        setCandidates(combined);
      } else {
        setCandidates([]);
      }
    } catch (err: any) {
      const isNotFound =
        err?.response?.status === 404 ||
        err?.statusCode === 404 ||
        err?.status === 404 ||
        err?.error?.code === "NOT_FOUND" ||
        err?.code === "NOT_FOUND";

      if (isNotFound) {
        setMetrics(null);
        setCandidates([]);
      } else {
        toast.error(
          err?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load candidates."
        );
      }
    } finally {
      setLoadingCandidates(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadCandidatesData();
  }, [loadCandidatesData]);

  const handleSelectJob = (newJobId: string) => {
    setSelectedJobId(newJobId);
    router.push(`/recruiter/hiring-pipeline/candidates?jobId=${newJobId}`);
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const user = typeof c.userId === "object" ? (c.userId as PopulatedUser) : null;
      const name = (user?.fullName || user?.username || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || name.includes(query) || email.includes(query);
      const matchesStage = stageFilter === "all" || c.currentStageId === stageFilter;
      const matchesStatus = statusFilter === "all" || c.stageStatus === statusFilter;
      const matchesPool = poolFilter === "all" || c.poolType === poolFilter;

      return matchesSearch && matchesStage && matchesStatus && matchesPool;
    });
  }, [candidates, searchQuery, stageFilter, statusFilter, poolFilter]);

  // Actions
  const handleOpenAdvance = (candidate: HiringEngineCandidate) => {
    const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
    const name = user?.fullName || user?.username || "Candidate";
    setConfirmModalState({
      isOpen: true,
      type: "advance",
      title: "Advance Candidate",
      description: `Advance ${name} to the next sequential stage in the hiring pipeline.`,
      candidate,
    });
  };

  const handleOpenFail = (candidate: HiringEngineCandidate) => {
    const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
    const name = user?.fullName || user?.username || "Candidate";
    setConfirmModalState({
      isOpen: true,
      type: "fail",
      title: "Fail Candidate",
      description: `Disqualify ${name}. If auto-refill is configured, the top reserve candidate will be brought into primary.`,
      candidate,
    });
  };

  const handleExecuteModalAction = async (payload: { score?: number; notes?: string; reason?: string }) => {
    if (!selectedJobId || !confirmModalState.candidate) return;

    try {
      if (confirmModalState.type === "advance") {
        const res = await hiringEngineService.advanceCandidate(
          selectedJobId,
          confirmModalState.candidate._id,
          { score: payload.score, notes: payload.notes }
        );
        toast.success(
          res.isFinalShortlist
            ? "Candidate reached final shortlist!"
            : `Candidate advanced to next stage.`
        );
      } else if (confirmModalState.type === "fail") {
        const res = await hiringEngineService.failCandidate(
          selectedJobId,
          confirmModalState.candidate._id,
          { reason: payload.reason }
        );
        if (res.promotedCount > 0) {
          toast.success(
            `Candidate marked as failed. Automatically promoted ${res.promotedCount} candidate(s) from reserve pool.`
          );
        } else {
          toast.success("Candidate marked as failed.");
        }
      }

      await loadCandidatesData();
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Action failed.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <HiringPipelineHeader
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
        metrics={metrics}
        loadingMetrics={loadingCandidates}
        onRefresh={loadCandidatesData}
        onInitPipelineClick={() => setShowInitModal(true)}
      />

      {/* Tabs */}
      <HiringPipelineNavTabs jobId={selectedJobId} />

      {/* Search & Filters Toolbar */}
      {metrics && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-4 bg-surface border border-border rounded-2xl shadow-xs">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-alt/70 border border-border rounded-xl text-ink outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end text-xs">
            {/* Stage Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-ink-soft font-semibold">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-ink outline-none cursor-pointer"
              >
                <option value="all">All Stages ({candidates.length})</option>
                {metrics.stages.map((s) => (
                  <option key={s.stageId} value={s.stageId}>
                    {s.stageName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-ink-soft font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-ink outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="invited">Invited</option>
                <option value="started">Started</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="no_show">No-Show</option>
              </select>
            </div>

            {/* Pool Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-ink-soft font-semibold">Pool:</span>
              <select
                value={poolFilter}
                onChange={(e) => setPoolFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-ink outline-none cursor-pointer"
              >
                <option value="all">All Pools</option>
                <option value="primary">Primary Pool</option>
                <option value="reserve">Reserve Pool</option>
                <option value="disqualified">Disqualified</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Data Table */}
      {loadingJobs || (loadingCandidates && candidates.length === 0) ? (
        <div className="p-16 text-center space-y-3 bg-surface border border-border rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-semibold text-ink-soft">Loading Candidate Directory...</p>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State: No Jobs Created */
        <div className="p-12 text-center space-y-5 bg-surface border border-dashed border-border rounded-2xl shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-ink">No Job Requisitions Found</h3>
            <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
              Create your first job listing to activate the automated hiring pipeline and start receiving candidates.
            </p>
          </div>
          <Link
            href="/recruiter/jobs/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Job Listing</span>
          </Link>
        </div>
      ) : !metrics ? (
        <div className="p-12 text-center space-y-5 bg-surface border border-dashed border-border rounded-2xl shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-ink">Hiring Engine Not Initialized</h3>
            <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
              Initialize the automated funnel to list, screen, and manage candidates for{" "}
              <strong className="text-ink">{selectedJob?.title}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Initialize Hiring Pipeline</span>
          </button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-surface border border-dashed border-border rounded-2xl shadow-xs">
          <Users className="w-8 h-8 text-ink-soft/60 mx-auto" />
          <h3 className="text-sm font-bold text-ink">No Candidates Found</h3>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            {searchQuery || stageFilter !== "all" || statusFilter !== "all" || poolFilter !== "all"
              ? "No candidates matched your filter criteria. Try clearing search filters."
              : "No candidates have entered this stage yet."}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-surface-alt/40 text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-3 text-center">Match</th>
                  <th className="py-3.5 px-3">Stage</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Pool</th>
                  <th className="py-3.5 px-3 text-center">Assessment</th>
                  <th className="py-3.5 px-3 text-center">AI Interview</th>
                  <th className="py-3.5 px-3">Deadline</th>
                  <th className="py-3.5 px-3">ATS Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCandidates.map((candidate) => {
                  const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
                  const name = user?.fullName || user?.username || "Candidate";
                  const email = user?.email || "—";

                  const isPassed = candidate.stageStatus === "passed";
                  const isFailed = candidate.stageStatus === "failed";
                  const isNoShow = candidate.stageStatus === "no_show";
                  const isShortlisted = candidate.status === "shortlisted";

                  return (
                    <tr
                      key={candidate._id}
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-surface-alt/40 transition-colors cursor-pointer group"
                    >
                      {/* Candidate Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              candidate.poolType === "primary"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {name[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="truncate max-w-[170px]">
                            <span className="font-bold text-ink block group-hover:text-primary transition-colors truncate">
                              {name}
                            </span>
                            <span className="text-[10px] text-ink-soft block truncate">{email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="py-3.5 px-3 text-center font-extrabold text-primary-glow">
                        {candidate.matchScore !== undefined ? `${Math.round(candidate.matchScore)}%` : "—"}
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-3 font-semibold text-ink capitalize">
                        {candidate.currentStageId ? candidate.currentStageId.replace(/_/g, " ") : "Intake"}
                      </td>

                      {/* Stage Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                            isPassed
                              ? "bg-emerald-500/10 text-emerald-600"
                              : isFailed
                              ? "bg-rose-500/10 text-rose-600"
                              : isNoShow
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          {candidate.stageStatus || "invited"}
                        </span>
                      </td>

                      {/* Pool Type */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            candidate.poolType === "primary"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : candidate.poolType === "reserve"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {candidate.poolType}
                        </span>
                      </td>

                      {/* Assessment Score */}
                      <td className="py-3.5 px-3 text-center font-bold text-ink">
                        {candidate.assessmentScore !== undefined ? `${candidate.assessmentScore}/100` : "—"}
                      </td>

                      {/* AI Interview Score */}
                      <td className="py-3.5 px-3 text-center font-bold text-ink">
                        {candidate.aiScore !== undefined ? `${candidate.aiScore}/100` : "—"}
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-3 text-ink-soft text-[11px] whitespace-nowrap">
                        {candidate.stageDeadline ? (
                          new Date(candidate.stageDeadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* ATS Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                            candidate.status === "shortlisted"
                              ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                              : candidate.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : "bg-surface-alt text-ink-soft border border-border"
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsDrawerOpen(true);
                            }}
                            title="View Stage History"
                            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isFailed && !isNoShow && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenFail(candidate)}
                                title="Fail Candidate"
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                              {!isShortlisted && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAdvance(candidate)}
                                  title="Advance Stage"
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-bold shadow-2xs transition"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-border/70 bg-surface-alt/20 text-xs text-ink-soft flex items-center justify-between">
            <span>
              Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> total
              candidate applications
            </span>
            <span className="text-[11px]">Click any row to open candidate stage history</span>
          </div>
        </div>
      )}

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        jobId={selectedJobId}
        candidate={selectedCandidate}
        onAdvanceClick={(c) => handleOpenAdvance(c)}
        onFailClick={(c) => handleOpenFail(c)}
      />

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        type={confirmModalState.type}
        title={confirmModalState.title}
        description={confirmModalState.description}
        candidateName={
          confirmModalState.candidate
            ? typeof confirmModalState.candidate.userId === "object"
              ? (confirmModalState.candidate.userId as PopulatedUser)?.fullName
              : "Candidate"
            : undefined
        }
        onConfirm={handleExecuteModalAction}
      />

      {/* Init Pipeline Modal */}
      <InitPipelineModal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        jobId={selectedJobId}
        jobTitle={selectedJob?.title}
        onSuccess={loadCandidatesData}
      />
    </div>
  );
}
