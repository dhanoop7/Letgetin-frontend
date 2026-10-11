'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  FileText,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  Search,
} from 'lucide-react';
import { ESignNotificationItem, ESignNotificationType } from '../types/documents';
import { DEMO_ESIGN_NOTIFICATIONS } from '../data/mockESignData';
import { ESignTabId } from './ESignTabNav';
import { toast } from 'sonner';

interface ESignNotificationsViewProps {
  onNavigateTab?: (tabId: ESignTabId) => void;
}

export const ESignNotificationsView: React.FC<ESignNotificationsViewProps> = ({
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<ESignNotificationItem[]>(
    DEMO_ESIGN_NOTIFICATIONS
  );
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>(
    DEMO_ESIGN_NOTIFICATIONS[0]?.id || ''
  );
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ACTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.companyName && n.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filter === 'ALL'
          ? true
          : filter === 'UNREAD'
          ? !n.isRead
          : n.type === 'SIGNATURE_REQUIRED' ||
            n.type === 'CONSENT_REQUEST' ||
            n.type === 'ADDITIONAL_AUTH_REQUEST';

      return matchesSearch && matchesFilter;
    });
  }, [notifications, filter, searchQuery]);

  // Ensure selected notification is valid
  const selectedNotification = useMemo(() => {
    return (
      notifications.find((n) => n.id === selectedNotificationId) ||
      filteredNotifications[0] ||
      notifications[0] ||
      null
    );
  }, [notifications, selectedNotificationId, filteredNotifications]);

  // Update selected if filter leaves current selection out
  useEffect(() => {
    if (filteredNotifications.length > 0 && !filteredNotifications.some((n) => n.id === selectedNotificationId)) {
      setSelectedNotificationId(filteredNotifications[0].id);
    }
  }, [filteredNotifications, selectedNotificationId]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const getNotificationIcon = (type: ESignNotificationType) => {
    switch (type) {
      case 'SIGNATURE_REQUIRED':
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileSignature className="w-4 h-4" />
          </div>
        );
      case 'CONSENT_REQUEST':
        return (
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'DOCUMENT_SIGNED':
        return (
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'VERIFICATION_COMPLETED':
        return (
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'ADDITIONAL_AUTH_REQUEST':
        return (
          <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      case 'DOCUMENT_EXPIRED':
        return (
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  const getNotificationBadgeLabel = (type: ESignNotificationType) => {
    switch (type) {
      case 'SIGNATURE_REQUIRED':
        return 'Signature Required';
      case 'CONSENT_REQUEST':
        return 'Consent Request';
      case 'DOCUMENT_SIGNED':
        return 'Signed & Recorded';
      case 'VERIFICATION_COMPLETED':
        return 'Verification Completed';
      case 'ADDITIONAL_AUTH_REQUEST':
        return 'Authorization Request';
      case 'DOCUMENT_EXPIRED':
        return 'Expired Document';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-xl font-black text-ink uppercase tracking-tight">
              E-Sign Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-ink-soft">
            Stay updated on document requests, signature acknowledgements, and verification status.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 text-primary" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* 2. TWO-PANEL NOTIFICATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT PANEL: NOTIFICATION CARDS LIST (~35-40% desktop) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-border/70">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter('ACTION')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                filter === 'ACTION'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
            >
              Action Required
            </button>
          </div>

          {/* Notification Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-soft space-y-2 border border-dashed border-border rounded-2xl p-4">
                <Bell className="w-8 h-8 text-ink-soft/40 mx-auto" />
                <p>No {filter.toLowerCase()} notifications found.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isSelected = selectedNotification?.id === notif.id;

                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotificationId(notif.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-elegant ring-1 ring-primary/30'
                        : !notif.isRead
                        ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-alt/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getNotificationIcon(notif.type)}
                        <div className="min-w-0">
                          {notif.companyName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft border border-border truncate block w-fit">
                              {notif.companyName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Unread" />
                        )}
                        <span className="text-[10px] text-ink-soft font-mono">{notif.date}</span>
                      </div>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                        isSelected ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-ink-soft line-clamp-2 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: SELECTED NOTIFICATION DETAILS (~60-65% desktop) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 flex flex-col min-h-[580px]">
          {selectedNotification ? (
            <>
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-border gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {getNotificationIcon(selectedNotification.type)}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedNotification.companyName && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {selectedNotification.companyName}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-surface-alt text-ink-soft border border-border">
                        {getNotificationBadgeLabel(selectedNotification.type)}
                      </span>
                      {!selectedNotification.isRead ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Unread
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Read
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-ink pt-1 leading-snug">
                      {selectedNotification.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-ink-soft font-medium pt-0.5">
                      <span>{selectedNotification.date}</span>
                      <span>•</span>
                      <span>{selectedNotification.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(selectedNotification.id)}
                    className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    {selectedNotification.isRead ? 'Mark as unread' : 'Mark as read'}
                  </button>
                </div>
              </div>

              {/* Message Details Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-alt/40 border border-border/80 space-y-4 text-xs text-ink leading-relaxed">
                <div className="space-y-2">
                  <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-ink-soft">
                    Notification Message
                  </h4>
                  <p className="text-xs sm:text-sm text-ink/90 leading-relaxed font-sans">
                    {selectedNotification.description}
                  </p>
                </div>

                {selectedNotification.relatedDocumentId && (
                  <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-ink block truncate">
                          Associated Document Reference
                        </span>
                        <span className="text-[10px] text-ink-soft font-mono">
                          ID: {selectedNotification.relatedDocumentId}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-ink-soft text-[11.5px]">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Official electronic notification issued by LetGetIn E-Sign and Authorized Partners under secure cryptographic validation.
                  </span>
                </div>
              </div>

              {/* Bottom Information Footer */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Received {selectedNotification.date} at {selectedNotification.time}</span>
                </span>
                <span className="text-[11px] font-medium bg-surface-alt px-2.5 py-1 rounded-full border border-border">
                  Status: {selectedNotification.isRead ? 'Acknowledged' : 'Awaiting Review'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-ink-soft space-y-3">
              <Bell className="w-12 h-12 text-ink-soft/40" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-ink">Select a notification</h4>
                <p className="text-xs">Click on any notification card on the left to view full details and actions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
