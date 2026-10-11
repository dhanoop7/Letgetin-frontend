'use client';

import React from 'react';
import {
  Calendar,
  Building,
  User,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { StepId, Task, CalendarEvent } from '../types';
import {
  useCandidateOnboardingStore,
  selectOverallProgress,
  selectCompletedStepsCount,
  selectInProgressStepsCount,
  selectPendingStepsCount,
  isStepLocked,
} from '../store/useCandidateOnboardingStore';
import { mockInitialTasks } from '../mocks/tasks';
import { mockUpcomingEvents } from '../mocks/events';
import { ProgressRing } from './ProgressRing';
import { StatCard } from './StatCard';
import { TaskCard } from './TaskCard';

interface DashboardViewProps {
  onSelectStep: (stepId: StepId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectStep }) => {
  const candidate = useCandidateOnboardingStore((state) => state.candidate);
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const isSubmitted = useCandidateOnboardingStore((state) => state.isSubmitted);

  const overallProgress = useCandidateOnboardingStore(selectOverallProgress);
  const completedCount = useCandidateOnboardingStore(selectCompletedStepsCount);
  const inProgressCount = useCandidateOnboardingStore(selectInProgressStepsCount);
  const pendingCount = useCandidateOnboardingStore(selectPendingStepsCount);

  // Combine tasks with store statuses
  const currentTasks: Task[] = mockInitialTasks.map((task) => ({
    ...task,
    status: stepStatus[task.stepId],
  }));

  // Next actionable task
  const nextTask = currentTasks.find(
    (t) => t.status !== 'completed' && !isStepLocked(t.stepId, stepStatus),
  );

  return (
    <div className="space-y-6">
      {/* 1. Gradient Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-6 sm:p-8 text-white shadow-elegant text-left">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-primary-glow/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome to {candidate.company}!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {candidate.name}! 👋
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl">
              We are excited to have you join as{' '}
              <span className="font-bold text-white">{candidate.role}</span>. Complete your onboarding
              tasks before your first day on{' '}
              <span className="underline decoration-white/50 font-semibold text-white">
                {new Date(candidate.startDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>.
            </p>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/90">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <Building className="w-3.5 h-3.5 text-white/80" />
                {candidate.department}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <User className="w-3.5 h-3.5 text-white/80" />
                Manager: {candidate.manager?.name || 'Sarah Jenkins'}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                Start: {new Date(candidate.startDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-col items-center sm:items-end w-full md:w-auto shrink-0">
            {isSubmitted ? (
              <div className="flex items-center gap-2 bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 px-4 py-2.5 rounded-2xl backdrop-blur-md text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Onboarding Submitted!</span>
              </div>
            ) : nextTask ? (
              <button
                type="button"
                onClick={() => onSelectStep(nextTask.stepId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-ink hover:bg-white/90 font-black text-xs shadow-md transition cursor-pointer"
              >
                <span>Continue: {nextTask.title}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectStep('checklist')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-ink hover:bg-white/90 font-black text-xs shadow-md transition cursor-pointer"
              >
                <span>Review Day-1 Checklist</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Steps"
          value={`${completedCount} / 8`}
          subtitle={`${Math.round((completedCount / 8) * 100)}% requirements complete`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Active steps being completed"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Pending Steps"
          value={pendingCount}
          subtitle="Remaining onboarding steps"
          icon={<AlertCircle className="w-5 h-5 text-primary" />}
          iconBgColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Days to Day 1"
          value="8 Days"
          subtitle={`Joining on ${new Date(candidate.startDate).toLocaleDateString()}`}
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 3. Main Dashboard Layout: Task Grid (Left 2 cols) + Progress & Events (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Task Cards Grid */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider">
                Onboarding Checklist & Steps
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Complete each step in sequence to fulfill candidate onboarding compliance.
              </p>
            </div>
            <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              {completedCount} of 8 Done
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isLocked={isStepLocked(task.stepId, stepStatus)}
                onSelectStep={onSelectStep}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Column: Animated Progress Ring Card & Upcoming Events */}
        <div className="space-y-6">
          {/* Progress Ring Card */}
          <div className="bg-surface border border-border rounded-3xl p-6 text-center space-y-4 shadow-xs">
            <h4 className="text-sm font-black text-ink uppercase tracking-wider">
              Overall Completion
            </h4>
            <div className="flex justify-center py-2">
              <ProgressRing progress={overallProgress} size={150} strokeWidth={12} />
            </div>
            <p className="text-xs text-ink-soft leading-relaxed px-2">
              {overallProgress === 100
                ? 'All mandatory requirements are satisfied! You are ready for your Day 1 induction.'
                : 'All fields and uploaded files are autosaved. You can leave and resume anytime.'}
            </p>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 text-left space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <h4 className="text-xs sm:text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Day-1 Schedule & Events</span>
              </h4>
              <span className="text-[11px] font-bold text-ink-soft">
                {mockUpcomingEvents.length} events
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {mockUpcomingEvents.map((evt: CalendarEvent) => (
                <div key={evt.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-ink">{evt.title}</h5>
                    <span className="text-[10px] font-bold text-primary shrink-0">
                      {evt.time.split('-')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-soft">
                    <span>{evt.organizer}</span>
                    <span>•</span>
                    <span className="truncate">{evt.locationOrUrl.split(':')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectStep('team')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>View Team Members & Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
