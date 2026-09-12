"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  Search,
  User,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft,
  Users,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { Applicant, RecruiterJob } from "@/features/recruiter/types";
import { ApplicantResumeModal } from "@/features/recruiter/components/ApplicantResumeModal";
import { CandidateProfileModal } from "@/features/recruiter/components/CandidateProfileModal";

const STATUS_OPTIONS = ["submitted", "reviewing", "shortlisted", "interviewing", "offered", "rejected"];

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplicantForResume, setSelectedApplicantForResume] = useState<Applicant | null>(null);
  const [selectedApplicantForProfile, setSelectedApplicantForProfile] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!jobId) return;
    if (jobId === "create") {
      router.replace("/recruiter/jobs/create");
      return;
    }
    Promise.all([recruiterService.getMyJobById(jobId), recruiterService.getApplicantsForJob(jobId)])
      .then(([jobData, applicantsData]) => {
        setJob(jobData);
        setApplicants(applicantsData);
      })
      .finally(() => setLoading(false));
  }, [jobId, router]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    try {
      const updated = await recruiterService.updateApplicantStatus(applicationId, status);
      setApplicants((prev) => prev.map((a) => (a._id === applicationId ? { ...a, ...updated } : a)));
      if (selectedApplicantForResume?._id === applicationId) {
        setSelectedApplicantForResume((prev) => (prev ? { ...prev, ...updated, status } : null));
      }
      if (selectedApplicantForProfile?._id === applicationId) {
        setSelectedApplicantForProfile((prev) => (prev ? { ...prev, ...updated, status } : null));
      }

      // Friendly UI workflow toasts
      if (status === "interviewing") {
        toast.success("Moved to Interviewing! Click 'Schedule' to book an interview slot on your calendar.");
      } else if (status === "shortlisted") {
        toast.success("Candidate shortlisted! Ready for AI screening or live interview.");
      } else if (status === "offered") {
        toast.success("Candidate moved to Offered! Review in Finalist board.");
      } else {
        toast.success(`Application status updated to ${status}.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update applicant status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!job) {
    return <div className="p-10 text-center text-ink-soft text-sm">Job not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Breadcrumbs & Quick Pipeline Links */}
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <Link
            href="/recruiter/jobs"
            className="hover:text-primary-glow flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Jobs Board
          </Link>
          <span>/</span>
          <span className="text-ink font-bold truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
        </div>

        {/* Action Bridges into the rest of the Recruiter Suite */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/recruiter/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink bg-surface border border-border px-3 py-1.5 rounded-xl transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Track Pipeline</span>
          </Link>
          <Link
            href="/recruiter/interview-schedule"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interview Schedule</span>
          </Link>
        </div>
      </div>

      {/* Hero Job Banner */}
      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20 capitalize">
                {job.recruiterStage || "Active Listing"}
              </span>
              {((job as any).department || job.employmentType) && (
                <span className="text-[11px] font-medium text-ink-soft bg-surface-alt px-2 py-0.5 rounded-full border border-border">
                  {(job as any).department || job.employmentType}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-3 text-sm text-ink-soft mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location?.country || "Remote"}
              </span>
              {job.salaryText && <span>· {job.salaryText}</span>}
              <span className="flex items-center gap-1 font-semibold text-ink">
                <Users className="w-3.5 h-3.5" />
                {applicants.length} Total Applied
              </span>
            </div>
          </div>
          <Link
            href={`/recruiter/cv-search?jobId=${job._id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-surface-alt border border-border text-ink px-4 py-2.5 rounded-xl hover:bg-surface hover:border-primary/30 transition shadow-xs"
          >
            <Search className="w-4 h-4 text-primary-glow" />
            Source Matching CVs
          </Link>
        </div>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.skills.map((s) => (
              <span
                key={s}
                className="text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Applicants List Section */}
      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">
            Applicants & Candidates ({applicants.length})
          </h2>
          <span className="text-xs text-ink-soft">
            Review, screen via AI, or schedule live interviews directly
          </span>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
            <Briefcase className="w-8 h-8 text-ink-soft mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-ink mb-1">No applicants yet for this listing</p>
            <p className="text-xs text-ink-soft max-w-sm mx-auto mb-4">
              Share the job with candidates or use CV Search to proactively source matching profiles.
            </p>
            <Link
              href={`/recruiter/cv-search?jobId=${job._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-glow hover:scale-105 transition"
            >
              <Search className="w-3.5 h-3.5" />
              Source Candidates Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map((a) => {
              const candidateName = a.candidate?.fullName || a.candidate?.username || "Candidate";
              const candidateEmail = a.candidate?.email || "";

              return (
                <div
                  key={a._id}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-alt/50 transition flex-wrap group shadow-xs"
                >
                  {/* Clickable Candidate Identity */}
                  <div
                    onClick={() => setSelectedApplicantForProfile(a)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    {a.candidate?.avatarUrl ? (
                      <img
                        src={a.candidate.avatarUrl}
                        alt={candidateName}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-border group-hover:ring-primary transition shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow group-hover:scale-105 transition shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-ink truncate group-hover:text-primary transition flex items-center gap-2">
                        <span>{candidateName}</span>
                        <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          {a.matchScore || 0}% match
                        </span>
                      </div>
                      <div className="text-xs text-ink-soft truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-ink">{a.resume?.title || "Applied Resume"}</span>
                        {candidateEmail && <span>· {candidateEmail}</span>}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Action Bridges to the rest of the Recruiter Suite */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* View Resume Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedApplicantForResume(a)}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-surface-alt hover:bg-surface text-ink px-2.5 py-1.5 rounded-xl border border-border transition cursor-pointer"
                      title="Inspect PDF resume"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary-glow" />
                      <span className="hidden sm:inline">Resume</span>
                    </button>

                    {/* AI Assessment / Screening Bridge */}
                    <Link
                      href={`/recruiter/ai-interview?candidate=${encodeURIComponent(
                        candidateName
                      )}&role=${encodeURIComponent(job.title)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/10 hover:bg-amber-600 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                      title="Run automated Gemini AI technical screening test"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Screen</span>
                    </Link>

                    {/* Schedule Live Interview Bridge */}
                    <Link
                      href={`/recruiter/interview-schedule?candidateName=${encodeURIComponent(
                        candidateName
                      )}&candidateEmail=${encodeURIComponent(
                        candidateEmail
                      )}&position=${encodeURIComponent(
                        job.title
                      )}&department=${encodeURIComponent(
                        (job as any).department || "Engineering"
                      )}&autoOpen=true`}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-500/10 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white border border-purple-500/20 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                      title="Book slot on Google Meet / Zoom / Teams with automatic calendar sync"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule</span>
                    </Link>

                    {/* Pipeline Status Selector */}
                    <select
                      value={a.status}
                      disabled={updatingId === a._id}
                      onChange={(e) => handleStatusChange(a._id, e.target.value)}
                      className="text-xs font-semibold bg-surface-alt border border-border rounded-xl px-2.5 py-1.5 capitalize disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        isOpen={!!selectedApplicantForProfile}
        applicant={selectedApplicantForProfile}
        candidate={selectedApplicantForProfile?.candidate || null}
        onClose={() => setSelectedApplicantForProfile(null)}
        onViewResume={() => {
          setSelectedApplicantForResume(selectedApplicantForProfile);
          setSelectedApplicantForProfile(null);
        }}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updatingId === selectedApplicantForProfile?._id}
      />

      {/* Actual Applicant PDF Resume Modal */}
      <ApplicantResumeModal
        isOpen={!!selectedApplicantForResume}
        applicant={selectedApplicantForResume}
        onClose={() => setSelectedApplicantForResume(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updatingId === selectedApplicantForResume?._id}
      />
    </div>
  );
}
