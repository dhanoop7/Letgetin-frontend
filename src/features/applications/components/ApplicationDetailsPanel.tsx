'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Calendar,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Globe,
  GraduationCap,
  Tag,
  Gift,
  Check,
  Briefcase,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationDetailsPanelProps {
  application: ApplicationItem | null;
  onTrackApp: (app: ApplicationItem) => void;
  onDeleteApp: (appId: string) => void;
}

const STAGES: { id: ApplicationStatus; label: string; step: number }[] = [
  { id: 'submitted', label: 'Submitted', step: 1 },
  { id: 'reviewing', label: 'Under Review', step: 2 },
  { id: 'shortlisted', label: 'Shortlisted', step: 3 },
  { id: 'interviewing', label: 'Interviewing', step: 4 },
  { id: 'offered', label: 'Offered', step: 5 },
];

function getStageStep(status: ApplicationStatus): number {
  switch (status) {
    case 'submitted':
      return 1;
    case 'reviewing':
      return 2;
    case 'shortlisted':
      return 3;
    case 'interviewing':
      return 4;
    case 'offered':
      return 5;
    default:
      return 1;
  }
}

export function ApplicationDetailsPanel({
  application,
  onTrackApp,
  onDeleteApp,
}: ApplicationDetailsPanelProps) {
  if (!application) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Briefcase className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-ink">No application selected</h3>
          <p className="text-xs text-ink-soft leading-relaxed">
            Select an active application from the left panel to inspect its live stage status, hiring pipeline, and job details.
          </p>
        </div>
        <Link
          href="/ai-apply"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant hover:shadow-glow transition cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Apply to More Jobs</span>
        </Link>
      </div>
    );
  }

  const candStatus = resolveCandidateStatus(application);
  const currentStep = getStageStep(application.status);
  const formattedDate = new Date(application.appliedAt || application.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Card with Title, Actions & Match Score */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-lg font-black shrink-0 shadow-md">
              {application.job?.company?.name?.charAt(0) || 'C'}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight truncate">
                  {application.job?.title || 'Job Position'}
                </h2>
                {application.source === 'ai_apply' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Auto-Apply
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-alt text-ink-soft border border-border shrink-0">
                    Manual
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft font-medium">
                <span className="flex items-center gap-1 text-ink font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-ink-soft" />
                  {application.job?.company?.name || 'Company'}
                </span>
                {application.job?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                    {application.job.location.city
                      ? `${application.job.location.city}, ${application.job.location.country}`
                      : application.job.location.country || 'Remote'}
                  </span>
                )}
                <span>Applied on {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            {application.matchScore > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {application.matchScore}% Match
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${candStatus.badgeClass}`}>
              {candStatus.label}
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-ink-soft flex items-center gap-2">
            <span className="font-semibold text-ink">Application ID:</span>
            <span className="font-mono text-[11px]">{application._id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(application.stageStatus === 'invited' || application.stageStatus === 'started') ? (
              <Link
                href={`/assessment/take?applicationId=${application._id}&stageId=${encodeURIComponent(application.currentStageId || 'stage_general_aptitude')}&jobId=${encodeURIComponent(application.job?._id || '')}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-xs transition cursor-pointer animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Take Assessment</span>
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => onTrackApp(application)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs border border-primary/20 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Track Live Funnel</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteApp(application._id)}
              className="p-2 rounded-xl text-ink-soft hover:text-destructive hover:bg-destructive/10 border border-border/60 transition cursor-pointer"
              title="Withdraw application record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lifecycle Stage Progression Stepper */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Hiring Journey Stage</span>
          </h3>
          <span className="text-xs font-bold text-ink-soft">
            Stage {currentStep} of 5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {STAGES.map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div key={s.id} className="space-y-1.5 text-center">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary'
                      : isCurrent
                      ? 'bg-gradient-brand shadow-glow'
                      : 'bg-surface-alt'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] block font-semibold truncate ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-ink-soft'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-ink-soft leading-relaxed pt-1 bg-surface-alt/40 p-3 rounded-2xl border border-border/60">
          {candStatus.description}
        </p>
      </div>

      {/* 3. Follow-up Action Banner (if active) */}
      {(application.stageStatus === 'invited' || application.stageStatus === 'started') && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-xs border border-amber-500/30">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-ink">Assessment Round Active</h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                You are invited to complete the <strong>{application.currentStageId ? application.currentStageId.replace(/_/g, ' ') : 'Evaluation Round'}</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href={`/assessment/take?applicationId=${application._id}&stageId=${encodeURIComponent(application.currentStageId || 'stage_general_aptitude')}&jobId=${encodeURIComponent(application.job?._id || '')}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Enter Assessment Room &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Key Job Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-surface border border-border text-xs shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <Globe className="w-3 h-3" /> Workplace Type
          </span>
          <span className="font-bold text-ink capitalize">
            {application.job?.workplaceType || 'Remote / Flexible'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Employment
          </span>
          <span className="font-bold text-ink capitalize">
            {application.job?.employmentType || 'Full-Time'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Compensation
          </span>
          <span className="font-bold text-emerald-600">
            {application.job?.salary?.max
              ? `${application.job.salary.currency || 'INR'} ${application.job.salary.min ? `${application.job.salary.min.toLocaleString()} - ` : ''}${application.job.salary.max.toLocaleString()} / ${application.job.salary.period || 'year'}`
              : 'Competitive Salary'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <Award className="w-3 h-3" /> Experience Level
          </span>
          <span className="font-bold text-ink capitalize">
            {application.job?.experienceLevel || 'Mid-Senior Level'}{' '}
            {application.job?.minimumExperience !== undefined
              ? `(${application.job.minimumExperience}${application.job.maximumExperience ? `-${application.job.maximumExperience}` : '+'} yrs)`
              : ''}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Education
          </span>
          <span className="font-bold text-ink">
            {application.job?.educationRequirements || "Bachelor's Degree or Equivalent"}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
            <FileText className="w-3 h-3" /> Attached Resume
          </span>
          <span className="font-bold text-primary truncate block">
            {application.resume?.title || 'Selected Career Resume'}
          </span>
        </div>
      </div>

      {/* 5. Required Technologies & Skills */}
      {application.job?.skills && application.job.skills.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            Required Technologies & Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {application.job.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-xl bg-surface-alt border border-border text-ink font-semibold text-xs flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-primary" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Key Responsibilities */}
      {application.job?.responsibilities && application.job.responsibilities.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Key Responsibilities
          </h4>
          <ul className="space-y-1.5 text-xs text-ink-soft leading-relaxed p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
            {application.job.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Job Requirements */}
      {application.job?.requirements && application.job.requirements.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            Job Requirements & Qualifications
          </h4>
          <ul className="space-y-1.5 text-xs text-ink-soft leading-relaxed p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
            {application.job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Full Job Description */}
      {application.job?.description && (
        <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
            Complete Job Description
          </h4>
          <div className="p-4 rounded-2xl bg-surface-alt/40 border border-border text-xs text-ink-soft leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto scrollbar-thin">
            {application.job.description}
          </div>
        </div>
      )}
    </div>
  );
}
