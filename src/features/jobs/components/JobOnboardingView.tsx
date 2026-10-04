'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Zap,
  ChevronRight,
  ExternalLink,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { applicationService } from '@/features/applications/services/applicationService';
import { ApplicationItem } from '@/features/applications/types';
import { resolveCandidateStatus } from '@/features/applications/utils/candidateStatusResolver';
import { StorageProviderFactory } from '@/features/resume/storage/factory';
import { IResume } from '@/features/resume/types';
import { ResumeUploadModal } from '@/features/resume/components/onboarding/ResumeUploadModal';
import { ApplicationTrackingModal } from '@/features/applications/components/ApplicationTrackingModal';
import { JobDetailsModal } from '@/features/jobs/components/JobDetailsModal';
import { IJob } from '@/features/jobs/types/job.types';

interface JobOnboardingViewProps {
  onSwitchTab?: (tab: string, stage?: string) => void;
}

export function JobOnboardingView({ onSwitchTab }: JobOnboardingViewProps) {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [trackingApp, setTrackingApp] = useState<ApplicationItem | null>(null);
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real candidate applications
      const appRes = await applicationService.getApplications({ page: 1, limit: 10 });
      setApplications(appRes.applications || []);

      // 2. Fetch real candidate uploaded/created resumes
      const provider = StorageProviderFactory.getProvider();
      const resumeList = await provider.list();
      if (Array.isArray(resumeList)) {
        setResumes(resumeList);
      }
    } catch (err) {
      console.warn('Failed to load onboarding workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute actual onboarding progress metrics
  const hasDocuments = resumes.length > 0;
  const hasProfile = Boolean(user?.fullName && user?.email);
  const hasJobSelection = applications.length > 0;
  const isVerified = Boolean(user?.hasBuiltResume || (user as any)?.isVerified);

  const progressPercentage = useMemo(() => {
    let score = 0;
    if (hasDocuments) score += 25;
    if (hasProfile) score += 25;
    if (hasJobSelection) score += 25;
    if (isVerified) score += 25;
    return score;
  }, [hasDocuments, hasProfile, hasJobSelection, isVerified]);

  return (
    <div className="space-y-6">
      {/* 1. Main Header */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-xl font-black text-ink uppercase tracking-tight">
              Onboarding Workspace
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {progressPercentage}% Completed
            </span>
          </div>
          <p className="text-xs text-ink-soft">
            Manage your jobs, documents and onboarding progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Explore Opportunities</span>
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Resume Builder</span>
          </Link>
        </div>
      </div>

      {/* 2. 50/50 Equal-Width Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT SECTION (50%) — JOBS LISTED */}
        {/* ============================================================ */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h2 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Jobs Listed</span>
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Positions linked to your career onboarding & application pipeline
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {applications.length} Listed
              </span>
            </div>

            {/* Jobs List Content */}
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto" />
                <p className="text-xs text-ink-soft">Loading listed onboarding jobs...</p>
              </div>
            ) : applications.length === 0 ? (
              /* Clean Empty State */
              <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-surface-alt/30 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h3 className="text-sm font-bold text-ink">No jobs listed yet</h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Explore available positions and submit applications to start your company onboarding track.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-glow transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Find Jobs</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Real Listed Jobs */
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                {applications.map((app) => {
                  const candStatus = resolveCandidateStatus(app);
                  return (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-surface-alt/40 border border-border hover:border-primary-glow/40 transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-ink group-hover:text-primary transition truncate">
                              {app.job?.title || 'Job Position'}
                            </h3>
                            {app.source === 'ai_apply' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary shrink-0">
                                AI Apply
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft font-medium">
                            <span className="font-semibold text-ink flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-ink-soft" />
                              {app.job?.company?.name || 'Company'}
                            </span>
                            {app.job?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                                {app.job.location.city
                                  ? `${app.job.location.city}, ${app.job.location.country}`
                                  : app.job.location.country || 'Remote'}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${candStatus.badgeClass}`}
                        >
                          {candStatus.label}
                        </span>
                      </div>

                      {/* Job Status Details & Action */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-ink-soft">
                          Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTrackingApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-alt text-ink font-semibold text-xs transition cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-primary" />
                            <span>Track Funnel</span>
                          </button>
                          {app.job && (
                            <button
                              type="button"
                              onClick={() => setSelectedJob(app.job as IJob)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs transition cursor-pointer"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Area */}
          <div className="pt-4 border-t border-border/70 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-ink-soft">
              Looking for more matching roles?
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/ai-apply"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>AI Auto-Apply</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-glow transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Find Jobs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SECTION (50%) — DOCUMENTS / DASHBOARD / ONBOARDING */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* 1. DOCUMENTS AREA */}
          <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h2 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Documents</span>
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Career documents, resumes, and verification certificates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold border border-primary/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-surface-alt/20 space-y-2">
                <FileText className="w-8 h-8 text-ink-soft/60 mx-auto" />
                <p className="text-xs font-bold text-ink">No documents uploaded yet</p>
                <p className="text-[11px] text-ink-soft max-w-xs mx-auto">
                  Upload your resume to complete your onboarding profile and enable instant job applications.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold transition cursor-pointer mt-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resume (PDF / DOCX)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resumes.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-surface-alt/50 border border-border flex items-center justify-between gap-3 hover:bg-surface-alt transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink truncate">
                          {res.title || 'Professional Resume'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-ink-soft">
                          <span>Updated {new Date(res.updatedAt || Date.now()).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified ATS
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href="/verified-resume"
                        className="p-2 rounded-xl text-ink-soft hover:text-primary hover:bg-surface transition"
                        title="View Verification Status"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/builder"
                        className="p-2 rounded-xl text-ink-soft hover:text-primary hover:bg-surface transition"
                        title="Edit in Resume Builder"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. DASHBOARD AREA */}
          <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h2 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Onboarding Dashboard</span>
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Summary of your hiring readiness & document verification status
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {progressPercentage}% Ready
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-ink">Profile & Candidate Checklist</span>
                <span className="text-primary font-bold">{progressPercentage}% Complete</span>
              </div>
              <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist Matrix */}
            <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border/80 flex items-center justify-between">
                <span className="font-semibold text-ink">Documents</span>
                {hasDocuments ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Uploaded
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold">○ Pending</span>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border/80 flex items-center justify-between">
                <span className="font-semibold text-ink">Profile</span>
                {hasProfile ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold">○ Incomplete</span>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border/80 flex items-center justify-between">
                <span className="font-semibold text-ink">Job Selection</span>
                {hasJobSelection ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold">○ Not Started</span>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/60 border border-border/80 flex items-center justify-between">
                <span className="font-semibold text-ink">Verification</span>
                {isVerified ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-blue-500 font-semibold">○ In Review</span>
                )}
              </div>
            </div>
          </div>

          {/* 3. ONBOARDING WORKFLOW AREA */}
          <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h2 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>Onboarding Workflow</span>
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Complete your onboarding to unlock fast-tracked recruiter reviews
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-ink">
                  {progressPercentage === 100
                    ? 'All Onboarding Milestones Completed!'
                    : 'Next Recommended Step: Continue Career Onboarding'}
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {progressPercentage === 100
                    ? 'Your credentials, resume, and application pipeline are fully optimized for recruiter discovery.'
                    : 'Complete technical verification, take AI mock assessments, and set your job matching criteria.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  href={hasDocuments ? '/verified-resume' : '/builder'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant hover:shadow-glow transition cursor-pointer"
                >
                  <span>{hasDocuments ? 'Continue Onboarding' : 'Create / Upload Resume'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/interviews/buddy"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink font-semibold text-xs transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-500" />
                  <span>AI Interview Practice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          loadData();
        }}
      />

      {/* Tracking Modal */}
      {trackingApp && (
        <ApplicationTrackingModal
          application={trackingApp}
          onClose={() => setTrackingApp(null)}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
