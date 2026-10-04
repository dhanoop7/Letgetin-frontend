'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  GraduationCap,
  Gift,
  Check,
  Globe,
  Tag,
  AlertCircle,
  X,
  LayoutGrid,
  Columns3,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { ApplicationItem, ApplicationStats, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';
import { ApplicationTrackingModal } from './ApplicationTrackingModal';
import { ApplicationsOverviewView } from './ApplicationsOverviewView';
import { ApplicationsKanbanView } from './ApplicationsKanbanView';
import { ApplicationsCalendarView } from './ApplicationsCalendarView';
import { ApplicationsTimelineView } from './ApplicationsTimelineView';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  submitted: {
    label: 'Submitted',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: Clock,
  },
  reviewing: {
    label: 'Under Review',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: MessageSquare,
  },
  shortlisted: {
    label: 'Shortlisted',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: CheckCircle2,
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: Calendar,
  },
  offered: {
    label: 'Offer Received',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: Award,
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: XCircle,
  },
  failed: {
    label: 'Failed',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: XCircle,
  },
};

type ActiveApplicationsTab = 'overview' | 'kanban' | 'calendar' | 'timeline';

export function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<ActiveApplicationsTab>('overview');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'matchScore'>('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [trackingModalApp, setTrackingModalApp] = useState<ApplicationItem | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationService.getApplications({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortOption,
      });

      setApplications(res.applications);
      setStats(res.stats);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.warn('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sourceFilter, searchQuery, sortOption]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw or remove this application record?')) return;
    try {
      await applicationService.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      if (selectedApp?._id === appId) setSelectedApp(null);
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn('Failed to delete application:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink tracking-tight">My Applications</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {totalCount} Applied
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Track your job applications, interview milestones, and hiring progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/ai-apply"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-elegant hover:shadow-glow transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Apply to More Jobs</span>
          </Link>
        </div>
      </div>

      {/* 2. Candidate Status KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* TOTAL APPLIED */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Applied</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-ink">{stats?.total || totalCount || 0}</div>
          <div className="text-[11px] text-ink-soft">All submitted jobs</div>
        </div>

        {/* UNDER REVIEW */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider">Under Review</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.reviewing || 0}
          </div>
          <div className="text-[11px] text-ink-soft">Screening in progress</div>
        </div>

        {/* SHORTLISTED */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats?.shortlisted || 0}
          </div>
          <div className="text-[11px] text-ink-soft">Qualified for next round</div>
        </div>

        {/* INTERVIEWING */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interviewing</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats?.interviewing || 0}
          </div>
          <div className="text-[11px] text-ink-soft">Active interview stages</div>
        </div>

        {/* OFFERED */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider">Offered</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.offered || 0}
          </div>
          <div className="text-[11px] text-ink-soft">Job offers received</div>
        </div>
      </div>

      {/* 3. Tab Navigation Switcher (Overview, Kanban Board, Calendar, Timeline) */}
      <div className="bg-surface border border-border rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 w-fit select-none flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-brand text-white shadow-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kanban'
              ? 'bg-gradient-brand text-white shadow-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
          }`}
        >
          <Columns3 className="w-4 h-4" />
          <span>Kanban Board</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-gradient-brand text-white shadow-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-gradient-brand text-white shadow-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </button>
      </div>

      {/* 4. TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <ApplicationsOverviewView
          applications={applications}
          stats={stats}
          totalCount={totalCount}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          onSelectApp={(app) => setSelectedApp(app)}
          onTrackApp={(app) => setTrackingModalApp(app)}
          onDeleteApp={handleDelete}
          onSwitchTab={setActiveTab}
        />
      )}

      {/* 5. TAB 2: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-surface border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary-glow animate-spin mx-auto" />
              <p className="text-xs font-medium text-ink-soft">Loading Kanban board...</p>
            </div>
          ) : (
            <ApplicationsKanbanView
              applications={applications}
              onSelectApp={(app) => setSelectedApp(app)}
              onTrackApp={(app) => setTrackingModalApp(app)}
              onDeleteApp={handleDelete}
            />
          )}
        </div>
      )}

      {/* 6. TAB 3: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-surface border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary-glow animate-spin mx-auto" />
              <p className="text-xs font-medium text-ink-soft">Loading application calendar...</p>
            </div>
          ) : (
            <ApplicationsCalendarView
              applications={applications}
              onSelectApp={(app) => setSelectedApp(app)}
              onTrackApp={(app) => setTrackingModalApp(app)}
            />
          )}
        </div>
      )}

      {/* 7. TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-surface border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary-glow animate-spin mx-auto" />
              <p className="text-xs font-medium text-ink-soft">Loading application timeline...</p>
            </div>
          ) : (
            <ApplicationsTimelineView
              applications={applications}
              onSelectApp={(app) => setSelectedApp(app)}
              onTrackApp={(app) => setTrackingModalApp(app)}
              onDeleteApp={handleDelete}
            />
          )}
        </div>
      )}

      {/* Comprehensive Full Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-lg font-black shrink-0 shadow-glow">
                  {selectedApp.job?.company?.name?.charAt(0) || 'J'}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-ink tracking-tight">
                    {selectedApp.job?.title || 'Job Details'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft font-medium">
                    <span className="font-bold text-ink flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-ink-soft" />
                      {selectedApp.job?.company?.name}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                      {selectedApp.job?.location?.city
                        ? `${selectedApp.job.location.city}, ${selectedApp.job.location.country}`
                        : selectedApp.job?.location?.country || 'Remote Eligible'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Status & Interactive Tracker CTA */}
            {(() => {
              const selStatus = resolveCandidateStatus(selectedApp);
              return (
                <div className="p-4 rounded-2xl bg-surface-alt/60 border border-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                        Current Application Status
                      </div>
                      <div className="text-sm font-bold text-ink flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${selStatus.badgeClass}`}>
                          {selStatus.label}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTrackingModalApp(selectedApp)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>View Live Funnel Timeline</span>
                    </button>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {selStatus.description}
                  </p>
                </div>
              );
            })()}

            {/* Dynamic Status Follow-Up Action Banners */}
            {selectedApp.status === 'interviewing' && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-ink">Interview Stage Active</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      You have been invited for an interview! Sharpen your answers with real-time AI voice practice or check your upcoming timeline.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={`/interviews/ai-practice?role=${encodeURIComponent(selectedApp.job?.title || '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch AI Interview Practice</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(null);
                      setActiveTab('calendar');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink font-semibold text-xs transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-ink-soft" />
                    <span>View In Calendar Tab</span>
                  </button>
                </div>
              </div>
            )}

            {selectedApp.status === 'shortlisted' && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Application Shortlisted!</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Your profile met the key qualifications. Get ahead by exploring mock interview questions tailored to {selectedApp.job?.title || 'this role'}.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/interviews/ai-practice?role=${encodeURIComponent(selectedApp.job?.title || '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rehearse Role Questions</span>
                  </Link>
                </div>
              </div>
            )}

            {selectedApp.status === 'offered' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Congratulations! Job Offer Received</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  You have received an employment offer from {selectedApp.job?.company?.name || 'the hiring organization'}. Review the compensation and position requirements below.
                </p>
              </div>
            )}

            {/* Application Overview Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Application Status</span>
                {(() => {
                  const meta = STATUS_CONFIG[selectedApp.status] || STATUS_CONFIG.submitted;
                  const Icon = meta.icon;
                  return (
                    <span className={`text-xs font-bold inline-flex items-center gap-1 ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Match Score</span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedApp.matchScore}% Match
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Application Source</span>
                <span className="text-xs font-bold text-ink flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {selectedApp.source === 'ai_apply' ? 'AI Auto-Apply' : 'Manual'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Date Applied</span>
                <span className="text-xs font-bold text-ink">
                  {new Date(selectedApp.appliedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Key Job Metadata Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface border border-border text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Workplace Type
                </span>
                <span className="font-bold text-ink capitalize">
                  {selectedApp.job?.workplaceType || 'Remote / Flexible'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Employment
                </span>
                <span className="font-bold text-ink capitalize">
                  {selectedApp.job?.employmentType || 'Full-Time'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Compensation
                </span>
                <span className="font-bold text-emerald-600">
                  {selectedApp.job?.salary?.max
                    ? `${selectedApp.job.salary.currency || 'INR'} ${selectedApp.job.salary.min ? `${selectedApp.job.salary.min.toLocaleString()} - ` : ''}${selectedApp.job.salary.max.toLocaleString()} / ${selectedApp.job.salary.period || 'year'}`
                    : 'Competitive Salary'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <Award className="w-3 h-3" /> Experience Level
                </span>
                <span className="font-bold text-ink capitalize">
                  {selectedApp.job?.experienceLevel || 'Mid-Senior Level'}{' '}
                  {selectedApp.job?.minimumExperience !== undefined
                    ? `(${selectedApp.job.minimumExperience}${selectedApp.job.maximumExperience ? `-${selectedApp.job.maximumExperience}` : '+'} yrs)`
                    : ''}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Education
                </span>
                <span className="font-bold text-ink">
                  {selectedApp.job?.educationRequirements || "Bachelor's Degree or Equivalent"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-ink-soft flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Resume Submitted
                </span>
                <span className="font-bold text-primary truncate block">
                  {selectedApp.resume?.title || 'Selected Career Resume'}
                </span>
              </div>
            </div>

            {/* Required Skills Chips */}
            {selectedApp.job?.skills && selectedApp.job.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Required Technologies & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.job.skills.map((skill) => (
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

            {/* Core Responsibilities */}
            {selectedApp.job?.responsibilities && selectedApp.job.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Responsibilities
                </h4>
                <ul className="space-y-1.5 text-xs text-ink-soft leading-relaxed p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
                  {selectedApp.job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications / Requirements */}
            {selectedApp.job?.requirements && selectedApp.job.requirements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  Job Requirements & Qualifications
                </h4>
                <ul className="space-y-1.5 text-xs text-ink-soft leading-relaxed p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
                  {selectedApp.job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Qualifications */}
            {selectedApp.job?.preferredQualifications &&
              selectedApp.job.preferredQualifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Preferred Qualifications
                  </h4>
                  <ul className="space-y-1.5 text-xs text-ink-soft leading-relaxed p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
                    {selectedApp.job.preferredQualifications.map((pref, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>{pref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Benefits & Perks */}
            {selectedApp.job?.benefits && selectedApp.job.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  Benefits & Perks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedApp.job.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-surface-alt border border-border text-xs text-ink font-medium flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Job Description */}
            {selectedApp.job?.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Complete Job Description
                </h4>
                <div className="p-4 rounded-2xl bg-surface-alt/40 border border-border text-xs text-ink-soft leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto scrollbar-thin">
                  {selectedApp.job.description}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-ink-soft">
                Application ID: <span className="font-mono text-ink">{selectedApp._id}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-glow transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Application Tracking Modal */}
      {trackingModalApp && (
        <ApplicationTrackingModal
          application={trackingModalApp}
          onClose={() => setTrackingModalApp(null)}
        />
      )}
    </div>
  );
}
