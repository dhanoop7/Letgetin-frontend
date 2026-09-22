"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  KanbanSquare,
  Search,
  Filter,
  Plus,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserX,
  RefreshCw,
  Layers,
  Award,
  Loader2,
  Sliders,
  Brain,
  FileText,
  UserCheck,
  Eye,
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
  IStageMetrics,
  HiringEngineCandidate,
  PopulatedUser,
  PopulatedResume,
} from "@/features/hiringEngine/types/hiringEngine.types";
import { RecruiterJob } from "@/features/recruiter/types";

export default function HiringKanbanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramJobId = searchParams.get("jobId");
  const paramStageId = searchParams.get("stageId");

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(paramJobId || "");
  const [metrics, setMetrics] = useState<IFunnelMetricsReport | null>(null);
  const [stageCandidates, setStageCandidates] = useState<
    Record<string, { primary: HiringEngineCandidate[]; reserve: HiringEngineCandidate[] }>
  >({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    stageId?: string;
    stageName?: string;
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

  // 2. Load board data (funnel metrics + candidates for each stage)
  const loadBoardData = useCallback(async () => {
    if (!selectedJobId) {
      setMetrics(null);
      setStageCandidates({});
      return;
    }

    setLoadingBoard(true);
    try {
      const metricsData = await hiringEngineService.getFunnelMetrics(selectedJobId);
      setMetrics(metricsData);

      // Load candidates for every stage
      if (metricsData?.stages && metricsData.stages.length > 0) {
        const stageResults = await Promise.all(
          metricsData.stages.map((stage) =>
            hiringEngineService
              .getStageCandidates(selectedJobId, stage.stageId)
              .catch(() => ({ stageId: stage.stageId, primary: [], reserve: [] }))
          )
        );

        const candMap: Record<string, { primary: HiringEngineCandidate[]; reserve: HiringEngineCandidate[] }> = {};
        stageResults.forEach((res) => {
          candMap[res.stageId] = {
            primary: res.primary || [],
            reserve: res.reserve || [],
          };
        });
        setStageCandidates(candMap);
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
        setStageCandidates({});
      } else {
        toast.error(
          err?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load Kanban board data."
        );
      }
    } finally {
      setLoadingBoard(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  const handleSelectJob = (newJobId: string) => {
    setSelectedJobId(newJobId);
    router.push(`/recruiter/hiring-pipeline/kanban?jobId=${newJobId}`);
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // Actions
  const handleOpenAdvanceModal = (candidate: HiringEngineCandidate, stageName?: string) => {
    const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
    const name = user?.fullName || user?.username || "Candidate";
    setConfirmModalState({
      isOpen: true,
      type: "advance",
      title: "Advance Candidate to Next Stage",
      description: `Are you sure you want to advance ${name} to the next stage? If this is the final stage, they will reach the shortlist.`,
      candidate,
      stageName,
    });
  };

  const handleOpenFailModal = (candidate: HiringEngineCandidate, stageName?: string) => {
    const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
    const name = user?.fullName || user?.username || "Candidate";
    setConfirmModalState({
      isOpen: true,
      type: "fail",
      title: "Mark Candidate as Failed",
      description: `Are you sure you want to disqualify ${name}? If auto-refill is enabled, a reserve candidate will be automatically promoted to meet the stage deficit.`,
      candidate,
      stageName,
    });
  };

  const handleOpenRefillModal = (stageId: string, stageName: string) => {
    setConfirmModalState({
      isOpen: true,
      type: "refill",
      title: `Manual Refill: ${stageName}`,
      description: `Pull candidates from the reserve pool into this stage's primary active pool.`,
      stageId,
      stageName,
    });
  };

  const handleExecuteModalAction = async (payload: {
    score?: number;
    notes?: string;
    reason?: string;
    count?: number;
  }) => {
    if (!selectedJobId) return;

    try {
      if (confirmModalState.type === "advance" && confirmModalState.candidate) {
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
      } else if (confirmModalState.type === "fail" && confirmModalState.candidate) {
        const res = await hiringEngineService.failCandidate(
          selectedJobId,
          confirmModalState.candidate._id,
          { reason: payload.reason }
        );
        if (res.promotedCount > 0) {
          toast.success(
            `Candidate failed. Automatically promoted ${res.promotedCount} candidate(s) from reserve pool.`
          );
        } else {
          toast.success("Candidate marked as failed.");
        }
      } else if (confirmModalState.type === "refill" && confirmModalState.stageId) {
        const res = await hiringEngineService.refillStage(
          selectedJobId,
          confirmModalState.stageId,
          { count: payload.count }
        );
        if (res.promotedCount > 0) {
          toast.success(`Successfully promoted ${res.promotedCount} reserve candidate(s).`);
        } else {
          toast.info("No reserve candidates were available or needed.");
        }
      }

      await loadBoardData();
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Action failed.");
    }
  };

  // Filter helper for candidate cards
  const filterCandidates = (list: HiringEngineCandidate[]) => {
    return list.filter((c) => {
      const user = typeof c.userId === "object" ? (c.userId as PopulatedUser) : null;
      const name = (user?.fullName || user?.username || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || name.includes(query) || email.includes(query);
      const matchesStatus = statusFilter === "all" || c.stageStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <HiringPipelineHeader
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
        metrics={metrics}
        loadingMetrics={loadingBoard}
        onRefresh={loadBoardData}
        onInitPipelineClick={() => setShowInitModal(true)}
      />

      {/* Tabs */}
      <HiringPipelineNavTabs jobId={selectedJobId} />

      {/* Board Controls: Search & Status Filters */}
      {metrics && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-alt/70 border border-border rounded-xl text-ink outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-ink-soft" />
            <span className="text-xs text-ink-soft font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface-alt/70 border border-border rounded-xl text-ink outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="invited">Invited</option>
              <option value="started">Started</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="no_show">No-Show</option>
            </select>
          </div>
        </div>
      )}

      {/* Kanban Board Container */}
      {loadingJobs || (loadingBoard && !metrics) ? (
        <div className="p-16 text-center space-y-3 bg-surface border border-border rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-semibold text-ink-soft">Loading Kanban Stage Columns & Candidates...</p>
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
            <KanbanSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-ink">Hiring Engine Not Initialized</h3>
            <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
              Initialize the automated stage pipeline for <strong className="text-ink">{selectedJob?.title}</strong> to
              manage candidates on this Kanban board.
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
      ) : (
        /* Render Dynamic Kanban Columns */
        <div className="flex gap-5 overflow-x-auto pb-6 pt-1 items-start min-h-[550px] scrollbar-thin">
          {metrics.stages.map((stage: IStageMetrics) => {
            const pool = stageCandidates[stage.stageId] || { primary: [], reserve: [] };
            const filteredPrimary = filterCandidates(pool.primary);
            const filteredReserve = filterCandidates(pool.reserve);

            const isHighlighted = paramStageId === stage.stageId;
            const hasDeficit = stage.deficit > 0;

            return (
              <div
                key={stage.stageId}
                className={`w-80 shrink-0 bg-surface-alt/30 border rounded-2xl flex flex-col max-h-[750px] transition-all shadow-xs ${
                  isHighlighted ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border/80 bg-surface rounded-t-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-surface-alt border border-border text-ink-soft">
                        #{stage.order}
                      </span>
                      <h3 className="text-xs font-extrabold text-ink truncate max-w-[170px]" title={stage.stageName}>
                        {stage.stageName}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      {stage.activeCount ?? pool.primary.length}/{stage.targetCount}
                    </span>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-ink-soft">
                      <span>Target: {stage.targetCount}</span>
                      {hasDeficit ? (
                        <span className="text-amber-600 font-bold">Deficit: {stage.deficit}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Full</span>
                      )}
                    </div>
                    <div className="w-full bg-surface-alt h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          hasDeficit ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round(((stage.activeCount ?? pool.primary.length) / stage.targetCount) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Refill Button if deficit and reserve exists */}
                  {hasDeficit && pool.reserve.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenRefillModal(stage.stageId, stage.stageName)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refill Stage from Reserve ({pool.reserve.length} available)</span>
                    </button>
                  )}
                </div>

                {/* Candidate Cards Scrollable Body */}
                <div className="p-3 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
                  {/* ======================================================== */}
                  {/* 1. PRIMARY CANDIDATES SECTION */}
                  {/* ======================================================== */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] px-1 font-bold text-ink uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Primary Candidates ({filteredPrimary.length})
                      </span>
                    </div>

                    {filteredPrimary.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border/80 text-center text-[11px] text-ink-soft bg-surface/50">
                        No active primary candidates in this stage.
                      </div>
                    ) : (
                      filteredPrimary.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          stageName={stage.stageName}
                          isPrimary={true}
                          onCardClick={() => {
                            setSelectedCandidate(candidate);
                            setIsDrawerOpen(true);
                          }}
                          onAdvance={() => handleOpenAdvanceModal(candidate, stage.stageName)}
                          onFail={() => handleOpenFailModal(candidate, stage.stageName)}
                        />
                      ))
                    )}
                  </div>

                  {/* ======================================================== */}
                  {/* 2. RESERVE CANDIDATES SECTION (VISUALLY SECONDARY) */}
                  {/* ======================================================== */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-[11px] px-1 font-bold text-ink-soft uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Layers className="w-3.5 h-3.5" />
                        Reserve Pool ({filteredReserve.length})
                      </span>
                      <span className="text-[10px] lowercase text-ink-soft/70">auto-refill backup</span>
                    </div>

                    {filteredReserve.length === 0 ? (
                      <div className="p-3 rounded-xl border border-dashed border-border/60 text-center text-[10px] text-ink-soft bg-surface/30">
                        No reserve candidates in reserve pool.
                      </div>
                    ) : (
                      filteredReserve.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          stageName={stage.stageName}
                          isPrimary={false}
                          onCardClick={() => {
                            setSelectedCandidate(candidate);
                            setIsDrawerOpen(true);
                          }}
                          onAdvance={() => handleOpenAdvanceModal(candidate, stage.stageName)}
                          onFail={() => handleOpenFailModal(candidate, stage.stageName)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Final Shortlist Authoritative Destination Column */}
          <div className="w-80 shrink-0 bg-gradient-to-b from-purple-500/10 via-primary/5 to-surface-alt/30 border border-purple-500/30 rounded-2xl flex flex-col max-h-[750px] shadow-xs">
            <div className="p-4 border-b border-purple-500/20 bg-surface/90 rounded-t-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-ink">
                    Final Shortlist
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-purple-600 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  {metrics.currentShortlistedCount}/{metrics.finalShortlistTarget}
                </span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Candidates completing the final stage enter recruiter review & offer extension.
              </p>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-ink">
                  {metrics.currentShortlistedCount} Finalist{metrics.currentShortlistedCount === 1 ? "" : "s"} Ready
                </h4>
                <p className="text-xs text-ink-soft max-w-[200px] mx-auto">
                  Review verified candidate profiles, extend offers, and record decisions.
                </p>
              </div>

              <Link
                href={`/recruiter/hiring-pipeline/final-shortlist?jobId=${selectedJobId}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition"
              >
                <span>View Finalists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        jobId={selectedJobId}
        candidate={selectedCandidate}
        onAdvanceClick={(c) => handleOpenAdvanceModal(c)}
        onFailClick={(c) => handleOpenFailModal(c)}
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
        stageName={confirmModalState.stageName}
        onConfirm={handleExecuteModalAction}
      />

      {/* Init Pipeline Modal */}
      <InitPipelineModal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        jobId={selectedJobId}
        jobTitle={selectedJob?.title}
        onSuccess={loadBoardData}
      />
    </div>
  );
}

// Subcomponent: Candidate Card
function CandidateCard({
  candidate,
  stageName,
  isPrimary,
  onCardClick,
  onAdvance,
  onFail,
}: {
  candidate: HiringEngineCandidate;
  stageName: string;
  isPrimary: boolean;
  onCardClick: () => void;
  onAdvance: () => void;
  onFail: () => void;
}) {
  const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
  const name = user?.fullName || user?.username || "Candidate";
  const email = user?.email;

  const isFailed = candidate.stageStatus === "failed";
  const isNoShow = candidate.stageStatus === "no_show";
  const isPassed = candidate.stageStatus === "passed";
  const isFinalShortlisted = candidate.status === "shortlisted" || candidate.stageStatus === "passed";

  return (
    <div
      onClick={onCardClick}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs group space-y-2.5 ${
        isPrimary
          ? "bg-surface border-border hover:border-primary/50"
          : "bg-surface/60 border-border/70 hover:border-amber-500/40 opacity-90 hover:opacity-100"
      }`}
    >
      {/* Top Row: Name & Pool Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              isPrimary
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
            }`}
          >
            {(name?.[0] || "C").toUpperCase()}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-ink truncate group-hover:text-primary transition-colors">
              {name}
            </h4>
            {email && <p className="text-[10px] text-ink-soft truncate">{email}</p>}
          </div>
        </div>

        {/* Status Indicator */}
        <span
          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
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
      </div>

      {/* Middle Badges: Match Score, Assessment & AI Interview */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        {candidate.matchScore !== undefined && (
          <span className="px-1.5 py-0.5 rounded-md bg-surface-alt border border-border/60 text-ink font-semibold">
            Match: <strong className="text-primary-glow font-bold">{Math.round(candidate.matchScore)}%</strong>
          </span>
        )}
        {candidate.assessmentScore !== undefined && (
          <span className="px-1.5 py-0.5 rounded-md bg-surface-alt border border-border/60 text-ink font-semibold">
            Test: <strong>{candidate.assessmentScore}</strong>
          </span>
        )}
        {candidate.aiScore !== undefined && (
          <span className="px-1.5 py-0.5 rounded-md bg-surface-alt border border-border/60 text-ink font-semibold">
            AI: <strong>{candidate.aiScore}</strong>
          </span>
        )}
      </div>

      {/* Deadline Notice */}
      {candidate.stageDeadline && (
        <div className="text-[10px] text-ink-soft flex items-center gap-1">
          <Clock className="w-3 h-3 text-ink-soft/70" />
          <span>
            Due:{" "}
            {new Date(candidate.stageDeadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Quick Recruiter Action Bar on hover */}
      <div
        className="pt-2 border-t border-border/50 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCardClick}
          className="text-[10px] font-semibold text-ink-soft hover:text-ink flex items-center gap-1 transition"
        >
          <Eye className="w-3 h-3" />
          <span>History</span>
        </button>

        {!isFailed && !isNoShow && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onFail}
              title="Fail candidate"
              className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition"
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
            {!isFinalShortlisted ? (
              <button
                type="button"
                onClick={onAdvance}
                title="Advance candidate"
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold transition"
              >
                <span>Advance</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : (
              <span className="text-[9px] font-extrabold text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                Final Shortlisted
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
