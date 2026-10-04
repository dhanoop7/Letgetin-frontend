'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Building2,
  CheckCircle2,
  Award,
  AlertCircle,
  Briefcase,
  ExternalLink,
  ChevronRight as ArrowIcon,
  Zap,
} from 'lucide-react';
import { ApplicationItem } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ApplicationsCalendarViewProps {
  applications: ApplicationItem[];
  onSelectApp: (app: ApplicationItem) => void;
  onTrackApp: (app: ApplicationItem) => void;
}

interface CalendarEvent {
  appId: string;
  application: ApplicationItem;
  dateStr: string; // YYYY-MM-DD
  type: 'applied' | 'deadline' | 'invited' | 'completed' | 'offered' | 'hired';
  title: string;
  badgeClass: string;
  dotColor: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function extractDateStr(val?: string | null): string | null {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // fallback
  }
  return null;
}

export function ApplicationsCalendarView({
  applications,
  onSelectApp,
  onTrackApp,
}: ApplicationsCalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Extract all real date events from applications
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    applications.forEach((app) => {
      const company = app.job?.company?.name || 'Company';
      const role = app.job?.title || 'Job Position';

      // 1. Applied Date
      const appliedDate = extractDateStr(app.appliedAt || app.createdAt);
      if (appliedDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: appliedDate,
          type: 'applied',
          title: `Applied: ${role} at ${company}`,
          badgeClass: 'bg-primary/10 text-primary border-primary/20',
          dotColor: 'bg-primary',
        });
      }

      // 2. Stage Deadline
      const deadlineDate = extractDateStr(app.stageDeadline);
      if (deadlineDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: deadlineDate,
          type: 'deadline',
          title: `Deadline: Stage evaluation for ${role}`,
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dotColor: 'bg-amber-500',
        });
      }

      // 3. Stage Invited
      const invitedDate = extractDateStr(app.invitedAt);
      if (invitedDate && invitedDate !== appliedDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: invitedDate,
          type: 'invited',
          title: `Interview / Stage Invited: ${role}`,
          badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          dotColor: 'bg-purple-500',
        });
      }

      // 4. Stage Completed
      const completedDate = extractDateStr(app.stageCompletedAt);
      if (completedDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: completedDate,
          type: 'completed',
          title: `Stage Completed: ${role}`,
          badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dotColor: 'bg-blue-500',
        });
      }

      // 5. Offer Extended
      const offerDate = extractDateStr(app.offeredAt);
      if (offerDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: offerDate,
          type: 'offered',
          title: `Job Offer Extended: ${role} at ${company}`,
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dotColor: 'bg-emerald-500',
        });
      }

      // 6. Hired Date
      const hiredDate = extractDateStr(app.hiredAt);
      if (hiredDate) {
        events.push({
          appId: app._id,
          application: app,
          dateStr: hiredDate,
          type: 'hired',
          title: `Hired & Confirmed: ${role} at ${company}`,
          badgeClass: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
          dotColor: 'bg-emerald-500',
        });
      }
    });

    return events;
  }, [applications]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month trailing
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: true });
    }

    // Next month leading
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [calendarYear, calendarMonth]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDateStr(todayStr);
  };

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    return allEvents.filter((ev) => ev.dateStr === selectedDateStr);
  }, [allEvents, selectedDateStr]);

  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  // Chronological upcoming & recent events
  const chronologicalEvents = useMemo(() => {
    return [...allEvents].sort((a, b) => b.dateStr.localeCompare(a.dateStr)).slice(0, 10);
  }, [allEvents]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </h2>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-alt border border-border hover:bg-surface text-ink transition cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-surface-alt border border-border hover:bg-surface text-ink transition cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-surface-alt border border-border hover:bg-surface text-ink transition cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink-soft py-1 border-b border-border/60">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = allEvents.filter((e) => e.dateStr === day.dateStr);
              const isSelected = day.dateStr === selectedDateStr;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={`${day.dateStr}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : isToday
                      ? 'border-primary/40 bg-surface-alt/80'
                      : day.isCurrentMonth
                      ? 'border-border/60 bg-surface hover:border-border hover:bg-surface-alt/40'
                      : 'border-border/30 bg-surface-alt/20 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold rounded-lg px-1.5 py-0.5 ${
                        isToday
                          ? 'bg-primary text-white'
                          : isSelected
                          ? 'text-primary font-black'
                          : 'text-ink'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Event Indicator dots/pills */}
                  <div className="space-y-1 w-full pt-1">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        className="text-[9.5px] font-semibold truncate px-1.5 py-0.5 rounded-md bg-surface-alt border border-border/60 flex items-center gap-1 text-ink"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.dotColor}`} />
                        <span className="truncate">{ev.type.toUpperCase()}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-ink-soft font-bold pl-1 block">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Day Agenda & Details */}
        <div className="bg-surface border border-border rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  Selected Date
                </div>
                <h3 className="text-sm sm:text-base font-bold text-ink mt-0.5">
                  {formattedSelectedDate}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {/* List of events on this day */}
            <div className="space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-ink-soft rounded-2xl border border-dashed border-border p-4 bg-surface-alt/20">
                  <CalendarIcon className="w-7 h-7 text-ink-soft/40 mx-auto" />
                  <p className="text-xs font-semibold text-ink">No scheduled events on this date</p>
                  <p className="text-[11px] text-ink-soft/80 max-w-xs mx-auto leading-relaxed">
                    Select a date on the calendar or submit applications to view scheduled interviews and assessment deadlines here.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((ev, i) => {
                  const candidateStatus = resolveCandidateStatus(ev.application);
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-surface-alt/60 border border-border/80 space-y-2.5 hover:border-primary-glow/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${ev.badgeClass}`}
                          >
                            {ev.type.toUpperCase()}
                          </span>
                          <h4 className="text-xs font-bold text-ink truncate mt-1">
                            {ev.application.job?.title || 'Job Position'}
                          </h4>
                          <p className="text-[11px] text-ink-soft truncate font-medium">
                            {ev.application.job?.company?.name || 'Company'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px]">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${candidateStatus.badgeClass}`}>
                          {candidateStatus.label}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onTrackApp(ev.application)}
                            className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary text-[10px] font-bold border border-primary/20 transition cursor-pointer"
                          >
                            Track
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectApp(ev.application)}
                            className="px-2 py-1 rounded-lg bg-surface border border-border hover:bg-surface-alt text-ink text-[10px] font-semibold transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Legend */}
          <div className="pt-4 border-t border-border/60">
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">
              Event Types
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-soft font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Applied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Deadline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Invited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Offer / Hired</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent & Upcoming Activity Feed */}
      {chronologicalEvents.length > 0 && (
        <div className="bg-surface border border-border rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-ink tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Application Milestones Schedule</span>
              </h3>
              <p className="text-xs text-ink-soft">
                Chronological list of all active deadlines and application dates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chronologicalEvents.map((ev, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedDateStr(ev.dateStr);
                  onSelectApp(ev.application);
                }}
                className="p-3.5 rounded-2xl bg-surface-alt/40 border border-border/80 hover:border-primary-glow/40 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ev.badgeClass}`}>
                    {ev.type.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-bold text-ink flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 text-ink-soft" />
                    {new Date(ev.dateStr).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-ink group-hover:text-primary transition truncate">
                    {ev.application.job?.title || 'Job Position'}
                  </h4>
                  <p className="text-[11px] text-ink-soft truncate font-medium">
                    {ev.application.job?.company?.name || 'Company'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
