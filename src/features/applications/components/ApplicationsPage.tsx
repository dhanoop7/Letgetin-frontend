'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  LayoutDashboard,
  Columns3,
  CalendarDays,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { ApplicationItem, ApplicationStats, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';
import { ApplicationTrackingModal } from './ApplicationTrackingModal';
import { ActiveApplicationsList } from './ActiveApplicationsList';
import { MyApplicationsSelectionPanel } from './MyApplicationsSelectionPanel';
import { ApplicationDetailsPanel } from './ApplicationDetailsPanel';
import { ApplicationsKanbanView } from './ApplicationsKanbanView';
import { ApplicationsCalendarView } from './ApplicationsCalendarView';
import { ApplicationsTimelineView } from './ApplicationsTimelineView';
import { JobNotificationsView } from '@/features/jobs/components/JobNotificationsView';
import { JobOnboardingView } from '@/features/jobs/components/JobOnboardingView';

import { DEMO_ACTIVE_APPLICATIONS } from '../data/mockApplications';

type ActiveApplicationsTab =
  | 'overview'
  | 'kanban'
  | 'calendar'
  | 'timeline'
  | 'notifications'
  | 'onboarding';

const APPLICATIONS_TABS: {
  id: ActiveApplicationsTab;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban Board', icon: Columns3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'onboarding', label: 'Onboarding', icon: GraduationCap },
];

const VALID_APPLICATIONS_TABS: ActiveApplicationsTab[] = [
  'overview',
  'kanban',
  'calendar',
  'timeline',
  'notifications',
  'onboarding',
];

export function ApplicationsPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ActiveApplicationsTab | null;

  const [activeTab, setActiveTab] = useState<ActiveApplicationsTab>(() => {
    if (tabFromUrl && VALID_APPLICATIONS_TABS.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return 'overview';
  });

  useEffect(() => {
    if (tabFromUrl && VALID_APPLICATIONS_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [trackingModalApp, setTrackingModalApp] = useState<ApplicationItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationService.getApplications({
        page: 1,
        limit: 100,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        sort: 'recent',
      });

      const fetched = res.applications || [];
      const finalApps = fetched.length > 0 ? fetched : DEMO_ACTIVE_APPLICATIONS;
      setApplications(finalApps);
      setStats(
        res.stats || {
          total: finalApps.length,
          submitted: finalApps.filter((a) => a.status === 'submitted').length,
          reviewing: finalApps.filter((a) => a.status === 'reviewing').length,
          shortlisted: finalApps.filter((a) => a.status === 'shortlisted').length,
          interviewing: finalApps.filter((a) => a.status === 'interviewing').length,
          offered: finalApps.filter((a) => a.status === 'offered').length,
          rejected: finalApps.filter((a) => a.status === 'rejected' || a.status === 'failed').length,
          autoApplied: finalApps.filter((a) => a.source === 'ai_apply').length,
        }
      );
      setTotalCount(res.pagination?.total ?? finalApps.length);

      // Auto-select first application if none selected or selected is no longer in list
      setSelectedApp((prev) => {
        if (!prev && finalApps.length > 0) return finalApps[0];
        if (prev && !finalApps.some((a) => a._id === prev._id)) {
          return finalApps.length > 0 ? finalApps[0] : null;
        }
        return prev;
      });
    } catch (err) {
      console.warn('Failed to load applications from API, using local fallback:', err);
      setApplications(DEMO_ACTIVE_APPLICATIONS);
      setTotalCount(DEMO_ACTIVE_APPLICATIONS.length);
      setSelectedApp((prev) => prev || DEMO_ACTIVE_APPLICATIONS[0]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw or remove this application record?')) return;
    try {
      if (!appId.startsWith('demo-app')) {
        await applicationService.deleteApplication(appId);
      }
      setApplications((prev) => {
        const next = prev.filter((a) => a._id !== appId);
        if (selectedApp?._id === appId) {
          setSelectedApp(next.length > 0 ? next[0] : null);
        }
        return next;
      });
      if (trackingModalApp?._id === appId) setTrackingModalApp(null);
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn('Failed to delete application:', err);
    }
  };

  const handleSelectAppWithDrawer = (app: ApplicationItem) => {
    setSelectedApp(app);
    if (activeTab !== 'overview') {
      setIsDetailDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. APPLICATION TABS (Positioned ABOVE the Blue Header) */}
        <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
          {APPLICATIONS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-brand text-white shadow-elegant'
                    : 'text-ink-soft hover:text-ink hover:bg-secondary/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-primary-glow'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. TOP BLUE GRADIENT HEADER */}
        {activeTab === 'overview' && (
          <div className="bg-gradient-brand rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-elegant relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full w-fit border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-primary-glow" /> AI Career & Application Command Center
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Applications
              </h1>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                Track your job applications, interview milestones, and hiring progress in real-time across{' '}
                <span className="font-bold text-white">{totalCount} submitted applications</span>
                {stats?.interviewing ? (
                  <> with <span className="font-bold text-emerald-300">{stats.interviewing} active interview stages</span></>
                ) : ''}.
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="relative flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/ai-apply"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-ink font-extrabold text-xs shadow-md hover:bg-white/90 hover:scale-102 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                <span>Apply to More Jobs</span>
              </Link>
            </div>
          </div>
        )}

        {/* 3. ACTIVE TAB CONTENT AREA */}
        <div className="w-full">
          {/* OVERVIEW TAB: TWO-PANEL (5 ACTIVE APPLICATIONS LIST + DETAILS) */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT PANEL: 5 ACTIVE APPLICATIONS LIST (~33%) */}
              <div className="lg:col-span-4 space-y-4">
                <ActiveApplicationsList
                  applications={applications}
                  selectedApp={selectedApp}
                  onSelectApp={(app) => setSelectedApp(app)}
                  loading={loading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  maxCards={5}
                />
              </div>

              {/* RIGHT PANEL: SELECTED APPLICATION DETAILS (~67%) */}
              <div className="lg:col-span-8">
                <ApplicationDetailsPanel
                  application={selectedApp}
                  onTrackApp={(app) => setTrackingModalApp(app)}
                  onDeleteApp={handleDelete}
                />
              </div>
            </div>
          )}

          {/* THE 5 NON-OVERVIEW TABS: TWO-PANEL (MY APPLICATIONS SELECTION LIST + TAB-SPECIFIC CONTENT) */}
          {activeTab !== 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT PANEL: My Applications 5 Cards with Filter & Sort (~33% width on large screens) */}
              <div className="lg:col-span-4 xl:col-span-4 space-y-4">
                <MyApplicationsSelectionPanel
                  applications={applications}
                  selectedApp={selectedApp}
                  onSelectApp={(app) => setSelectedApp(app)}
                  loading={loading}
                  maxCards={5}
                />
              </div>

              {/* RIGHT PANEL: Current Tab Content (~67% width on large screens) */}
              <div className="lg:col-span-8 xl:col-span-8 min-w-0 space-y-6">
                {/* KANBAN BOARD TAB */}
                {activeTab === 'kanban' && (
                  <ApplicationsKanbanView
                    applications={applications}
                    selectedApp={selectedApp}
                    onSelectApp={handleSelectAppWithDrawer}
                    onTrackApp={(app) => setTrackingModalApp(app)}
                    onDeleteApp={handleDelete}
                  />
                )}

                {/* CALENDAR TAB */}
                {activeTab === 'calendar' && (
                  <ApplicationsCalendarView
                    applications={applications}
                    selectedApp={selectedApp}
                    onSelectApp={handleSelectAppWithDrawer}
                    onTrackApp={(app) => setTrackingModalApp(app)}
                  />
                )}

                {/* TIMELINE TAB */}
                {activeTab === 'timeline' && (
                  <ApplicationsTimelineView
                    applications={applications}
                    selectedApp={selectedApp}
                    onSelectApp={handleSelectAppWithDrawer}
                    onTrackApp={(app) => setTrackingModalApp(app)}
                    onDeleteApp={handleDelete}
                  />
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <JobNotificationsView
                    applications={applications}
                    selectedApp={selectedApp}
                    onSwitchTab={(tab) => {
                      if (VALID_APPLICATIONS_TABS.includes(tab as ActiveApplicationsTab)) {
                        setActiveTab(tab as ActiveApplicationsTab);
                      }
                    }}
                  />
                )}

                {/* ONBOARDING TAB */}
                {activeTab === 'onboarding' && (
                  <JobOnboardingView
                    applications={applications}
                    selectedApp={selectedApp}
                    onSelectApp={(app) => setSelectedApp(app)}
                    onSwitchTab={(tab) => {
                      if (VALID_APPLICATIONS_TABS.includes(tab as ActiveApplicationsTab)) {
                        setActiveTab(tab as ActiveApplicationsTab);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Drawer for Application Details when inspecting from Kanban / Calendar / Timeline */}
      {activeTab !== 'overview' && isDetailDrawerOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-background h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">Application Full Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-alt text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ApplicationDetailsPanel
              application={selectedApp}
              onTrackApp={(app) => setTrackingModalApp(app)}
              onDeleteApp={(appId) => {
                handleDelete(appId);
                setIsDetailDrawerOpen(false);
              }}
            />
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
