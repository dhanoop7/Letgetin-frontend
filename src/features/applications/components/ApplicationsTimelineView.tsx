'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  ChevronRight,
  Trash2,
  FileText,
  Briefcase,
  Award,
  AlertCircle,
  XCircle,
  ArrowRight,
  Zap,
  Filter,
  Check,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationsTimelineViewProps {
  applications: ApplicationItem[];
  onSelectApp: (app: ApplicationItem) => void;
  onTrackApp: (app: ApplicationItem) => void;
  onDeleteApp: (appId: string) => void;
}

const LIFECYCLE_STAGES = [
  { id: 'submitted', label: 'Applied' },
  { id: 'reviewing', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offered', label: 'Offer' },
];

const STANDARD_TIMELINE_STEPS = [
  {
    step: 1,
    title: 'Application Submitted',
    subtitle: 'Candidate profile and resume submitted to employer',
    tag: 'Step 1',
    color: 'bg-primary text-white',
  },
  {
    step: 2,
    title: 'Under Review',
    subtitle: 'Recruiter review and ATS qualification screening',
    tag: 'Step 2',
    color: 'bg-amber-500 text-white',
  },
  {
    step: 3,
    title: 'Shortlisted',
    subtitle: 'Application qualified for hiring evaluation rounds',
    tag: 'Step 3',
    color: 'bg-indigo-500 text-white',
  },
  {
    step: 4,
    title: 'Interview Stage',
    subtitle: 'Technical assessments, AI interviews, and panel rounds',
    tag: 'Step 4',
    color: 'bg-purple-500 text-white',
  },
  {
    step: 5,
    title: 'Offer Received',
    subtitle: 'Formal job offer extended and employment confirmed',
    tag: 'Step 5',
    color: 'bg-emerald-500 text-white',
  },
];

function getStageStepIndex(status: ApplicationStatus): number {
  switch (status) {
    case 'submitted':
      return 0;
    case 'reviewing':
      return 1;
    case 'shortlisted':
      return 2;
    case 'interviewing':
      return 3;
    case 'offered':
      return 4;
    case 'rejected':
    case 'failed':
      return -1; // terminal not selected
    default:
      return 0;
  }
}

export function ApplicationsTimelineView({
  applications,
  onSelectApp,
  onTrackApp,
  onDeleteApp,
}: ApplicationsTimelineViewProps) {
  const [selectedAppIdFilter, setSelectedAppIdFilter] = useState<string>('all');

  // Sort applications chronologically by applied date (newest first)
  const sortedApps = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = new Date(a.appliedAt || a.createdAt).getTime();
      const dateB = new Date(b.appliedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [applications]);

  // Filtered applications if candidate chooses a specific application
  const displayedApps = useMemo(() => {
    if (selectedAppIdFilter === 'all') return sortedApps;
    return sortedApps.filter((a) => a._id === selectedAppIdFilter);
  }, [sortedApps, selectedAppIdFilter]);

  // If 0 applications, render the full vertical timeline structure showing the candidate application lifecycle
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        {/* Top Info Banner inside Timeline layout */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Candidate Application Timeline</h3>
              <p className="text-xs text-ink-soft">
                Track your real-time stage progression, interview milestones, and feedback logs.
              </p>
            </div>
          </div>

          <Link
            href="/ai-apply"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant hover:shadow-glow transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Apply to More Jobs</span>
          </Link>
        </div>

        {/* Vertical Timeline Structure (Always rendered to show complete progression layout) */}
        <div className="relative pl-6 sm:pl-10 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
          {STANDARD_TIMELINE_STEPS.map((step) => (
            <div key={step.step} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full border-2 border-surface shadow-xs flex items-center justify-center text-[11px] font-black ${step.color}`}
              >
                {step.step}
              </div>

              {/* Step Card */}
              <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-2 hover:border-primary-glow/30 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-ink-soft border border-border">
                      {step.tag}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-ink">{step.title}</h4>
                  </div>
                  <span className="text-[10px] font-medium text-ink-soft">Stage Milestone</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{step.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Selector Filter (when candidate has multiple applications) */}
      {sortedApps.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none bg-surface border border-border p-2.5 rounded-2xl shadow-xs">
          <span className="text-ink-soft flex items-center gap-1.5 pl-2 pr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Timeline:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedAppIdFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs font-bold ${
              selectedAppIdFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-alt/70 text-ink-soft hover:text-ink hover:bg-surface-alt'
            }`}
          >
            All Applications ({sortedApps.length})
          </button>
          {sortedApps.map((app) => (
            <button
              key={app._id}
              type="button"
              onClick={() => setSelectedAppIdFilter(app._id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs font-bold ${
                selectedAppIdFilter === app._id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-alt/70 text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
            >
              <span>{app.job?.title || 'Position'}</span>
              <span className="opacity-70 font-normal ml-1">({app.job?.company?.name || 'Company'})</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Timeline Stream */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
        {displayedApps.map((app) => {
          const candidateStatus = resolveCandidateStatus(app);
          const currentStep = getStageStepIndex(app.status);
          const formattedAppliedDate = new Date(app.appliedAt || app.createdAt).toLocaleDateString(
            undefined,
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }
          );

          return (
            <div key={app._id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 border-surface shadow-xs flex items-center justify-center transition ${
                  app.status === 'offered'
                    ? 'bg-emerald-500'
                    : app.status === 'rejected' || app.status === 'failed'
                    ? 'bg-zinc-500'
                    : app.status === 'interviewing'
                    ? 'bg-purple-500'
                    : 'bg-primary'
                }`}
              />

              {/* Application Progress Card */}
              <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs hover:border-primary-glow/30 transition space-y-5">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-ink font-bold text-base shrink-0">
                      {app.job?.company?.name?.charAt(0) || 'C'}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-ink hover:text-primary transition truncate">
                          {app.job?.title || 'Job Position'}
                        </h3>
                        {app.source === 'ai_apply' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Auto-Apply
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-alt text-ink-soft border border-border">
                            Manual
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft font-medium">
                        <span className="flex items-center gap-1 text-ink font-semibold">
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
                        {app.job?.salary?.max ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            {app.job.salary.currency || 'INR'}{' '}
                            {app.job.salary.min ? `${app.job.salary.min.toLocaleString()} - ` : ''}
                            {app.job.salary.max.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Status & Match Score */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {app.matchScore > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {app.matchScore}% Match
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${candidateStatus.badgeClass}`}
                    >
                      {candidateStatus.label}
                    </span>
                  </div>
                </div>

                {/* Stepper Bar: Application Lifecycle Progression */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-alt/40 border border-border/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
                    <span>Application Lifecycle</span>
                    <span className="text-[11px] text-ink font-semibold">
                      Applied on {formattedAppliedDate}
                    </span>
                  </div>

                  {app.status === 'rejected' || app.status === 'failed' ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold">
                      <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{candidateStatus.description}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 items-center text-center">
                      {LIFECYCLE_STAGES.map((stg, sIdx) => {
                        const isDone = currentStep >= sIdx;
                        const isCurrent = currentStep === sIdx;

                        return (
                          <div key={stg.id} className="space-y-1.5 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-surface border border-border text-ink-soft'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <span>{sIdx + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] sm:text-[11px] font-semibold truncate max-w-full ${
                                isCurrent
                                  ? 'text-primary font-bold'
                                  : isDone
                                  ? 'text-ink'
                                  : 'text-ink-soft'
                              }`}
                            >
                              {stg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stage Deadline alert if active */}
                  {app.stageDeadline && (app.stageStatus === 'invited' || app.stageStatus === 'started') && (
                    <div className="text-xs font-bold text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Stage Deadline: {new Date(app.stageDeadline).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Chronological Milestone Details for this application */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                    Milestone Progress Log
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {/* Event 1: Application Submitted */}
                    <div className="p-3 rounded-xl bg-surface border border-border/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Application Submitted
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft">
                        {formattedAppliedDate} &bull; {app.source === 'ai_apply' ? 'AI Auto-Apply' : 'Direct Submission'}
                      </p>
                    </div>

                    {/* Event 2: Under Review / Screening */}
                    {(currentStep >= 1 || app.resumeScreeningStatus) && (
                      <div className="p-3 rounded-xl bg-surface border border-border/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                            Profile Screening
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-soft">
                          {app.resumeDecision === 'shortlisted' ? 'Shortlisted for process' : 'Screening in progress'}
                        </p>
                      </div>
                    )}

                    {/* Event 3: Interview / Stage Details if present */}
                    {(app.stageStatus || app.status === 'interviewing') && (
                      <div className="p-3 rounded-xl bg-surface border border-border/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Interview Stage
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-soft capitalize">
                          {app.stageStatus ? `Status: ${app.stageStatus.replace('_', ' ')}` : 'Stage in progress'}
                        </p>
                      </div>
                    )}

                    {/* Event 4: Offer Details if present */}
                    {(app.status === 'offered' || app.finalShortlistDecision === 'offered' || app.finalShortlistDecision === 'hired') && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Offer Received
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
                          {app.offeredAt ? `Extended on ${new Date(app.offeredAt).toLocaleDateString()}` : 'Formal offer issued'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
                  <div className="flex flex-wrap items-center gap-3">
                    {app.resume && (
                      <span className="flex items-center gap-1 text-ink font-medium">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {app.resume.title || 'Resume'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {candidateStatus.actionRequired && (
                      <button
                        type="button"
                        onClick={() => onTrackApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition cursor-pointer animate-pulse"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{candidateStatus.actionLabel || 'Action Required'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onTrackApp(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs border border-primary/20 transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track Live Funnel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectApp(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 text-ink font-bold text-xs border border-border transition cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteApp(app._id)}
                      className="p-1.5 rounded-xl text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                      title="Withdraw application record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
