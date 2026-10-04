'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Search,
  Loader2,
  Calendar,
  FileText,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  XCircle,
  Layers,
  Zap,
  Tag,
  AlertCircle,
  X,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ApplicationItem, ApplicationStats, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationsOverviewViewProps {
  applications: ApplicationItem[];
  stats: ApplicationStats | null;
  totalCount: number;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sourceFilter: string;
  setSourceFilter: (s: string) => void;
  sortOption: 'recent' | 'matchScore';
  setSortOption: (s: 'recent' | 'matchScore') => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  onSelectApp: (app: ApplicationItem) => void;
  onTrackApp: (app: ApplicationItem) => void;
  onDeleteApp: (appId: string) => void;
  onSwitchTab: (tab: 'overview' | 'kanban' | 'calendar' | 'timeline') => void;
}

export function ApplicationsOverviewView({
  applications,
  stats,
  totalCount,
  loading,
  searchQuery,
  setSearchQuery,
  sourceFilter,
  setSourceFilter,
  sortOption,
  setSortOption,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  totalPages,
  onSelectApp,
  onTrackApp,
  onDeleteApp,
  onSwitchTab,
}: ApplicationsOverviewViewProps) {
  // Identify applications requiring attention
  const actionRequiredApps = useMemo(() => {
    return applications.filter((app) => {
      const candStatus = resolveCandidateStatus(app);
      return candStatus.actionRequired || app.stageStatus === 'invited';
    });
  }, [applications]);

  // Identify active interview stage applications
  const activeInterviewApps = useMemo(() => {
    return applications.filter((app) => app.status === 'interviewing');
  }, [applications]);

  // Calculate real status counts
  const total = stats?.total ?? totalCount ?? 0;
  const submittedCount = stats?.submitted ?? applications.filter((a) => a.status === 'submitted').length;
  const reviewingCount = stats?.reviewing ?? applications.filter((a) => a.status === 'reviewing').length;
  const shortlistedCount = stats?.shortlisted ?? applications.filter((a) => a.status === 'shortlisted').length;
  const interviewingCount = stats?.interviewing ?? applications.filter((a) => a.status === 'interviewing').length;
  const offeredCount = stats?.offered ?? applications.filter((a) => a.status === 'offered').length;

  const getPercentage = (count: number) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((count / total) * 100));
  };

  // Recent applications (latest 3)
  const recentApps = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime())
      .slice(0, 3);
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* 1. Search & Filter Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface-alt/50 text-xs font-medium text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow"
            />
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="ai_apply">🤖 AI Auto-Apply</option>
              <option value="manual">Manual Application</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="recent">Newest Applied</option>
              <option value="matchScore">Highest Match Score</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none pt-1 border-t border-border/60">
          {[
            { id: 'all', label: 'All Applications', count: total },
            { id: 'submitted', label: 'Submitted', count: submittedCount },
            { id: 'reviewing', label: 'Under Review', count: reviewingCount },
            { id: 'shortlisted', label: 'Shortlisted', count: shortlistedCount },
            { id: 'interviewing', label: 'Interviewing', count: interviewingCount },
            { id: 'offered', label: 'Offered', count: offeredCount },
            { id: 'rejected', label: 'Not Selected', count: stats?.rejected || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-surface-alt/70 text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-surface border border-border text-ink-soft font-semibold'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Attention & Interview Banners (Conditional when data exists) */}
      {actionRequiredApps.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Applications Requiring Attention ({actionRequiredApps.length})</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Action Required
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actionRequiredApps.map((app) => {
              const candStatus = resolveCandidateStatus(app);
              return (
                <div
                  key={app._id}
                  onClick={() => onTrackApp(app)}
                  className="p-3 rounded-2xl bg-surface border border-amber-500/20 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-ink truncate group-hover:text-primary transition">
                        {app.job?.title || 'Job Position'}
                      </h4>
                      <p className="text-[11px] text-ink-soft truncate font-medium">
                        {app.job?.company?.name || 'Company'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0 animate-pulse">
                      {candStatus.actionLabel || 'Action'}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">
                    {candStatus.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Grid Layout: Left 2 Cols (Overview & List) + Right 1 Col (Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLUMNS: Application Overview + Application Cards / Clean Empty State */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider">
                Application Overview
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Track your active applications and hiring progress.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {totalCount} {totalCount === 1 ? 'Application' : 'Applications'}
            </span>
          </div>

          {/* Applications List / Loading / Clean Empty Dashboard State */}
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-surface border border-border rounded-3xl">
              <Loader2 className="w-8 h-8 text-primary-glow animate-spin mx-auto" />
              <p className="text-xs font-medium text-ink-soft">Loading applied job statuses...</p>
            </div>
          ) : applications.length === 0 ? (
            /* Polished Compact Empty State Card (Not a huge generic blank rectangle) */
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-ink">Start your application journey</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No applications match your active filter criteria. Try resetting the filters above.'
                    : 'Apply to jobs and your applications will appear here automatically.'}
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
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const candidateStatus = resolveCandidateStatus(app);
                const formattedDate = new Date(app.appliedAt || app.createdAt).toLocaleDateString(
                  undefined,
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                );

                return (
                  <div
                    key={app._id}
                    className="p-4 sm:p-5 rounded-3xl bg-surface border border-border hover:border-primary-glow/30 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-ink font-bold text-sm shrink-0">
                          {app.job?.company?.name?.charAt(0) || 'C'}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-ink hover:text-primary transition truncate">
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
                                  : app.job.location.country || 'Remote Eligible'}
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

                      {/* Read-Only Status Badge & Match Score */}
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {app.matchScore > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {app.matchScore}% Match
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${candidateStatus.badgeClass}`}
                        >
                          <span>{candidateStatus.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Footer details */}
                    <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied on {formattedDate}
                        </span>
                        {app.resume && (
                          <span className="flex items-center gap-1 text-ink font-medium">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            {app.resume.title || 'Attached Resume'}
                          </span>
                        )}
                        {app.stageDeadline && (app.stageStatus === 'invited' || app.stageStatus === 'started') && (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Deadline: {new Date(app.stageDeadline).toLocaleDateString()}
                          </span>
                        )}
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
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-4 flex items-center justify-between text-xs text-ink-soft">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed text-ink font-semibold cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed text-ink font-semibold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Applications Section (Always rendered for full dashboard feel) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider">
                  Recent Applications
                </h3>
                <p className="text-[11px] text-ink-soft">Latest submitted roles and updates</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-primary hover:text-primary-glow flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentApps.length > 0 ? (
              <div className="divide-y divide-border/60">
                {recentApps.map((app) => {
                  const candStatus = resolveCandidateStatus(app);
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
                      className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-alt/40 px-2 sm:px-3 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-ink group-hover:text-primary transition truncate">
                            {app.job?.title || 'Job Position'}
                          </h4>
                          <span className="text-[11px] font-semibold text-ink-soft shrink-0">
                            • {app.job?.company?.name || 'Company'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-soft font-medium">
                          {app.job?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-ink-soft" />
                              {app.job.location.city
                                ? `${app.job.location.city}, ${app.job.location.country}`
                                : app.job.location.country || 'Remote'}
                            </span>
                          )}
                          <span>Applied {formattedDate}</span>
                          {app.matchScore > 0 && (
                            <span className="text-emerald-600 font-bold">
                              {app.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${candStatus.badgeClass}`}
                        >
                          {candStatus.label}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-surface-alt group-hover:bg-primary group-hover:text-white border border-border flex items-center justify-center text-ink-soft transition">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center rounded-2xl border border-dashed border-border/70 p-4 space-y-1.5 bg-surface-alt/20">
                <p className="text-xs font-semibold text-ink">No recent applications</p>
                <p className="text-[11px] text-ink-soft">
                  When you apply to jobs, your recent submissions will be listed here with live stage status.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 1 COLUMN: Widgets (Status Summary, Upcoming Actions, Quick Insights) */}
        <div className="space-y-6">
          {/* 1. Application Status Breakdown Widget */}
          <div className="p-5 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Application Status</span>
              </h3>
              <span className="text-[11px] font-semibold text-ink-soft">
                {total} Total
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Submitted */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink">Submitted</span>
                  <span className="font-bold text-ink-soft">{submittedCount}</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(submittedCount)}%` }}
                  />
                </div>
              </div>

              {/* Under Review */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink">Under Review</span>
                  <span className="font-bold text-ink-soft">{reviewingCount}</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(reviewingCount)}%` }}
                  />
                </div>
              </div>

              {/* Shortlisted */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink">Shortlisted</span>
                  <span className="font-bold text-ink-soft">{shortlistedCount}</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(shortlistedCount)}%` }}
                  />
                </div>
              </div>

              {/* Interviewing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink">Interviewing</span>
                  <span className="font-bold text-ink-soft">{interviewingCount}</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(interviewingCount)}%` }}
                  />
                </div>
              </div>

              {/* Offered */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ink">Offered</span>
                  <span className="font-bold text-ink-soft">{offeredCount}</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(offeredCount)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Upcoming Actions / Next Steps Widget */}
          <div className="p-5 rounded-3xl bg-surface border border-border space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Upcoming Actions</span>
              </h3>
              <button
                type="button"
                onClick={() => onSwitchTab('calendar')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Calendar &rarr;
              </button>
            </div>

            {activeInterviewApps.length > 0 ? (
              <div className="space-y-2.5">
                {activeInterviewApps.slice(0, 2).map((app) => (
                  <div
                    key={app._id}
                    onClick={() => onSelectApp(app)}
                    className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                        Interview Stage
                      </span>
                      {app.stageDeadline && (
                        <span className="text-[10px] text-ink-soft font-semibold">
                          Due {new Date(app.stageDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-ink truncate">{app.job?.title}</h4>
                    <p className="text-[11px] text-ink-soft truncate">{app.job?.company?.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center rounded-2xl border border-dashed border-border/70 p-4 space-y-1.5 bg-surface-alt/20">
                <Calendar className="w-6 h-6 text-ink-soft/50 mx-auto" />
                <p className="text-xs font-semibold text-ink">No upcoming actions</p>
                <p className="text-[11px] text-ink-soft/80 leading-relaxed">
                  Scheduled interviews, stage invites, and deadlines will appear here automatically.
                </p>
              </div>
            )}
          </div>

          {/* 3. Quick Insights Widget */}
          <div className="p-5 rounded-3xl bg-surface border border-border space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Application Insights</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Applications</span>
                <span className="text-base font-black text-ink">
                  {stats?.appliedThisWeek !== undefined ? stats.appliedThisWeek : total}
                </span>
                <span className="text-[10px] text-ink-soft block">this period</span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Response Rate</span>
                <span className="text-base font-black text-ink">
                  {total > 0 ? `${Math.round(((interviewingCount + offeredCount) / total) * 100)}%` : '—'}
                </span>
                <span className="text-[10px] text-ink-soft block">stage progression</span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Avg Response</span>
                <span className="text-base font-black text-ink">—</span>
                <span className="text-[10px] text-ink-soft block">employer review</span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/50 border border-border/60 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Interviews</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {interviewingCount}
                </span>
                <span className="text-[10px] text-ink-soft block">active rounds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
