'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Briefcase,
  Heart,
  Send,
  CalendarClock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Building2,
  MapPin,
  Sparkles,
  Clock,
  X,
  StickyNote,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Trash2,
  Layers,
  ArrowUpDown,
  Filter,
  DollarSign,
  FileText,
} from 'lucide-react';
import { applicationService } from '@/features/applications/services/applicationService';
import { ApplicationItem, ApplicationStatus } from '@/features/applications/types';
import { jobService } from '../services/jobService';
import { IJob } from '../types/job.types';
import { KanbanJobItem } from './KanbanJobCard';
import { JobApplyModal } from './JobApplyModal';
import { DEMO_ACTIVE_APPLICATIONS } from '@/features/applications/data/mockApplications';

interface JobsListViewProps {
  onSwitchTab?: (tab: 'overview' | 'list' | 'kanban' | 'calendar' | 'notifications' | 'onboarding', stageFilter?: string) => void;
  initialStageFilter?: string;
}

const STAGE_CONFIG: Record<
  KanbanJobItem['stage'],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  saved: {
    label: 'Saved',
    icon: Heart,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  applied: {
    label: 'Applied',
    icon: Send,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  interviewing: {
    label: 'Interviewing',
    icon: CalendarClock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  offered: {
    label: 'Offered',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
};

export function JobsListView({ onSwitchTab, initialStageFilter = 'all' }: JobsListViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<KanbanJobItem[]>([]);
  const [allRecommendedJobs, setAllRecommendedJobs] = useState<IJob[]>([]);

  // Stage & Search Filters
  const [activeStageTab, setActiveStageTab] = useState<string>(initialStageFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'matchScore' | 'company'>('newest');

  // Modals & Details
  const [selectedJob, setSelectedJob] = useState<KanbanJobItem | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [applyJobTarget, setApplyJobTarget] = useState<IJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStageFilter) {
      setActiveStageTab(initialStageFilter);
    }
  }, [initialStageFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch live applications & saved jobs
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // A. Fetch applications
      const appRes = await applicationService.getApplications({ limit: 100, sort: 'recent' });
      let apps = appRes.applications || [];

      // B. Fetch recommendations catalog
      let recJobs: IJob[] = [];
      try {
        const jobsRes = await jobService.getRecommendations({ limit: 50 });
        recJobs = jobsRes.jobs || [];
        setAllRecommendedJobs(recJobs);
      } catch (recErr) {
        console.warn('Failed to load recommended jobs:', recErr);
      }

      // C. Resolve saved jobs from localStorage
      let resolvedSaved: KanbanJobItem[] = [];
      if (typeof window !== 'undefined') {
        try {
          const savedStr = localStorage.getItem('resumebuildai_saved_jobs');
          const savedIds: string[] = savedStr ? JSON.parse(savedStr) : [];

          resolvedSaved = savedIds.map((id) => {
            const matchedJob = recJobs.find((j) => j._id === id);
            return {
              _id: `saved_${id}`,
              jobId: id,
              stage: 'saved',
              title: matchedJob?.title || 'Saved Job Position',
              company: {
                name: matchedJob?.company?.name || 'Company',
                logo: matchedJob?.company?.logo,
                website: matchedJob?.company?.website,
              },
              location: matchedJob?.location,
              salary: matchedJob?.salary,
              workplaceType: matchedJob?.workplaceType,
              employmentType: matchedJob?.employmentType,
              experienceLevel: matchedJob?.experienceLevel,
              matchScore: matchedJob?.matchScore || 80,
              source: 'saved',
              savedAt: new Date().toISOString(),
              skills: matchedJob?.skills || [],
              responsibilities: matchedJob?.responsibilities || [],
              requirements: matchedJob?.requirements || [],
              preferredQualifications: matchedJob?.preferredQualifications || [],
              benefits: matchedJob?.benefits || [],
              applicationUrl: matchedJob?.applicationUrl || '',
              description: matchedJob?.description || '',
            };
          });
        } catch {
          resolvedSaved = [];
        }
      }

      // If empty in dev, fallback to DEMO_ACTIVE_APPLICATIONS
      if (apps.length === 0 && resolvedSaved.length === 0) {
        apps = DEMO_ACTIVE_APPLICATIONS;
      }

      setApplications(apps);
      setSavedJobs(resolvedSaved);
    } catch (err) {
      console.warn('Failed to fetch jobs list data:', err);
      setApplications(DEMO_ACTIVE_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Map applications to unified KanbanJobItems
  const applicationItems = useMemo<KanbanJobItem[]>(() => {
    return applications.map((app) => {
      let stage: KanbanJobItem['stage'] = 'applied';
      if (app.status === 'interviewing') stage = 'interviewing';
      else if (app.status === 'offered') stage = 'offered';
      else if (app.status === 'rejected' || app.status === 'failed') stage = 'rejected';
      else stage = 'applied';

      return {
        _id: app._id,
        jobId: app.job?._id || app._id,
        stage,
        title: app.job?.title || 'Job Position',
        company: {
          name: app.job?.company?.name || 'Company',
          logo: app.job?.company?.logo,
          website: app.job?.company?.website,
        },
        location: app.job?.location,
        salary: app.job?.salary,
        workplaceType: app.job?.workplaceType,
        employmentType: app.job?.employmentType,
        experienceLevel: app.job?.experienceLevel,
        matchScore: app.matchScore || 75,
        source: app.source || 'manual',
        applicationStatus: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        notes: app.notes || '',
        resumeTitle: app.resume?.title || 'Attached Resume',
        skills: app.job?.skills || [],
        responsibilities: app.job?.responsibilities || [],
        requirements: app.job?.requirements || [],
        preferredQualifications: app.job?.preferredQualifications || [],
        benefits: app.job?.benefits || [],
        applicationUrl: app.job?.applicationUrl || '',
        description: app.job?.description || '',
      };
    });
  }, [applications]);

  // 3. Combined all items
  const allItems = useMemo<KanbanJobItem[]>(() => {
    return [...savedJobs, ...applicationItems];
  }, [savedJobs, applicationItems]);

  // 4. Extract unique companies
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((item) => {
      if (item.company?.name) set.add(item.company.name);
    });
    return Array.from(set).sort();
  }, [allItems]);

  // 5. Stage counts
  const savedCount = allItems.filter((i) => i.stage === 'saved').length;
  const appliedCount = allItems.filter((i) => i.stage === 'applied').length;
  const interviewingCount = allItems.filter((i) => i.stage === 'interviewing').length;
  const offeredCount = allItems.filter((i) => i.stage === 'offered').length;
  const rejectedCount = allItems.filter((i) => i.stage === 'rejected').length;
  const grandTotalCount = allItems.length;

  // 6. Filter & sort
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    if (activeStageTab !== 'all') {
      result = result.filter((item) => item.stage === activeStageTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.company?.name?.toLowerCase().includes(q) ||
          item.location?.city?.toLowerCase().includes(q) ||
          item.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (companyFilter !== 'all') {
      result = result.filter((item) => item.company?.name === companyFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date().getTime();
      result = result.filter((item) => {
        const itemDateStr = item.appliedAt || item.savedAt;
        if (!itemDateStr) return true;
        const itemTime = new Date(itemDateStr).getTime();
        const diffHours = (now - itemTime) / (1000 * 60 * 60);

        if (dateFilter === '24h') return diffHours <= 24;
        if (dateFilter === '7d') return diffHours <= 24 * 7;
        if (dateFilter === '30d') return diffHours <= 24 * 30;
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortOption === 'newest') {
        const dateA = new Date(a.appliedAt || a.savedAt || 0).getTime();
        const dateB = new Date(b.appliedAt || b.savedAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortOption === 'oldest') {
        const dateA = new Date(a.appliedAt || a.savedAt || 0).getTime();
        const dateB = new Date(b.appliedAt || b.savedAt || 0).getTime();
        return dateA - dateB;
      }
      if (sortOption === 'matchScore') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortOption === 'company') {
        return (a.company?.name || '').localeCompare(b.company?.name || '');
      }
      return 0;
    });

    return result;
  }, [allItems, activeStageTab, searchQuery, companyFilter, dateFilter, sortOption]);

  // Stage change handler
  const handleMoveStage = async (job: KanbanJobItem, newStage: KanbanJobItem['stage']) => {
    if (job.stage === newStage) return;

    if (job.stage === 'saved') {
      try {
        let appStatus: ApplicationStatus = 'submitted';
        if (newStage === 'interviewing') appStatus = 'interviewing';
        else if (newStage === 'offered') appStatus = 'offered';
        else if (newStage === 'rejected') appStatus = 'rejected';

        const createdApp = await applicationService.createApplication({
          jobId: job.jobId,
          status: appStatus,
          matchScore: job.matchScore,
          source: 'manual',
        });

        if (typeof window !== 'undefined') {
          try {
            const savedStr = localStorage.getItem('resumebuildai_saved_jobs');
            const savedIds: string[] = savedStr ? JSON.parse(savedStr) : [];
            const next = savedIds.filter((id) => id !== job.jobId);
            localStorage.setItem('resumebuildai_saved_jobs', JSON.stringify(next));
          } catch {}
        }

        setSavedJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
        setApplications((prev) => [createdApp, ...prev.filter((a) => a._id !== createdApp._id)]);
        showToast(`Job moved to ${newStage.toUpperCase()} stage!`);
      } catch (err) {
        console.warn('Failed to move saved job:', err);
        showToast('Failed to update stage.');
      }
      return;
    }

    try {
      let targetStatus: ApplicationStatus = 'submitted';
      if (newStage === 'interviewing') targetStatus = 'interviewing';
      else if (newStage === 'offered') targetStatus = 'offered';
      else if (newStage === 'rejected') targetStatus = 'rejected';
      else if (newStage === 'applied') targetStatus = 'submitted';

      setApplications((prev) =>
        prev.map((app) => (app._id === job._id ? { ...app, status: targetStatus } : app))
      );

      if (selectedJob?._id === job._id) {
        setSelectedJob((prev) => (prev ? { ...prev, stage: newStage, applicationStatus: targetStatus } : null));
      }

      await applicationService.updateStatus(job._id, targetStatus);
      showToast(`Status updated to ${newStage.toUpperCase()}!`);
    } catch (err) {
      console.warn('Failed to update application status:', err);
      showToast('Failed to update status.');
      fetchData();
    }
  };

  // Delete / Withdraw handler
  const handleDeleteJob = async (job: KanbanJobItem) => {
    if (job.stage === 'saved') {
      if (typeof window !== 'undefined') {
        try {
          const savedStr = localStorage.getItem('resumebuildai_saved_jobs');
          const savedIds: string[] = savedStr ? JSON.parse(savedStr) : [];
          const next = savedIds.filter((id) => id !== job.jobId);
          localStorage.setItem('resumebuildai_saved_jobs', JSON.stringify(next));
        } catch {}
      }
      setSavedJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
      if (selectedJob?._id === job._id) setSelectedJob(null);
      showToast('Removed from saved jobs.');
      return;
    }

    if (!confirm('Are you sure you want to withdraw or remove this application record?')) return;

    try {
      await applicationService.deleteApplication(job._id);
      setApplications((prev) => prev.filter((a) => a._id !== job._id));
      if (selectedJob?._id === job._id) setSelectedJob(null);
      showToast('Application record withdrawn.');
    } catch (err) {
      console.warn('Failed to delete application:', err);
      showToast('Failed to remove application.');
    }
  };

  // Open apply modal for saved job
  const handleApplySavedJob = (job: KanbanJobItem) => {
    const jobObj: IJob = {
      _id: job.jobId,
      title: job.title,
      company: job.company,
      description: job.description || '',
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      preferredQualifications: job.preferredQualifications || [],
      skills: job.skills || [],
      experienceLevel: (job.experienceLevel as any) || 'mid',
      minimumExperience: 1,
      employmentType: (job.employmentType as any) || 'full-time',
      workplaceType: (job.workplaceType as any) || 'remote',
      location: {
        city: job.location?.city,
        state: job.location?.state,
        country: job.location?.country || 'Remote',
        remote: job.location?.remote ?? true,
      },
      salary: {
        min: job.salary?.min || 0,
        max: job.salary?.max || 0,
        currency: job.salary?.currency || 'INR',
        period: (job.salary?.period as any) || 'yearly',
      },
      benefits: job.benefits || [],
      applicationUrl: job.applicationUrl || '',
      source: 'manual',
      publishedAt: job.savedAt || new Date().toISOString(),
      matchScore: job.matchScore || 80,
      matchedSkills: job.skills?.slice(0, 4) || [],
      missingSkills: [],
      matchReasons: [],
    };
    setApplyJobTarget(jobObj);
    setIsApplyModalOpen(true);
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedJob || selectedJob.stage === 'saved') return;
    setIsSavingNotes(true);
    try {
      await applicationService.updateStatus(
        selectedJob._id,
        selectedJob.applicationStatus || 'submitted',
        notesDraft
      );
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedJob._id ? { ...a, notes: notesDraft } : a))
      );
      setSelectedJob((prev) => (prev ? { ...prev, notes: notesDraft } : null));
      showToast('Interview notes saved successfully.');
    } catch (err) {
      console.warn('Failed to save notes:', err);
      showToast('Failed to save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatSalary = (salary?: KanbanJobItem['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const { min, max, currency, period } = salary;
    const periodLabel = period === 'yearly' ? '/yr' : period === 'monthly' ? '/mo' : '/hr';

    if (currency === 'INR') {
      const minLPA = min ? (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1) : '';
      const maxLPA = max ? (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1) : '';
      return minLPA && maxLPA ? `₹${minLPA}–${maxLPA} LPA` : maxLPA ? `₹${maxLPA} LPA` : 'Competitive';
    }
    return `${currency || '$'} ${min ? min.toLocaleString() + ' - ' : ''}${max?.toLocaleString()} ${periodLabel}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-3.5 px-4 rounded-2xl bg-ink text-white font-bold text-xs shadow-2xl border border-white/20 animate-in slide-in-from-top duration-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <span>My Tracked Jobs</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {grandTotalCount} Total
            </span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Complete list view of all your bookmarked, applied, interviewing, and offered jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-ink-soft hover:text-ink hover:bg-surface-alt font-semibold text-xs transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/ai-apply')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-xs hover:shadow-glow transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>AI Auto-Apply</span>
          </button>
        </div>
      </div>

      {/* 5 Stage Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {[
          { id: 'all', label: 'All Jobs', count: grandTotalCount, icon: Layers },
          { id: 'saved', label: 'Saved', count: savedCount, icon: Heart },
          { id: 'applied', label: 'Applied', count: appliedCount, icon: Send },
          { id: 'interviewing', label: 'Interviewing', count: interviewingCount, icon: CalendarClock },
          { id: 'offered', label: 'Offered', count: offeredCount, icon: CheckCircle2 },
          { id: 'rejected', label: 'Rejected', count: rejectedCount, icon: XCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStageTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStageTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-ink-soft hover:text-ink hover:bg-surface-alt/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-alt text-ink-soft border border-border'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company, skills..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt/50 text-xs font-medium text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-glow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Company Dropdown */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          aria-label="Filter by company"
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="all">All companies</option>
          {uniqueCompanies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by date"
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="all">Any date</option>
          <option value="24h">Past 24 hours</option>
          <option value="7d">Past 7 days</option>
          <option value="30d">Past 30 days</option>
        </select>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as any)}
          aria-label="Sort jobs"
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="matchScore">Highest match score</option>
          <option value="company">Company (A-Z)</option>
        </select>

        <div className="text-xs text-ink-soft font-bold whitespace-nowrap px-1 self-center">
          {filteredItems.length} of {grandTotalCount}
        </div>
      </div>

      {/* Main List Table / Cards */}
      {loading ? (
        <div className="space-y-3 py-10 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-ink-soft font-medium">Loading your tracked jobs...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-dashed border-border rounded-3xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-border flex items-center justify-center mx-auto text-ink-soft">
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-ink">No jobs found in this list</p>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            No jobs match the current stage and search criteria. Explore more opportunities or adjust your filter.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveStageTab('all');
                setSearchQuery('');
                setCompanyFilter('all');
                setDateFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:bg-surface transition cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={() => router.push('/explore')}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-glow transition cursor-pointer"
            >
              Explore Opportunities
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((job) => {
            const stageCfg = STAGE_CONFIG[job.stage] || STAGE_CONFIG.applied;
            const StageIcon = stageCfg.icon;
            const salaryFormatted = formatSalary(job.salary);
            const dateFormatted = new Date(job.appliedAt || job.savedAt || new Date()).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={job._id || job.jobId}
                className="p-4 sm:p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-md transition-all shadow-2xs space-y-3.5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info: Avatar + Title + Company + Location */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                      {job.company?.name?.charAt(0) || 'J'}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          onClick={() => {
                            setSelectedJob(job);
                            setNotesDraft(job.notes || '');
                          }}
                          className="text-sm sm:text-base font-bold text-ink hover:text-primary transition truncate cursor-pointer"
                        >
                          {job.title}
                        </h3>

                        {job.source === 'ai_apply' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Auto-Apply
                          </span>
                        )}
                        {job.source === 'saved' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Heart className="w-2.5 h-2.5" />
                            Saved
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft font-medium">
                        <span className="flex items-center gap-1 text-ink font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-ink-soft" />
                          {job.company?.name}
                        </span>

                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                            {job.location.city ? `${job.location.city}, ${job.location.country || ''}` : job.location.country || 'Remote'}
                          </span>
                        )}

                        {job.workplaceType && (
                          <span className="capitalize px-2 py-0.2 rounded-md bg-surface-alt border border-border text-[10px] font-semibold text-ink-soft">
                            {job.workplaceType}
                          </span>
                        )}

                        {job.employmentType && (
                          <span className="capitalize px-2 py-0.2 rounded-md bg-surface-alt border border-border text-[10px] font-semibold text-ink-soft">
                            {job.employmentType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right Badges: Stage, ATS Match, Salary */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Salary badge */}
                    {salaryFormatted && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {salaryFormatted}
                      </span>
                    )}

                    {/* Match Score */}
                    {job.matchScore > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {job.matchScore}% Match
                      </span>
                    )}

                    {/* Current Stage Pill */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${stageCfg.bg} ${stageCfg.color} ${stageCfg.border}`}
                    >
                      <StageIcon className="w-3.5 h-3.5" />
                      <span>{stageCfg.label}</span>
                    </span>
                  </div>
                </div>

                {/* Footer details: Date Tracked, Skills Preview, Action Buttons */}
                <div className="pt-2.5 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.stage === 'saved' ? 'Saved' : 'Applied'} on {dateFormatted}
                    </span>

                    {job.skills && job.skills.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {job.skills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-surface-alt border border-border text-ink-soft"
                          >
                            {sk}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-[10px] text-ink-soft">+{job.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Stage Selector Dropdown */}
                    <div className="relative inline-block">
                      <select
                        value={job.stage}
                        onChange={(e) => handleMoveStage(job, e.target.value as any)}
                        aria-label="Move Stage"
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-border bg-surface text-ink hover:bg-surface-alt transition cursor-pointer focus:outline-none"
                      >
                        <option value="saved">Move: Saved</option>
                        <option value="applied">Move: Applied</option>
                        <option value="interviewing">Move: Interviewing</option>
                        <option value="offered">Move: Offered</option>
                        <option value="rejected">Move: Rejected</option>
                      </select>
                    </div>

                    {job.stage === 'saved' && (
                      <button
                        type="button"
                        onClick={() => handleApplySavedJob(job)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-xs hover:shadow-glow transition cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJob(job);
                        setNotesDraft(job.notes || '');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-primary/10 hover:text-primary text-ink font-bold text-xs border border-border transition cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job)}
                      className="p-1.5 rounded-xl text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                      title={job.stage === 'saved' ? 'Remove from saved' : 'Withdraw application'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-surface border border-border rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-lg font-black shrink-0 shadow-glow">
                  {selectedJob.company?.name?.charAt(0) || 'J'}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-ink tracking-tight">
                    {selectedJob.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft font-medium">
                    <span className="font-bold text-ink flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-ink-soft" />
                      {selectedJob.company?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                      {selectedJob.location?.remote
                        ? 'Remote'
                        : selectedJob.location?.city || selectedJob.location?.country || 'Flexible'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Current Stage</span>
                <span className="text-xs font-bold text-ink capitalize flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {selectedJob.stage}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Match Score</span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  {selectedJob.matchScore}% Match
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Source</span>
                <span className="text-xs font-bold text-ink capitalize">
                  {selectedJob.source === 'ai_apply' ? 'AI Auto-Apply' : selectedJob.source}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-soft block">Date Tracked</span>
                <span className="text-xs font-bold text-ink">
                  {new Date(selectedJob.appliedAt || selectedJob.savedAt || new Date()).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="p-3.5 rounded-2xl bg-surface-alt/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-ink">Move to stage:</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['saved', 'applied', 'interviewing', 'offered', 'rejected'] as const).map((stageKey) => (
                  <button
                    key={stageKey}
                    type="button"
                    disabled={selectedJob.stage === stageKey}
                    onClick={() => handleMoveStage(selectedJob, stageKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      selectedJob.stage === stageKey
                        ? 'bg-primary text-white shadow-xs opacity-70 cursor-default'
                        : 'bg-surface border border-border text-ink-soft hover:text-ink hover:bg-surface-alt'
                    }`}
                  >
                    {stageKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview & Candidate Notes */}
            {selectedJob.stage !== 'saved' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                    Interview & Candidate Notes
                  </h4>
                  <button
                    type="button"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="text-xs font-bold text-primary hover:text-primary-glow cursor-pointer disabled:opacity-50"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record interviewer names, salary expectations, interview schedule, questions asked, or follow-ups..."
                  className="w-full h-24 p-3 rounded-2xl border border-border bg-surface-alt/50 text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/20 scrollbar-thin"
                />
              </div>
            )}

            {/* Skills */}
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-xl bg-surface-alt border border-border text-ink font-semibold text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedJob.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Job Description</h4>
                <div className="p-3.5 rounded-2xl bg-surface-alt/40 border border-border text-xs text-ink-soft leading-relaxed max-h-48 overflow-y-auto scrollbar-thin whitespace-pre-line">
                  {selectedJob.description}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteJob(selectedJob)}
                className="text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                {selectedJob.stage === 'saved' ? 'Remove from Saved' : 'Withdraw Record'}
              </button>

              <div className="flex items-center gap-2">
                {selectedJob.stage === 'saved' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(null);
                      handleApplySavedJob(selectedJob);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:shadow-glow transition cursor-pointer"
                  >
                    Apply Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 text-ink text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <JobApplyModal
        isOpen={isApplyModalOpen}
        job={applyJobTarget}
        allJobs={allRecommendedJobs}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={async () => {
          showToast('Application submitted successfully!');
          fetchData();
        }}
      />
    </div>
  );
}
