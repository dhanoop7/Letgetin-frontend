"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  Clock,
  Layers,
  Award,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  SlidersHorizontal,
  X,
  FileCheck2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { RecruiterJob, Applicant } from "@/features/recruiter/types";
import { hiringEngineService } from "@/features/hiringEngine/services/hiringEngineService";
import {
  CandidateStageStatus,
  CandidatePoolType,
  HiringEngineCandidate,
  PopulatedUser,
  PopulatedResume,
} from "@/features/hiringEngine/types/hiringEngine.types";
import {
  ConfirmActionModal,
  ConfirmModalType,
} from "@/features/hiringEngine/components/ConfirmActionModal";
import { ApplicantResumeModal } from "@/features/recruiter/components/ApplicantResumeModal";
import {
  DUMMY_SHORTLIST_JOBS,
  DEFAULT_DUMMY_PIPELINE_STAGES,
  getStageBySlugOrId,
  IDummyStageCandidate,
} from "@/features/recruiter/data/dummyShortlist";

export default function ShortlistStageCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const stageSlug = (params?.stage as string) || "resume-screening";
  const statusParam = (params?.status as string) || "shortlisted";
  const paramJobId = searchParams.get("jobId") || "";

  // Active stage configuration
  const stageConfig = useMemo(() => {
    return getStageBySlugOrId(stageSlug) || DEFAULT_DUMMY_PIPELINE_STAGES[0];
  }, [stageSlug]);

  const isShortlisted = statusParam.toLowerCase() === "shortlisted" || statusParam.toLowerCase() === "selected";
  const statusTitle = isShortlisted ? "Shortlisted Candidates" : "Eliminated Candidates";

  // State: Jobs
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(paramJobId || DUMMY_SHORTLIST_JOBS[0]._id);
  const [loading, setLoading] = useState(true);

  // State: Candidates
  const [candidates, setCandidates] = useState<IDummyStageCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name" | "recent">("score");

  // State: View Resume Modal
  const [selectedApplicantForResume, setSelectedApplicantForResume] = useState<Applicant | null>(null);

  // State: Action Modals

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: ConfirmModalType;
    candidate: IDummyStageCandidate | null;
    stageName: string;
  }>({
    isOpen: false,
    type: "advance",
    candidate: null,
    stageName: "",
  });

  // Fetch Jobs & Candidates
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const jobList = await recruiterService.getMyJobs().catch(() => []);
      const allJobs = jobList && jobList.length > 0 ? jobList : DUMMY_SHORTLIST_JOBS;
      setJobs(allJobs);

      const activeJobId = paramJobId && allJobs.find((j) => j._id === paramJobId) ? paramJobId : allJobs[0]._id;
      setSelectedJobId(activeJobId);

      // Load candidates for this stage & status
      let stageCandidates: IDummyStageCandidate[] = [];

      try {
        const liveStageRes = await hiringEngineService.getShortlistStageCandidates(
          activeJobId,
          stageConfig.id || stageSlug,
          isShortlisted ? "shortlisted" : "eliminated"
        );
        const liveList = liveStageRes.candidates || [];

        if (liveList.length > 0) {
          stageCandidates = liveList.map((c: any) => ({
            _id: String(c._id || c.applicationId),
            applicationId: String(c.applicationId || c._id),
            userId: c.userId as any,
            resumeId: c.resumeId as any,
            stageId: stageConfig.id,
            stageStatus: (c.stageStatus || (isShortlisted ? "passed" : "failed")) as CandidateStageStatus,
            poolType: (c.poolType || (isShortlisted ? "primary" : "disqualified")) as CandidatePoolType,
            matchScore: c.matchScore || 85,
            assessmentScore: c.assessmentScore,
            aiScore: c.aiScore || c.interviewScore,
            appliedAt: c.appliedAt || new Date().toISOString(),
            role: c.role || "Developer",
            experience: c.experience || "2+ Years",
            eliminationReason: c.eliminationReason,
          }));
        } else {
          stageCandidates = stageConfig.candidates.filter((c) =>
            isShortlisted ? c.stageStatus === "passed" : c.stageStatus === "failed" || c.stageStatus === "no_show"
          );
        }
      } catch {
        stageCandidates = stageConfig.candidates.filter((c) =>
          isShortlisted ? c.stageStatus === "passed" : c.stageStatus === "failed" || c.stageStatus === "no_show"
        );
      }

      setCandidates(stageCandidates);
    } catch (err) {
      console.error("Failed to load stage candidates:", err);
      setCandidates(
        stageConfig.candidates.filter((c) => (isShortlisted ? c.stageStatus === "passed" : c.stageStatus === "failed"))
      );
    } finally {
      setLoading(false);
    }
  }, [paramJobId, stageConfig, isShortlisted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Current Job Object
  const currentJob = useMemo(() => {
    return jobs.find((j) => j._id === selectedJobId) || DUMMY_SHORTLIST_JOBS[0];
  }, [jobs, selectedJobId]);

  // Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = candidates.filter((c) => {
      const user = typeof c.userId === "object" ? (c.userId as PopulatedUser) : null;
      const name = user?.fullName || user?.username || "";
      const email = user?.email || "";
      const role = c.role || "";

      return !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || role.toLowerCase().includes(q);
    });

    if (sortBy === "score") {
      list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => {
        const nameA = typeof a.userId === "object" ? a.userId.fullName || "" : "";
        const nameB = typeof b.userId === "object" ? b.userId.fullName || "" : "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    }

    return list;
  }, [candidates, searchQuery, sortBy]);

  // Open Candidate Detail Full Page
  const handleOpenProfile = (c: IDummyStageCandidate) => {
    const candidateId = c.applicationId || c._id;
    router.push(
      `/recruiter/shortlist/${stageSlug}/${statusParam}/${candidateId}?jobId=${selectedJobId}`
    );
  };

  // Open Candidate Resume Modal
  const handleOpenResume = (c: IDummyStageCandidate) => {
    const user = typeof c.userId === "object" ? (c.userId as PopulatedUser) : null;
    const resume = typeof c.resumeId === "object" ? (c.resumeId as PopulatedResume) : null;
    const name = user?.fullName || user?.username || "Candidate";
    const email = user?.email || "";
    const phone = user?.phone || "";
    const role = c.role || currentJob?.title || "Software Engineer";
    const experience = c.experience || "3+ Years";

    const applicantObj: Applicant = {
      _id: c.applicationId || c._id,
      candidate: {
        _id: user?._id || c._id,
        fullName: name,
        email: email,
        phone: phone,
        avatarUrl: user?.avatarUrl,
      },
      resume: {
        _id: resume?._id || `resume-${c._id}`,
        title: resume?.title || `${name.replace(/ /g, "_")}_Resume.pdf`,
        atsScore: resume?.atsScore || c.matchScore || 85,
        content: {
          personalInfo: {
            fullName: name,
            headline: `${role} • ${experience} Experience`,
            email: email,
            phone: phone,
            location: `${currentJob?.location?.city || "Bangalore"}, India`,
            websiteUrl: "https://github.com",
          },
          summary:
            c.notes ||
            `Experienced ${role} with ${experience} of professional background delivering robust applications, collaborating with agile engineering teams, and optimizing production workflows.`,
          experiences: [
            {
              company: "TechNova Solutions",
              position: role,
              location: "Bangalore, India",
              startDate: "2022-01",
              endDate: "Present",
              isCurrent: true,
              highlights: [
                "Architected modular frontend workflows and scalable backend integrations.",
                "Improved response latencies and reduced bundle sizes across services.",
                "Mentored team members and maintained high software engineering standards.",
              ],
            },
            {
              company: "Innovate Apps Inc",
              position: `Associate ${role}`,
              location: "Hyderabad, India",
              startDate: "2020-06",
              endDate: "2021-12",
              isCurrent: false,
              highlights: [
                "Built user interfaces with clean TypeScript and accessible component designs.",
                "Integrated RESTful endpoints and participated in sprint reviews.",
              ],
            },
          ],
          educations: [
            {
              institution: "National Institute of Technology",
              degree: "Bachelor of Technology (B.Tech)",
              fieldOfStudy: "Computer Science & Engineering",
              startDate: "2016-08",
              endDate: "2020-05",
              gradeScore: "8.8 / 10 CGPA",
            },
          ],
          skills: (currentJob?.skills || ["React", "TypeScript", "Node.js", "JavaScript", "Redux", "REST APIs", "Tailwind CSS", "Git"]).map(
            (s) => (typeof s === "string" ? s : (s as any).name || "Skill")
          ),
          projects: [
            {
              title: "Enterprise Web Platform",
              subtitle: "Scalable candidate management platform",
              link: "https://github.com",
              technologies: ["React", "TypeScript", "Tailwind CSS"],
              highlights: [
                "Created responsive dashboard metrics and secure authorization pipelines.",
              ],
            },
          ],
          certificates: [
            {
              name: "Certified Full Stack Developer",
              issuer: "Technical Certification Institute",
              issueDate: "2023",
            },
          ],
          languages: [
            { language: "English", proficiency: "Professional working proficiency" },
            { language: "Hindi", proficiency: "Native / Bilingual" },
          ],
        },
      },
      status: c.stageStatus,
      matchScore: c.matchScore || 85,
      assessmentScore: c.assessmentScore,
      aiScore: c.aiScore,
      notes: c.notes || "",
      appliedAt: c.appliedAt || new Date().toISOString(),
    };

    setSelectedApplicantForResume(applicantObj);
  };

  // Open Confirm Action Modal
  const handleAdvance = (c: IDummyStageCandidate) => {
    setConfirmModal({
      isOpen: true,
      type: "advance",
      candidate: c,
      stageName: stageConfig.name,
    });
  };

  const handleFail = (c: IDummyStageCandidate) => {
    setConfirmModal({
      isOpen: true,
      type: "fail",
      candidate: c,
      stageName: stageConfig.name,
    });
  };

  // Execute Action
  const handleConfirmAction = async (payload: { score?: number; notes?: string; reason?: string }) => {
    if (!confirmModal.candidate) return;
    const { candidate, type } = confirmModal;

    try {
      const isDummy = candidate.applicationId.startsWith("cand-dummy");

      if (isDummy) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.applicationId === candidate.applicationId
              ? {
                  ...c,
                  stageStatus: (type === "advance" ? "passed" : "failed") as CandidateStageStatus,
                  notes: payload.notes || payload.reason || c.notes,
                }
              : c
          )
        );
        toast.success(
          type === "advance"
            ? "Candidate advanced to the next stage!"
            : "Candidate disqualified from the stage."
        );
      } else {
        if (type === "advance") {
          try {
            await hiringEngineService.advanceCandidate(selectedJobId, candidate.applicationId, {
              score: payload.score,
              notes: payload.notes,
            });
          } catch {
            await recruiterService.updateApplicantStatus(candidate.applicationId, "shortlisted", payload.notes);
          }
          toast.success("Candidate advanced successfully!");
        } else {
          try {
            await hiringEngineService.failCandidate(selectedJobId, candidate.applicationId, {
              reason: payload.reason || "Disqualified from stage",
            });
          } catch {
            await recruiterService.updateApplicantStatus(candidate.applicationId, "rejected", payload.reason);
          }
          toast.error("Candidate disqualified.");
        }
        fetchData();
      }
    } catch (err: any) {
      console.error("Action error:", err);
      toast.error(err?.message || "Failed to complete action.");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)] bg-background text-ink">
      {/* Top Header & Navigation Bar */}
      <div className="border-b border-border/80 bg-surface px-4 sm:px-6 lg:px-8 py-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/recruiter/shortlist?jobId=${selectedJobId}`}
              className="p-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-ink hover:text-primary transition shadow-2xs cursor-pointer group"
              title="Back to Shortlist Hiring Pipeline"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                <Link href="/recruiter/shortlist" className="hover:text-ink transition">
                  Shortlist
                </Link>
                <ChevronRight className="w-3 h-3 text-ink-soft/60" />
                <span className="font-semibold text-ink-soft">{stageConfig.name}</span>
                <ChevronRight className="w-3 h-3 text-ink-soft/60" />
                <span className={`font-bold ${isShortlisted ? "text-emerald-600" : "text-rose-600"}`}>
                  {isShortlisted ? "Shortlisted" : "Eliminated"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight flex items-center gap-2 mt-0.5">
                <span>{isShortlisted ? "Shortlisted Candidates" : "Eliminated Candidates"}</span>
                <span className="text-sm sm:text-base font-bold text-ink-soft">
                  — {stageConfig.name}
                </span>
              </h1>
            </div>
          </div>

          {/* Job Requisition Context Badge & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt/70 border border-border text-xs">
              <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="font-semibold text-ink truncate max-w-[200px]">
                {currentJob?.title}
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-alt text-ink shadow-2xs transition disabled:opacity-50 cursor-pointer"
              title="Refresh candidate list"
            >
              <RefreshCw className={`w-4 h-4 text-ink-soft ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dedicated Status Badge & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Dedicated Status Indicator */}
          <div className="flex items-center gap-2">
            {isShortlisted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shortlisted Candidates</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold text-xs">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Eliminated Candidates</span>
              </div>
            )}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 flex-1 sm:justify-end">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, role, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-surface-alt/70 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="recent">Sort by Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Candidate Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>
            Showing <strong className="text-ink">{filteredCandidates.length}</strong> {isShortlisted ? "shortlisted" : "eliminated"} candidate(s) in{" "}
            <strong>{stageConfig.name}</strong>
          </span>
          <span
            className={`font-extrabold uppercase px-2.5 py-0.5 rounded-full border text-[10px] ${
              isShortlisted
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            }`}
          >
            {isShortlisted ? "SHORTLISTED" : "ELIMINATED"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-surface border border-border animate-pulse flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-10 h-10 bg-surface-alt rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-surface-alt rounded w-1/4" />
                    <div className="h-3 bg-surface-alt rounded w-1/3" />
                  </div>
                </div>
                <div className="h-9 w-48 bg-surface-alt rounded-xl hidden md:block" />
                <div className="h-9 w-28 bg-surface-alt rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-surface border border-dashed border-border space-y-3 my-4">
            <Users className="w-12 h-12 text-ink-soft mx-auto opacity-40" />
            <h3 className="text-base font-bold text-ink">
              {isShortlisted ? "No Shortlisted Candidates Found" : "No Eliminated Candidates Found"}
            </h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              There are no {isShortlisted ? "shortlisted" : "eliminated"} candidates matching your criteria for{" "}
              {stageConfig.name}.
            </p>
            <Link
              href={`/recruiter/shortlist?jobId=${selectedJobId}`}
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-primary text-surface text-xs font-bold shadow-xs hover:bg-primary-hover transition"
            >
              <span>Return to Hiring Pipeline</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCandidates.map((candidate, idx) => {
              const user = typeof candidate.userId === "object" ? (candidate.userId as PopulatedUser) : null;
              const name = user?.fullName || user?.username || `Candidate ${idx + 1}`;
              const role = candidate.role || currentJob?.title || "Developer";
              const experience = candidate.experience || "2 Years";
              const email = user?.email || "";

              return (
                <div
                  key={candidate._id}
                  onClick={() => handleOpenProfile(candidate)}
                  className={`p-4 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 ${
                    isShortlisted
                      ? "bg-surface border-emerald-500/25 hover:border-emerald-500/60"
                      : "bg-surface border-rose-500/25 hover:border-rose-500/60"
                  }`}
                >
                  {/* Left: Avatar + Candidate Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-2xs ${
                        isShortlisted
                          ? "bg-gradient-brand text-primary-foreground"
                          : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      }`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-black text-ink truncate transition ${
                            isShortlisted ? "group-hover:text-primary" : "group-hover:text-rose-600"
                          }`}
                        >
                          {name}
                        </h3>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            isShortlisted
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {isShortlisted ? "Shortlisted" : "Eliminated"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-ink-soft font-semibold truncate mt-0.5 flex-wrap">
                        <span>{role}</span>
                        <span>•</span>
                        <span>{experience}</span>
                        {email && (
                          <>
                            <span>•</span>
                            <span className="text-ink-soft/80">{email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Scores & Details */}
                  {isShortlisted ? (
                    <div className="flex items-center gap-3 sm:gap-5 py-2 px-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 shrink-0">
                      <div className="text-center min-w-[60px]">
                        <span className="text-[10px] text-ink-soft font-semibold block">Match Score</span>
                        <span className="text-xs font-black text-primary">{candidate.matchScore || 85}%</span>
                      </div>
                      <div className="h-6 w-px bg-emerald-500/20" />
                      <div className="text-center min-w-[70px]">
                        <span className="text-[10px] text-ink-soft font-semibold block">Assessment</span>
                        <span className="text-xs font-black text-ink">
                          {candidate.assessmentScore !== undefined ? `${candidate.assessmentScore}%` : "—"}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-emerald-500/20" />
                      <div className="text-center min-w-[60px]">
                        <span className="text-[10px] text-ink-soft font-semibold block">Interview</span>
                        <span className="text-xs font-black text-ink">
                          {candidate.aiScore !== undefined ? `${candidate.aiScore}%` : "—"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 sm:gap-4 py-2 px-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 shrink-0 max-w-md">
                      <div className="text-center min-w-[60px] shrink-0">
                        <span className="text-[10px] text-ink-soft font-semibold block">Score</span>
                        <span className="text-xs font-black text-rose-600">
                          {candidate.assessmentScore ?? candidate.aiScore ?? candidate.matchScore}%
                        </span>
                      </div>
                      <div className="h-6 w-px bg-rose-500/20 shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-[10px] text-ink-soft font-semibold block">Reason</span>
                        <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 truncate block">
                          {candidate.notes || "Disqualified by stage criteria"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenResume(candidate)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-surface-alt hover:bg-surface-alt/80 text-ink border border-border transition shadow-2xs cursor-pointer shrink-0"
                      title="View Candidate Resume"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>View Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProfile(candidate)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer shrink-0 ${
                        isShortlisted
                          ? "bg-primary hover:bg-primary-hover text-surface"
                          : "bg-surface-alt hover:bg-surface-alt/80 text-ink border border-border"
                      }`}
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Actual Applicant PDF Resume Modal */}
      <ApplicantResumeModal
        isOpen={!!selectedApplicantForResume}
        applicant={selectedApplicantForResume}
        onClose={() => setSelectedApplicantForResume(null)}
      />

      {/* Confirm Modal */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            type: "advance",
            candidate: null,
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
            ? `Are you sure you want to advance this candidate to the next hiring stage?`
            : `Are you sure you want to eliminate this candidate from ${confirmModal.stageName}?`
        }
        candidateName={
          confirmModal.candidate
            ? typeof confirmModal.candidate.userId === "object"
              ? (confirmModal.candidate.userId as PopulatedUser)?.fullName || "Candidate"
              : "Candidate"
            : undefined
        }
        stageName={confirmModal.stageName}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
