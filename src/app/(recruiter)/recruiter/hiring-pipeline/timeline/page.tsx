"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Sliders,
  Brain,
  UserCheck,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  Layers,
  AlertTriangle,
  Loader2,
  PlusCircle,
  Award,
  Briefcase,
} from "lucide-react";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import { HiringPipelineHeader } from "@/features/hiringEngine/components/HiringPipelineHeader";
import { InitPipelineModal } from "@/features/hiringEngine/components/InitPipelineModal";
import { hiringEngineService } from "@/features/hiringEngine/services/hiringEngineService";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import {
  IFunnelMetricsReport,
  IStageMetrics,
  IHiringFunnelConfig,
} from "@/features/hiringEngine/types/hiringEngine.types";
import { RecruiterJob } from "@/features/recruiter/types";

const STAGE_TYPE_ICONS: Record<string, typeof FileText> = {
  resume_match: FileText,
  assessment: Sliders,
  ai_interview: Brain,
  manual_review: UserCheck,
  human_interview: UserCheck,
};

export default function HiringTimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(paramJobId || "");
  const [metrics, setMetrics] = useState<IFunnelMetricsReport | null>(null);
  const [config, setConfig] = useState<IHiringFunnelConfig | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInitModal, setShowInitModal] = useState(false);

  // 1. Load recruiter's active jobs
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

  // 2. Fetch metrics & config whenever selectedJobId changes
  const loadPipelineData = useCallback(async () => {
    if (!selectedJobId) {
      setMetrics(null);
      setConfig(null);
      return;
    }

    setLoadingMetrics(true);
    setError(null);

    try {
      const [metricsData, configData] = await Promise.all([
        hiringEngineService.getFunnelMetrics(selectedJobId),
        hiringEngineService.getPipelineConfig(selectedJobId).catch(() => null),
      ]);
      setMetrics(metricsData);
      setConfig(configData);
    } catch (err: any) {
      const isNotFound =
        err?.response?.status === 404 ||
        err?.statusCode === 404 ||
        err?.status === 404 ||
        err?.error?.code === "NOT_FOUND" ||
        err?.code === "NOT_FOUND";

      if (isNotFound) {
        // Pipeline not configured yet for this job
        setMetrics(null);
        setConfig(null);
        setError(null);
      } else {
        setError(
          err?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load pipeline data"
        );
      }
    } finally {
      setLoadingMetrics(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadPipelineData();
  }, [loadPipelineData]);

  const handleSelectJob = (newJobId: string) => {
    setSelectedJobId(newJobId);
    router.push(`/recruiter/hiring-pipeline/timeline?jobId=${newJobId}`);
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header with Job Selector, Real-time Metrics & Health state */}
      <HiringPipelineHeader
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
        metrics={metrics}
        loadingMetrics={loadingMetrics}
        onRefresh={loadPipelineData}
        onInitPipelineClick={() => setShowInitModal(true)}
      />

      {/* Navigation Tabs */}
      <HiringPipelineNavTabs jobId={selectedJobId} />

      {/* Content State */}
      {loadingJobs || (loadingMetrics && !metrics) ? (
        <div className="p-16 text-center space-y-3 bg-surface border border-border rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-semibold text-ink-soft">Loading Hiring Journey & Funnel Metrics...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3 bg-surface border border-rose-500/20 rounded-2xl shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-ink">Unable to Load Hiring Pipeline</h3>
          <p className="text-xs text-ink-soft max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={loadPipelineData}
            className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:bg-surface transition"
          >
            Retry
          </button>
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
        /* Empty State: Unconfigured Pipeline */
        <div className="p-12 text-center space-y-5 bg-surface border border-dashed border-border rounded-2xl shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-ink">
              Hiring Engine Not Initialized for this Position
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
              Activate automated candidate progression, mathematical capacity budgeting, and automatic reserve refills
              for <strong className="text-ink">{selectedJob?.title || "this job"}</strong>.
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
        /* Render Visual Hiring Journey */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Configured Stage Progression Journey
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Calculated backwards from final shortlist quota of {metrics.finalShortlistTarget} candidate
                {metrics.finalShortlistTarget > 1 ? "s" : ""}. Click any stage card to view candidates.
              </p>
            </div>
            <Link
              href={`/recruiter/hiring-pipeline/kanban?jobId=${selectedJobId}`}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>View Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Vertical/Horizontal Connected Stage Cards */}
          <div className="relative space-y-4">
            {metrics.stages.map((stage: IStageMetrics, index: number) => {
              const Icon = STAGE_TYPE_ICONS[stage.stageType] || FileText;
              const isLast = index === metrics.stages.length - 1;
              const fillPercentage = stage.targetCount > 0
                ? Math.min(100, Math.round((stage.activeCount / stage.targetCount) * 100))
                : 0;
              const hasDeficit = stage.deficit > 0;

              return (
                <div key={stage.stageId} className="flex flex-col items-center">
                  <div className="w-full bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md group">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Stage Identity */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-alt border border-border text-ink-soft">
                              STAGE {stage.order}
                            </span>
                            <h3 className="text-base font-extrabold text-ink">{stage.stageName}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20 capitalize">
                              {stage.stageType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft mt-1">
                            Intake Target: <strong className="text-ink font-bold">{stage.targetCount}</strong> | Active:{" "}
                            <strong className="text-ink font-bold">{stage.activeCount}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Real Candidate Counts Breakdown */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="px-3 py-1.5 rounded-xl bg-surface-alt/80 border border-border/70 text-center">
                          <span className="text-[10px] text-ink-soft block font-bold">Target</span>
                          <span className="text-sm font-extrabold text-ink">{stage.targetCount}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <span className="text-[10px] text-emerald-600 block font-bold">Passed</span>
                          <span className="text-sm font-extrabold text-emerald-600">{stage.passedCount}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                          <span className="text-[10px] text-blue-600 block font-bold">Invited</span>
                          <span className="text-sm font-extrabold text-blue-600">{stage.invitedCount}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                          <span className="text-[10px] text-rose-600 block font-bold">Failed</span>
                          <span className="text-sm font-extrabold text-rose-600">{stage.failedCount}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                          <span className="text-[10px] text-amber-600 block font-bold">No-Show</span>
                          <span className="text-sm font-extrabold text-amber-600">{stage.noShowCount}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                          <span className="text-[10px] text-purple-600 block font-bold">Reserve</span>
                          <span className="text-sm font-extrabold text-purple-600">{stage.reserveAvailable}</span>
                        </div>
                      </div>

                      {/* Action & Quick Filter Link */}
                      <div className="flex items-center gap-3 lg:border-l lg:border-border/70 lg:pl-5 shrink-0">
                        <Link
                          href={`/recruiter/hiring-pipeline/kanban?jobId=${selectedJobId}&stageId=${stage.stageId}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-xs font-bold text-ink shadow-xs transition"
                        >
                          <span>Inspect Stage</span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        </Link>
                      </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-ink-soft font-semibold">
                          Active Capacity: {stage.activeCount} / {stage.targetCount} ({fillPercentage}%)
                        </span>
                        {hasDeficit ? (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Deficit of {stage.deficit} candidate(s)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Stage Quota Satisfied
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasDeficit ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow down to next stage */}
                  {!isLast && (
                    <div className="py-2 text-ink-soft flex items-center gap-1">
                      <ArrowDown className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Target Destination Card */}
            <div className="w-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/30 rounded-2xl p-5 shadow-xs text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-glow text-xs font-bold border border-primary/30">
                <Award className="w-4 h-4" />
                <span>Final Target Destination: Shortlisted for Hire</span>
              </div>
              <h4 className="text-xl font-extrabold text-ink">
                {metrics.currentShortlistedCount} of {metrics.finalShortlistTarget} Final Shortlist Target Achieved
              </h4>
              <p className="text-xs text-ink-soft max-w-lg mx-auto">
                Candidates who successfully pass all configured screening stages reach the final shortlist in the
                applicant tracking system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Initialize Pipeline Modal */}
      <InitPipelineModal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        jobId={selectedJobId}
        jobTitle={selectedJob?.title}
        onSuccess={loadPipelineData}
      />
    </div>
  );
}
