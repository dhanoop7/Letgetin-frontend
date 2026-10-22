'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Zap,
  Briefcase,
  XCircle,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationsTimelineViewProps {
  applications: ApplicationItem[];
  selectedApp?: ApplicationItem | null;
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

function getMilestoneTimes(app: ApplicationItem) {
  const baseDate = new Date(app.appliedAt || app.createdAt || Date.now());

  const formatDT = (d: Date) => ({
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  });

  const step1Time = formatDT(baseDate);
  const step2Time = formatDT(new Date(baseDate.getTime() + 1000 * 60 * 60 * 24));
  const step3Time = formatDT(new Date(baseDate.getTime() + 1000 * 60 * 60 * 48));

  const step4Date = app.invitedAt
    ? new Date(app.invitedAt)
    : app.stageDeadline
    ? new Date(app.stageDeadline)
    : new Date(baseDate.getTime() + 1000 * 60 * 60 * 72);
  const step4Time = formatDT(step4Date);

  const step5Date = app.offeredAt
    ? new Date(app.offeredAt)
    : app.hiredAt
    ? new Date(app.hiredAt)
    : new Date(baseDate.getTime() + 1000 * 60 * 60 * 120);
  const step5Time = formatDT(step5Date);

  return [step1Time, step2Time, step3Time, step4Time, step5Time];
}

export function ApplicationsTimelineView({
  applications,
  selectedApp,
  onTrackApp,
}: ApplicationsTimelineViewProps) {
  const targetApp = selectedApp || (applications.length > 0 ? applications[0] : null);

  // If no application exists, render the empty timeline banner & lifecycle placeholder
  if (!targetApp) {
    return (
      <div className="space-y-6">
        {/* Top Info Banner */}
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

        {/* Vertical Timeline Structure */}
        <div className="relative pl-6 sm:pl-10 space-y-5 before:content-[''] before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
          {STANDARD_TIMELINE_STEPS.map((step) => (
            <div key={step.step} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-surface shadow-xs flex items-center justify-center text-xs font-black ${step.color}`}
              >
                {step.step}
              </div>

              {/* Step Card */}
              <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-primary-glow/30 transition">
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

  const candidateStatus = resolveCandidateStatus(targetApp);
  const currentStep = getStageStepIndex(targetApp.status);
  const milestoneTimes = getMilestoneTimes(targetApp);
  const formattedAppliedDate = new Date(targetApp.appliedAt || targetApp.createdAt).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="space-y-6">
      {/* 1. APPLICATION HEADER (Compact & Clean) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-ink font-black text-lg shrink-0 shadow-xs">
              {targetApp.job?.company?.name?.charAt(0) || 'C'}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-ink truncate">
                  {targetApp.job?.title || 'Job Position'}
                </h3>
                {targetApp.source === 'ai_apply' ? (
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
                  {targetApp.job?.company?.name || 'Company'}
                </span>
                {targetApp.job?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                    {targetApp.job.location.city
                      ? `${targetApp.job.location.city}, ${targetApp.job.location.country || ''}`
                      : targetApp.job.location.country || 'Remote'}
                  </span>
                )}
                {targetApp.job?.salary?.max ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {targetApp.job.salary.currency || 'USD'}{' '}
                    {targetApp.job.salary.min ? `${targetApp.job.salary.min.toLocaleString()} - ` : ''}
                    {targetApp.job.salary.max.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Header Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            {targetApp.matchScore > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {targetApp.matchScore}% Match
              </span>
            )}

            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${candidateStatus.badgeClass}`}>
              {candidateStatus.label}
            </span>

            <button
              type="button"
              onClick={() => onTrackApp(targetApp)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-glow transition cursor-pointer"
            >
              Track Live Funnel
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL APPLICATION LIFECYCLE STEPPER */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-alt/40 border border-border/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
            <span className="uppercase tracking-wider text-[10px]">Application Lifecycle</span>
            <span className="text-[11px] text-ink font-semibold">
              Applied on {formattedAppliedDate}
            </span>
          </div>

          {targetApp.status === 'rejected' || targetApp.status === 'failed' ? (
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
        </div>
      </div>

      {/* 3. CANDIDATE APPLICATION TIMELINE BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink">Candidate Application Timeline</h3>
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

      {/* 4. VERTICAL TIMELINE / MILESTONE PROGRESSION (Matching Reference UI) */}
      <div className="relative pl-6 sm:pl-10 space-y-5 before:content-[''] before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
        {STANDARD_TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isCurrent = currentStep === idx;
          const isPending = currentStep < idx && currentStep !== -1;
          const stepTime = milestoneTimes[idx];

          return (
            <div key={step.step} className="relative group">
              {/* Step Node Circle on Vertical Track */}
              <div
                className={`absolute -left-6 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-surface shadow-xs flex items-center justify-center text-xs font-black transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isCurrent
                    ? `${step.color} ring-4 ring-primary/20 shadow-sm`
                    : 'bg-surface border border-border text-ink-soft/70'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span>{step.step}</span>}
              </div>

              {/* Step Milestone Card */}
              <div
                className={`bg-surface border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-all ${
                  isCurrent
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                    : isCompleted
                    ? 'border-border/90 hover:border-border hover:bg-surface-alt/20'
                    : 'border-border/60 bg-surface-alt/20 opacity-80'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCurrent
                          ? 'bg-primary text-white border-primary'
                          : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-surface-alt text-ink-soft border-border'
                      }`}
                    >
                      {step.tag}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-ink">{step.title}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCurrent
                        ? 'bg-primary/10 text-primary border-primary/20 font-bold'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold'
                        : 'bg-surface-alt text-ink-soft border-border'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Stage Milestone'}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-ink-soft leading-relaxed">{step.subtitle}</p>

                {/* Date & Time Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
                  {!isPending ? (
                    <div className="flex flex-wrap items-center gap-4 text-ink-soft font-medium text-[11px] sm:text-xs">
                      <span className="flex items-center gap-1.5 text-ink font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{stepTime.date}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-soft">
                        <Clock className="w-3.5 h-3.5 text-ink-soft" />
                        <span>{stepTime.time}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-soft/70">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Stage milestone pending progression</span>
                    </div>
                  )}

                  {isCurrent && targetApp.stageDeadline && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Deadline: {new Date(targetApp.stageDeadline).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
