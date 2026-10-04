'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  Trash2,
  Check,
  Filter,
  Zap,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { applicationService } from '@/features/applications/services/applicationService';
import { ApplicationItem } from '@/features/applications/types';
import { resolveCandidateStatus } from '@/features/applications/utils/candidateStatusResolver';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'interview' | 'application' | 'deadline' | 'system' | 'offer';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  jobTitle?: string;
  companyName?: string;
}

interface JobNotificationsViewProps {
  onSwitchTab?: (tab: string, stage?: string) => void;
}

export function JobNotificationsView({ onSwitchTab }: JobNotificationsViewProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'interviews' | 'applications'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await applicationService.getApplications({ page: 1, limit: 50 });
        if (isMounted) {
          setApplications(res.applications || []);
        }
      } catch (err) {
        console.warn('Failed to fetch applications for notifications:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Generate notifications from real application events
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // System welcome notification
    list.push({
      id: 'sys-welcome',
      title: 'Welcome to LetGetIn Career Workspace',
      message: 'Your AI career agent is ready. Track applications, schedule interviews, and auto-apply in real time.',
      timestamp: 'Today',
      type: 'system',
      read: readIds.has('sys-welcome'),
      actionLabel: 'Explore Jobs',
      actionUrl: '/explore',
    });

    applications.forEach((app) => {
      const candStatus = resolveCandidateStatus(app);
      const company = app.job?.company?.name || 'Company';
      const role = app.job?.title || 'Job Position';

      if (app.status === 'offered') {
        list.push({
          id: `offer-${app._id}`,
          title: `Job Offer Received from ${company}!`,
          message: `Congratulations! ${company} has extended a formal employment offer for the ${role} position.`,
          timestamp: new Date(app.appliedAt || app.createdAt).toLocaleDateString(),
          type: 'offer',
          read: readIds.has(`offer-${app._id}`),
          actionLabel: 'Review Offer Details',
          jobTitle: role,
          companyName: company,
        });
      } else if (app.status === 'interviewing' || app.stageStatus === 'invited') {
        list.push({
          id: `interview-${app._id}`,
          title: `Interview Round Scheduled: ${role}`,
          message: `${company} has invited you to the next interview stage. Prepare your talking points and test your audio/video.`,
          timestamp: new Date(app.appliedAt || app.createdAt).toLocaleDateString(),
          type: 'interview',
          read: readIds.has(`interview-${app._id}`),
          actionLabel: 'Open AI Interview Practice',
          actionUrl: `/interviews/ai-practice?role=${encodeURIComponent(role)}`,
          jobTitle: role,
          companyName: company,
        });
      } else if (candStatus.actionRequired) {
        list.push({
          id: `action-${app._id}`,
          title: `Action Required for ${role}`,
          message: candStatus.description,
          timestamp: new Date(app.appliedAt || app.createdAt).toLocaleDateString(),
          type: 'deadline',
          read: readIds.has(`action-${app._id}`),
          actionLabel: candStatus.actionLabel || 'Take Action',
          jobTitle: role,
          companyName: company,
        });
      } else if (app.source === 'ai_apply') {
        list.push({
          id: `ai-apply-${app._id}`,
          title: `AI Auto-Applied: ${role}`,
          message: `Successfully submitted your tailored resume to ${company}. Match score: ${app.matchScore || 85}%.`,
          timestamp: new Date(app.appliedAt || app.createdAt).toLocaleDateString(),
          type: 'application',
          read: readIds.has(`ai-apply-${app._id}`),
          actionLabel: 'View Job Details',
          jobTitle: role,
          companyName: company,
        });
      }
    });

    return list.filter((n) => !dismissedIds.has(n.id));
  }, [applications, readIds, dismissedIds]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'interviews') return item.type === 'interview' || item.type === 'offer';
      if (activeFilter === 'applications') return item.type === 'application' || item.type === 'deadline';
      return true;
    });
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    const allIds = new Set(readIds);
    notifications.forEach((n) => allIds.add(n.id));
    setReadIds(allIds);
  };

  const handleToggleRead = (id: string) => {
    const next = new Set(readIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setReadIds(next);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'offer':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'deadline':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'application':
        return <Zap className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">
                Notifications & Activity Feed
              </h2>
              <p className="text-xs text-ink-soft">
                Stay informed on interview invites, stage progressions, and application updates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-primary" />
              <span>Mark all as read</span>
            </button>
          )}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {unreadCount} Unread
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'interviews', label: 'Interviews & Offers', count: notifications.filter((n) => n.type === 'interview' || n.type === 'offer').length },
          { id: 'applications', label: 'Applications', count: notifications.filter((n) => n.type === 'application' || n.type === 'deadline').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeFilter === tab.id
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'bg-surface border border-border text-ink-soft hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-surface-alt text-ink-soft'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-surface border border-border p-6 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-ink">You're all caught up!</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              No notifications matching the selected filter. As job applications advance and recruiters review your profile, updates will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleToggleRead(notif.id)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-xs space-y-3 ${
                notif.read
                  ? 'bg-surface border-border text-ink opacity-85'
                  : 'bg-surface border-primary/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-surface-alt border border-border shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-ink truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.jobTitle && (
                      <div className="flex items-center gap-2 text-[11px] text-ink font-semibold pt-1">
                        <Briefcase className="w-3 h-3 text-ink-soft" />
                        <span>{notif.jobTitle}</span>
                        {notif.companyName && (
                          <span className="text-ink-soft font-normal">• {notif.companyName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start">
                  <span className="text-[10px] text-ink-soft font-semibold whitespace-nowrap">
                    {notif.timestamp}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(notif.id, e)}
                    className="p-1.5 rounded-xl text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {notif.actionLabel && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-ink-soft font-medium">
                    {notif.read ? 'Marked as read' : 'Click card to mark as read'}
                  </span>
                  {notif.actionUrl ? (
                    <Link
                      href={notif.actionUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold transition cursor-pointer text-xs"
                    >
                      <span>{notif.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSwitchTab) onSwitchTab('overview');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold transition cursor-pointer text-xs"
                    >
                      <span>{notif.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
