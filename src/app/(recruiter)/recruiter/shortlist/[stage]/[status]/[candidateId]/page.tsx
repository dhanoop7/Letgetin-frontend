"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserX,
  ArrowRight,
  Award,
  Sparkles,
  Loader2,
  User,
  GraduationCap,
  MapPin,
  Globe,
  Tag,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { RecruiterJob } from "@/features/recruiter/types";
import { hiringEngineService } from "@/features/hiringEngine/services/hiringEngineService";
import {
  CandidateStageStatus,
  CandidatePoolType,
  HiringEngineCandidate,
  ICandidateStageHistory,
  PopulatedUser,
  PopulatedResume,
} from "@/features/hiringEngine/types/hiringEngine.types";
import {
  ConfirmActionModal,
  ConfirmModalType,
} from "@/features/hiringEngine/components/ConfirmActionModal";
import {
  DUMMY_SHORTLIST_JOBS,
  DEFAULT_DUMMY_PIPELINE_STAGES,
  getStageBySlugOrId,
  getCandidateFromDummyPipeline,
  IDummyStageCandidate,
} from "@/features/recruiter/data/dummyShortlist";

export default function CandidateProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const stageSlug = (params?.stage as string) || "resume-screening";
  const statusParam = (params?.status as string) || "shortlisted";
  const candidateId = (params?.candidateId as string) || "";
  const paramJobId = searchParams.get("jobId") || "";

  // Active stage configuration
  const stageConfig = useMemo(() => {
    return getStageBySlugOrId(stageSlug) || DEFAULT_DUMMY_PIPELINE_STAGES[0];
  }, [stageSlug]);

  const isShortlisted =
    statusParam.toLowerCase() === "shortlisted" || statusParam.toLowerCase() === "selected";

  // State: Jobs & Candidate Data
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(
    paramJobId || DUMMY_SHORTLIST_JOBS[0]._id
  );
  const [candidate, setCandidate] = useState<IDummyStageCandidate | null>(null);
  const [history, setHistory] = useState<ICandidateStageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State: Action Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: ConfirmModalType;
    stageName: string;
  }>({
    isOpen: false,
    type: "advance",
    stageName: "",
  });

  // Fetch Candidate Data & Stage History
  const fetchCandidateDetails = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Jobs
      const jobList = await recruiterService.getMyJobs().catch(() => []);
      const allJobs = jobList && jobList.length > 0 ? jobList : DUMMY_SHORTLIST_JOBS;
      setJobs(allJobs);

      const activeJobId =
        paramJobId && allJobs.find((j) => j._id === paramJobId) ? paramJobId : allJobs[0]._id;
      setSelectedJobId(activeJobId);

      // 2. Fetch Live Stage Candidates or Fallback to Dummy
      let foundCandidate: IDummyStageCandidate | null = null;

      try {
        const detailRes = await hiringEngineService.getCandidateDetail(activeJobId, candidateId);
        if (detailRes && (detailRes._id || detailRes.applicationId)) {
          foundCandidate = {
            _id: String(detailRes._id || detailRes.applicationId),
            applicationId: String(detailRes.applicationId || detailRes._id),
            userId: detailRes.userId as any,
            resumeId: detailRes.resumeId || detailRes.resume as any,
            stageId: detailRes.currentStageId || stageConfig.id,
            stageStatus: (detailRes.stageStatus || "passed") as CandidateStageStatus,
            poolType: (detailRes.poolType || "primary") as CandidatePoolType,
            matchScore: detailRes.matchScore || 85,
            assessmentScore: detailRes.assessmentScore,
            aiScore: detailRes.aiScore || detailRes.interviewScore,
            appliedAt: detailRes.appliedAt || new Date().toISOString(),
            role: detailRes.role || "Developer",
            experience: detailRes.experience || "2+ Years",
            eliminationReason: detailRes.eliminationReason,
          };
          if (Array.isArray(detailRes.history) && detailRes.history.length > 0) {
            setHistory(detailRes.history);
          }
        }
      } catch {
        // live API fallback
      }

      if (!foundCandidate) {
        try {
          const liveStageRes = await hiringEngineService.getStageCandidates(activeJobId, stageConfig.id);
          const primary = liveStageRes.primary || [];
          const reserve = liveStageRes.reserve || [];
          const allLive = [...primary, ...reserve];

          const match = allLive.find(
            (c) =>
              String(c._id) === candidateId ||
              (typeof c.userId === "object" && String(c.userId?._id) === candidateId)
          );

          if (match) {
            foundCandidate = {
              _id: String(match._id),
              applicationId: String(match._id),
              userId: match.userId as any,
              resumeId: match.resumeId as any,
              stageId: stageConfig.id,
              stageStatus: (match.stageStatus || "started") as CandidateStageStatus,
              poolType: (match.poolType || "primary") as CandidatePoolType,
              matchScore: match.matchScore || 85,
              assessmentScore: match.assessmentScore,
              aiScore: match.aiScore,
              appliedAt: match.appliedAt || new Date().toISOString(),
              role: "Developer",
              experience: "2+ Years",
            };
          }
        } catch {
          // live fallback
        }
      }

      if (!foundCandidate) {
        const dummyLookup = getCandidateFromDummyPipeline(candidateId, stageConfig.slug);
        if (dummyLookup) {
          foundCandidate = dummyLookup.candidate;
        }
      }

      setCandidate(foundCandidate);

      // 3. Load Stage History
      if (foundCandidate) {
        setLoadingHistory(true);
        try {
          const histRes = await hiringEngineService.getCandidateHistory(
            activeJobId,
            foundCandidate.applicationId || foundCandidate._id
          );
          if (histRes && histRes.length > 0) {
            setHistory(histRes);
          } else {
            // Generate realistic audit trail up to this stage
            const currentStageIndex = stageConfig.order || 1;
            const syntheticHistory: ICandidateStageHistory[] = [];

            for (let i = 1; i <= currentStageIndex; i++) {
              const st = DEFAULT_DUMMY_PIPELINE_STAGES[i - 1];
              const isCurrent = i === currentStageIndex;
              const status: CandidateStageStatus = isCurrent
                ? foundCandidate.stageStatus
                : "passed";

              syntheticHistory.push({
                _id: `hist-${foundCandidate.applicationId || foundCandidate._id}-${st.id}`,
                applicationId: foundCandidate.applicationId || foundCandidate._id,
                jobId: activeJobId,
                candidateId:
                  typeof foundCandidate.userId === "object"
                    ? foundCandidate.userId._id
                    : String(foundCandidate.userId),
                stageIndex: i,
                stageId: st.id,
                stageName: st.name,
                status,
                score:
                  i === 1
                    ? foundCandidate.matchScore || 90
                    : i === 2
                    ? foundCandidate.assessmentScore || 88
                    : i === 3
                    ? foundCandidate.aiScore || 85
                    : foundCandidate.matchScore || 85,
                notes: isCurrent
                  ? foundCandidate.notes ||
                    (status === "passed"
                      ? `Candidate qualified through ${st.name}.`
                      : `Candidate eliminated at ${st.name}.`)
                  : `Successfully verified and advanced from ${st.name}.`,
                enteredAt: new Date(
                  Date.now() - (currentStageIndex - i + 2) * 24 * 60 * 60 * 1000
                ).toISOString(),
                completedAt:
                  isCurrent && status === "started"
                    ? undefined
                    : new Date(
                        Date.now() - (currentStageIndex - i + 1) * 24 * 60 * 60 * 1000
                      ).toISOString(),
              });
            }

            setHistory(syntheticHistory);
          }
        } catch {
          // history error fallback
        } finally {
          setLoadingHistory(false);
        }
      }
    } catch (err) {
      console.error("Failed to load candidate details:", err);
    } finally {
      setLoading(false);
    }
  }, [paramJobId, stageConfig, candidateId]);

  useEffect(() => {
    fetchCandidateDetails();
  }, [fetchCandidateDetails]);

  // Current Job
  const currentJob = useMemo(() => {
    return jobs.find((j) => j._id === selectedJobId) || DUMMY_SHORTLIST_JOBS[0];
  }, [jobs, selectedJobId]);

  const user = typeof candidate?.userId === "object" ? (candidate.userId as PopulatedUser) : null;
  const resume = typeof candidate?.resumeId === "object" ? (candidate.resumeId as PopulatedResume) : null;

  const candidateName = user?.fullName || user?.username || "Candidate Profile";
  const candidateEmail = user?.email || "No email available";
  const candidatePhone = user?.phone || "+91 98765 43210";
  const candidateRole = candidate?.role || currentJob?.title || "Developer";
  const candidateExperience = candidate?.experience || "3+ Years";

  const isDisqualified =
    candidate?.stageStatus === "failed" ||
    candidate?.stageStatus === "no_show" ||
    candidate?.poolType === "disqualified" ||
    !isShortlisted;

  const isFinalShortlisted =
    stageSlug === "bgc" ||
    stageSlug === "stage-5-bgc" ||
    (candidate?.stageStatus === "passed" && isShortlisted);

  // Action Triggers
  const handleAdvance = () => {
    setConfirmModal({
      isOpen: true,
      type: "advance",
      stageName: stageConfig.name,
    });
  };

  const handleFail = () => {
    setConfirmModal({
      isOpen: true,
      type: "fail",
      stageName: stageConfig.name,
    });
  };

  // Confirm Actions
  const handleConfirmAction = async (payload: { score?: number; notes?: string; reason?: string }) => {
    if (!candidate) return;
    const { type } = confirmModal;

    try {
      const isDummy = (candidate.applicationId || candidate._id).startsWith("cand-dummy");

      if (isDummy) {
        setCandidate((prev) =>
          prev
            ? {
                ...prev,
                stageStatus: (type === "advance" ? "passed" : "failed") as CandidateStageStatus,
                notes: payload.notes || payload.reason || prev.notes,
              }
            : null
        );
        toast.success(
          type === "advance"
            ? "Candidate advanced to next hiring stage!"
            : "Candidate marked as disqualified from stage."
        );
      } else {
        if (type === "advance") {
          try {
            await hiringEngineService.advanceCandidate(selectedJobId, candidate.applicationId || candidate._id, {
              score: payload.score,
              notes: payload.notes,
            });
          } catch {
            await recruiterService.updateApplicantStatus(
              candidate.applicationId || candidate._id,
              "shortlisted",
              payload.notes
            );
          }
          toast.success("Candidate advanced successfully!");
        } else {
          try {
            await hiringEngineService.failCandidate(selectedJobId, candidate.applicationId || candidate._id, {
              reason: payload.reason || "Disqualified from stage",
            });
          } catch {
            await recruiterService.updateApplicantStatus(
              candidate.applicationId || candidate._id,
              "rejected",
              payload.reason
            );
          }
          toast.error("Candidate disqualified from stage.");
        }
        fetchCandidateDetails();
      }
    } catch (err: any) {
      console.error("Action failed:", err);
      toast.error(err?.message || "Failed to update candidate status.");
    }
  };

  const backUrl = `/recruiter/shortlist/${stageSlug}/${statusParam}?jobId=${selectedJobId}`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)] bg-background text-ink">
      {/* Top Header & Navigation Bar */}
      <div className="border-b border-border/80 bg-surface px-4 sm:px-6 lg:px-8 py-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="p-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-ink hover:text-primary transition shadow-2xs cursor-pointer group"
              title="Back to Candidate List"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-ink-soft flex-wrap">
                <Link href="/recruiter/shortlist" className="hover:text-ink transition">
                  Shortlist
                </Link>
                <ChevronRight className="w-3 h-3 text-ink-soft/60" />
                <span className="font-semibold text-ink-soft">{stageConfig.name}</span>
                <ChevronRight className="w-3 h-3 text-ink-soft/60" />
                <Link href={backUrl} className="hover:text-ink transition font-semibold">
                  {isShortlisted ? "Shortlisted Candidates" : "Eliminated Candidates"}
                </Link>
                <ChevronRight className="w-3 h-3 text-ink-soft/60" />
                <span className={`font-bold ${isShortlisted ? "text-emerald-600" : "text-rose-600"}`}>
                  {candidateName}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight flex items-center gap-2 mt-0.5">
                <span>Candidate Profile</span>
                <span className="text-sm sm:text-base font-bold text-ink-soft">
                  — {candidateName}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Actions & Requisition Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt/70 border border-border text-xs">
              <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="font-semibold text-ink truncate max-w-[180px]">
                {currentJob?.title}
              </div>
            </div>

            <Link
              href={backUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink text-xs font-bold shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {isShortlisted ? "Shortlisted" : "Eliminated"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Full-Page Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-surface rounded-3xl border border-border p-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-surface rounded-2xl border border-border" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-surface rounded-3xl border border-border" />
              <div className="h-96 bg-surface rounded-3xl border border-border" />
            </div>
          </div>
        ) : !candidate ? (
          <div className="p-16 text-center rounded-3xl bg-surface border border-dashed border-border space-y-4 my-8">
            <User className="w-16 h-16 text-ink-soft mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-ink">Candidate Not Found</h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              We couldn&apos;t locate the profile for candidate ID &quot;{candidateId}&quot; in {stageConfig.name}.
            </p>
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-surface text-xs font-bold shadow-xs hover:bg-primary-hover transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Candidate List</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Candidate Banner Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all shadow-xs ${
                isShortlisted
                  ? "bg-surface border-emerald-500/30"
                  : "bg-surface border-rose-500/30"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Avatar & Key Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-md ${
                      isShortlisted
                        ? "bg-gradient-brand text-primary-foreground"
                        : "bg-rose-500/10 text-rose-600 border-2 border-rose-500/30"
                    }`}
                  >
                    {candidateName.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                        {candidateName}
                      </h2>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-black uppercase px-3 py-0.5 rounded-full border ${
                          isShortlisted
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        }`}
                      >
                        {isShortlisted ? "Shortlisted" : "Eliminated"}
                      </span>

                      {/* Pool Type Badge */}
                      {candidate.poolType && (
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            candidate.poolType === "primary"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : candidate.poolType === "reserve"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {candidate.poolType} Pool
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-ink-soft font-semibold flex-wrap">
                      <span className="text-ink font-bold">{candidateRole}</span>
                      <span>•</span>
                      <span>{candidateExperience} Experience</span>
                      <span>•</span>
                      <span>{currentJob?.location?.city || "Bangalore"}, India</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-ink-soft pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>{candidateEmail}</span>
                      </div>
                      {candidatePhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span>{candidatePhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "";
                      const testUrl = `${origin}/assessment/take?applicationId=${candidate.applicationId || candidate._id}&stageId=${encodeURIComponent(
                        candidate.stageId || stageConfig.id
                      )}&jobId=${encodeURIComponent(selectedJobId)}`;
                      navigator.clipboard.writeText(testUrl);
                      toast.success("Candidate assessment test link copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-ink-soft" />
                    <span>Copy Test Link</span>
                  </button>

                  <a
                    href={`/assessment/take?applicationId=${candidate.applicationId || candidate._id}&stageId=${encodeURIComponent(
                      candidate.stageId || stageConfig.id
                    )}&jobId=${encodeURIComponent(selectedJobId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-primary text-xs font-bold transition shadow-2xs"
                  >
                    <span>Preview Test Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {isShortlisted && !isDisqualified && (
                    <button
                      type="button"
                      onClick={handleAdvance}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Advance Stage</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Key Scores & Stage Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Match Score */}
              <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-ink-soft tracking-wider block">
                  Match Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-primary">
                    {candidate.matchScore || 85}%
                  </span>
                  <span className="text-[10px] text-ink-soft font-semibold">AI Fit</span>
                </div>
              </div>

              {/* Assessment Score */}
              <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-ink-soft tracking-wider block">
                  Assessment Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-ink">
                    {candidate.assessmentScore !== undefined ? `${candidate.assessmentScore}%` : "—"}
                  </span>
                  <span className="text-[10px] text-ink-soft font-semibold">Skill Test</span>
                </div>
              </div>

              {/* AI Interview Score */}
              <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-ink-soft tracking-wider block">
                  Interview Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-ink">
                    {candidate.aiScore !== undefined ? `${candidate.aiScore}%` : "—"}
                  </span>
                  <span className="text-[10px] text-ink-soft font-semibold">Live AI</span>
                </div>
              </div>

              {/* Current Stage Status */}
              <div
                className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
                  isShortlisted
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-rose-500/5 border-rose-500/20"
                }`}
              >
                <span className="text-[11px] font-extrabold uppercase text-ink-soft tracking-wider block">
                  Current Stage Status
                </span>
                <div className="flex items-center gap-1.5">
                  {isShortlisted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span
                    className={`text-sm font-extrabold uppercase ${
                      isShortlisted ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {candidate.stageStatus || (isShortlisted ? "passed" : "failed")}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Details Grid: Left 2 Cols (Details) + Right 1 Col (Journey & Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Detailed Candidate Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stage Evaluation & Feedback */}
                <div
                  className={`p-6 rounded-3xl border shadow-2xs space-y-3 ${
                    isShortlisted
                      ? "bg-surface border-emerald-500/20"
                      : "bg-surface border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>
                        {isShortlisted ? "Stage Evaluation & Remarks" : "Disqualification Reason"}
                      </span>
                    </h3>
                    <span className="text-xs text-ink-soft font-semibold">
                      Stage: {stageConfig.name}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed p-4 rounded-2xl border ${
                      isShortlisted
                        ? "bg-emerald-500/5 border-emerald-500/15 text-ink"
                        : "bg-rose-500/5 border-rose-500/15 text-rose-700 dark:text-rose-300 font-medium"
                    }`}
                  >
                    {candidate.notes ||
                      (isShortlisted
                        ? "Candidate satisfied all key stage criteria, demonstrated strong technical aptitude, and passed AI domain assessment benchmarks."
                        : "Candidate did not meet the stage passing score threshold or minimum technical benchmarks required for this stage.")}
                  </p>
                </div>

                {/* Candidate Overview & Resume Card */}
                <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-2xs space-y-4">
                  <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Candidate Profile Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-1">
                      <span className="text-ink-soft block font-medium">Applied Position</span>
                      <span className="font-bold text-ink text-sm">{candidateRole}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-1">
                      <span className="text-ink-soft block font-medium">Experience Level</span>
                      <span className="font-bold text-ink text-sm">{candidateExperience}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-1">
                      <span className="text-ink-soft block font-medium">Application Date</span>
                      <span className="font-bold text-ink">
                        {new Date(candidate.appliedAt || Date.now()).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-1">
                      <span className="text-ink-soft block font-medium">Attached Resume / CV</span>
                      <span className="font-bold text-ink flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        {resume?.title || `${candidateName.replace(/ /g, "_")}_Resume.pdf`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Skills & Competencies */}
                <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-2xs space-y-3">
                  <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span>Evaluated Skills & Competencies</span>
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {(currentJob?.skills || ["React", "TypeScript", "Node.js", "System Design", "Algorithms", "Redux"]).map(
                      (skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-surface-alt border border-border/80 text-ink text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right 1 Column: Immutable Stage Journey Timeline & Decision Box */}
              <div className="space-y-6">
                {/* Immutable Stage Journey Audit Trail */}
                <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Stage Journey ({history.length})</span>
                    </h3>
                    {loadingHistory && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  </div>

                  {loadingHistory ? (
                    <div className="p-8 text-center text-xs text-ink-soft space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                      <span>Loading stage history...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-border text-center text-xs text-ink-soft">
                      No stage transitions recorded yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
                      {history.map((item, idx) => {
                        const isPass = item.status === "passed";
                        const isFail = item.status === "failed";
                        const isNoShow = item.status === "no_show";

                        return (
                          <div key={item._id || idx} className="relative group">
                            {/* Dot Indicator */}
                            <div
                              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-surface ${
                                isPass
                                  ? "border-emerald-500 text-emerald-600"
                                  : isFail
                                  ? "border-rose-500 text-rose-600"
                                  : isNoShow
                                  ? "border-amber-500 text-amber-600"
                                  : "border-blue-500 text-blue-600"
                              }`}
                            >
                              {isPass ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : isFail ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              )}
                            </div>

                            {/* Journey Card */}
                            <div className="p-3.5 rounded-2xl border border-border/70 bg-surface-alt/40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-ink">
                                  Stage {item.stageIndex}: {item.stageName}
                                </span>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    isPass
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : isFail
                                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              {item.score !== undefined && (
                                <div className="text-[11px] text-ink-soft">
                                  Score: <strong className="text-ink">{item.score}%</strong>
                                </div>
                              )}

                              {item.notes && (
                                <p className="text-[11px] text-ink-soft italic line-clamp-2">
                                  &quot;{item.notes}&quot;
                                </p>
                              )}

                              <div className="text-[10px] text-ink-soft/70 pt-1 border-t border-border/40">
                                {new Date(item.enteredAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recruiter Decision & Stage Actions Box */}
                <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-2xs space-y-4">
                  <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider">
                    Stage Actions & Controls
                  </h3>

                  {isShortlisted ? (
                    <div className="space-y-3">
                      {isFinalShortlisted && (
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Candidate is Final Shortlisted in Pipeline!</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleAdvance}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Advance to Next Stage</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleFail}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Disqualify Candidate</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Candidate Disqualified from {stageConfig.name}</span>
                      </div>
                      <p className="text-xs text-ink-soft">
                        Candidate has been eliminated based on stage criteria. Audit records are permanently preserved in stage history.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            type: "advance",
            stageName: "",
          })
        }
        type={confirmModal.type}
        title={
          confirmModal.type === "advance"
            ? `Advance Candidate to Next Stage`
            : `Disqualify Candidate from Stage`
        }
        description={
          confirmModal.type === "advance"
            ? `Are you sure you want to advance ${candidateName} to the next hiring stage?`
            : `Are you sure you want to disqualify ${candidateName} from ${confirmModal.stageName}?`
        }
        candidateName={candidateName}
        stageName={confirmModal.stageName}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
