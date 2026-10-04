'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  Trash2,
  Briefcase,
  AlertCircle,
  FileText,
  Zap,
  Layers,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationsKanbanViewProps {
  applications: ApplicationItem[];
  onSelectApp: (app: ApplicationItem) => void;
  onTrackApp: (app: ApplicationItem) => void;
  onDeleteApp: (appId: string) => void;
}

interface KanbanColumnDef {
  id: string;
  statuses: ApplicationStatus[];
  title: string;
  dotColor: string;
  badgeBg: string;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'applied',
    statuses: ['submitted'],
    title: 'Submitted',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'reviewing',
    statuses: ['reviewing'],
    title: 'Under Review',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'shortlisted',
    statuses: ['shortlisted'],
    title: 'Shortlisted',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'interviewing',
    statuses: ['interviewing'],
    title: 'Interviewing',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    id: 'offered',
    statuses: ['offered'],
    title: 'Offered',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'rejected',
    statuses: ['rejected', 'failed'],
    title: 'Not Selected',
    dotColor: 'bg-zinc-500',
    badgeBg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  },
];

export function ApplicationsKanbanView({
  applications,
  onSelectApp,
  onTrackApp,
  onDeleteApp,
}: ApplicationsKanbanViewProps) {
  return (
    <div className="space-y-4">
      {/* Kanban Columns Grid (Always rendered to display full board structure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const columnApps = applications.filter((app) => col.statuses.includes(app.status));
          const count = columnApps.length;

          return (
            <div
              key={col.id}
              className="bg-surface border border-border rounded-3xl p-3.5 shadow-xs space-y-3 min-h-[520px] flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h2 className="text-xs font-bold text-ink leading-tight uppercase tracking-wider">
                      {col.title}
                    </h2>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                    {count}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-2.5">
                  {columnApps.length === 0 ? (
                    <div className="py-14 text-center rounded-2xl border border-dashed border-border/70 p-4 space-y-2 bg-surface-alt/20">
                      <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center mx-auto text-ink-soft/60">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-medium text-ink-soft/80 leading-snug">
                        No applications in this stage
                      </p>
                    </div>
                  ) : (
                    columnApps.map((app) => {
                      const candidateStatus = resolveCandidateStatus(app);
                      const formattedDate = new Date(app.appliedAt || app.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      );

                      return (
                        <div
                          key={app._id}
                          onClick={() => onSelectApp(app)}
                          className="bg-surface border border-border/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-md hover:border-primary-glow/40 transition-all space-y-2.5 cursor-pointer group"
                        >
                          {/* Top: Company Initial + Job Title */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-ink font-bold text-xs shrink-0">
                              {app.job?.company?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold text-ink leading-snug group-hover:text-primary transition-colors truncate">
                                {app.job?.title || 'Job Position'}
                              </h3>
                              <p className="text-[11px] text-ink-soft truncate font-medium">
                                {app.job?.company?.name || 'Company'}
                              </p>
                            </div>
                          </div>

                          {/* Location & Salary */}
                          <div className="space-y-1 text-[11px] text-ink-soft">
                            {app.job?.location && (
                              <div className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-ink-soft shrink-0" />
                                <span className="truncate">
                                  {app.job.location.city
                                    ? `${app.job.location.city}, ${app.job.location.country || ''}`
                                    : app.job.location.country || 'Remote'}
                                </span>
                              </div>
                            )}
                            {app.job?.salary?.max ? (
                              <div className="flex items-center gap-1 text-emerald-600 font-semibold truncate">
                                <DollarSign className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {app.job.salary.currency || 'INR'}{' '}
                                  {app.job.salary.min ? `${app.job.salary.min.toLocaleString()} - ` : ''}
                                  {app.job.salary.max.toLocaleString()}
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Badges: Match Score & Source */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {app.matchScore > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                {app.matchScore}%
                              </span>
                            )}
                            {app.source === 'ai_apply' ? (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                AI Apply
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-full bg-surface-alt text-ink-soft border border-border">
                                Manual
                              </span>
                            )}
                          </div>

                          {/* Dynamic Candidate Status Pill */}
                          <div className="pt-0.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 truncate max-w-full ${candidateStatus.badgeClass}`}
                            >
                              <span className="truncate">{candidateStatus.label}</span>
                            </span>
                          </div>

                          {/* Stage Deadline if available */}
                          {app.stageDeadline && (app.stageStatus === 'invited' || app.stageStatus === 'started') && (
                            <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                Due {new Date(app.stageDeadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {/* Footer details & action buttons */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-ink-soft">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formattedDate}
                            </span>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => onTrackApp(app)}
                                className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary text-[10px] font-bold border border-primary/20 transition cursor-pointer"
                                title="Track Live Funnel"
                              >
                                Track
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectApp(app)}
                                className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                                title="View Details"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteApp(app._id)}
                                className="p-1 rounded-lg text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                                title="Withdraw application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Quick Help Info */}
              <div className="pt-2 text-[10px] text-ink-soft/70 text-center font-medium border-t border-border/40">
                {col.title} stage
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
