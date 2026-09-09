"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  Users,
  Calendar as CalendarIcon,
  X,
  Filter,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Coffee,
  ChevronDown,
} from "lucide-react";

export type EventCategory =
  | "shift"
  | "meeting"
  | "deadline"
  | "training"
  | "holiday";

export interface WorkforceEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  department: string;
  locationOrLink?: string;
  isVirtual: boolean;
  attendees: { name: string; avatar?: string }[];
  description?: string;
}

const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; badgeBg: string; badgeText: string; dotColor: string }
> = {
  shift: {
    label: "Team Shift",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  meeting: {
    label: "All-Hands / Meeting",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  deadline: {
    label: "Sprint / Deadline",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  training: {
    label: "Workforce Training",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  holiday: {
    label: "Holiday / Off",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
};

const INITIAL_EVENTS: WorkforceEvent[] = [
  {
    id: "evt-1",
    title: "Engineering Sprint 24 Planning",
    category: "deadline",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    department: "Engineering",
    locationOrLink: "https://meet.google.com/sprint-plan",
    isVirtual: true,
    attendees: [{ name: "Alex R." }, { name: "David K." }, { name: "Elena R." }],
    description: "Bi-weekly sprint backlog grooming and velocity commitments.",
  },
  {
    id: "evt-2",
    title: "Quarterly Company Town Hall & AMA",
    category: "meeting",
    date: new Date().toISOString().slice(0, 10),
    startTime: "03:00 PM",
    endTime: "04:30 PM",
    department: "All Hands",
    locationOrLink: "Main Auditorium & Zoom Live Stream",
    isVirtual: true,
    attendees: [{ name: "Leadership Team" }, { name: "All Staff" }],
    description: "CEO state of the union, Q3 growth metrics, and open executive Q&A.",
  },
  {
    id: "evt-3",
    title: "Core Support Morning Shift",
    category: "shift",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    startTime: "08:00 AM",
    endTime: "04:00 PM",
    department: "Customer Success",
    locationOrLink: "Floor 3 - Support Pod B",
    isVirtual: false,
    attendees: [{ name: "Marcus V." }, { name: "Maya L." }],
    description: "Tier 1 and Tier 2 candidate resolution coverage.",
  },
  {
    id: "evt-4",
    title: "AI Recruiter Agent Masterclass",
    category: "training",
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    department: "Talent Acquisition",
    locationOrLink: "https://letgetin.com/training/ai-agent-101",
    isVirtual: true,
    attendees: [{ name: "Recruiting Team" }],
    description: "Hands-on workshop on training digital twin employees for high-speed sourcing.",
  },
  {
    id: "evt-5",
    title: "Global Diversity & Inclusion Day",
    category: "holiday",
    date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    startTime: "All Day",
    endTime: "All Day",
    department: "Company Wide",
    isVirtual: false,
    attendees: [{ name: "All Employees" }],
    description: "Official optional wellness and company observance day.",
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WorkforceCalendarPage() {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(today.toISOString().slice(0, 10));
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [events, setEvents] = useState<WorkforceEvent[]>(INITIAL_EVENTS);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<EventCategory>("meeting");
  const [formDate, setFormDate] = useState(today.toISOString().slice(0, 10));
  const [formStartTime, setFormStartTime] = useState("10:00 AM");
  const [formEndTime, setFormEndTime] = useState("11:00 AM");
  const [formDepartment, setFormDepartment] = useState("Engineering");
  const [formLocation, setFormLocation] = useState("");
  const [formIsVirtual, setFormIsVirtual] = useState(true);
  const [formDesc, setFormDesc] = useState("");

  const changeCalendarMonth = (delta: number) => {
    let m = calendarMonth + delta;
    let y = calendarYear;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setCalendarMonth(m);
    setCalendarYear(y);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      return true;
    });
  }, [events, categoryFilter]);

  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInCalendarMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = calendarMonth === 0 ? 12 : calendarMonth;
      const y = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInCalendarMonth; d++) {
      const m = calendarMonth + 1;
      const dateStr = `${calendarYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = calendarMonth === 11 ? 1 : calendarMonth + 2;
      const y = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }
    return cells;
  }, [calendarYear, calendarMonth, firstDayOfWeek, daysInCalendarMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, WorkforceEvent[]>();
    for (const item of filteredEvents) {
      const list = map.get(item.date) || [];
      list.push(item);
      map.set(item.date, list);
    }
    return map;
  }, [filteredEvents]);

  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDateStr);
  }, [filteredEvents, selectedDateStr]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    const newEvt: WorkforceEvent = {
      id: `evt-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      department: formDepartment,
      locationOrLink: formLocation,
      isVirtual: formIsVirtual,
      attendees: [{ name: "Team Members" }],
      description: formDesc,
    };

    setEvents((prev) => [newEvt, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setFormTitle("");
    setFormLocation("");
    setFormDesc("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Workforce Calendar
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-primary-glow" />
              Company Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Track company-wide events, team shifts, sprint deliverables, and training workshops across your workforce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setFormDate(selectedDateStr);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Shift</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              categoryFilter === "all"
                ? "bg-gradient-brand text-primary-foreground shadow-xs"
                : "text-ink-soft hover:text-ink hover:bg-surface-alt border border-border"
            }`}
          >
            All Categories
          </button>

          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((catKey) => {
            const conf = CATEGORY_CONFIG[catKey];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === catKey
                    ? "bg-gradient-brand text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt border border-border"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${conf.dotColor}`} />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => changeCalendarMonth(-1)}
            className="p-1.5 rounded-xl hover:bg-surface-alt border border-border text-ink-soft hover:text-ink transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-ink min-w-[130px] text-center">
            {MONTH_NAMES[calendarMonth]} {calendarYear}
          </span>
          <button
            type="button"
            onClick={() => changeCalendarMonth(1)}
            className="p-1.5 rounded-xl hover:bg-surface-alt border border-border text-ink-soft hover:text-ink transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCalendarMonth(today.getMonth());
              setCalendarYear(today.getFullYear());
              setSelectedDateStr(today.toISOString().slice(0, 10));
            }}
            className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-surface-alt text-xs font-semibold text-ink transition cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar & Daily Agenda Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Month Grid (8 cols) */}
        <div className="lg:col-span-8 bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold text-ink-soft uppercase py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === today.toISOString().slice(0, 10);
              const dayEvents = eventsByDate.get(cell.dateStr) || [];

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-primary-glow bg-primary/5 ring-1 ring-primary-glow"
                      : cell.isCurrentMonth
                      ? "border-border bg-surface hover:border-primary/40 hover:bg-surface-alt/40"
                      : "border-border/40 bg-surface-alt/30 opacity-40 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-gradient-brand text-primary-foreground shadow-glow"
                          : isSelected
                          ? "text-primary-glow font-black"
                          : "text-ink"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-primary-glow bg-primary/10 px-1.5 py-0.2 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const conf = CATEGORY_CONFIG[evt.category];
                      return (
                        <div
                          key={evt.id}
                          className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md truncate border flex items-center gap-1 ${conf.badgeBg} ${conf.badgeText}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dotColor} shrink-0`} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-ink-soft font-bold pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-extrabold text-ink">
                {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <p className="text-[11px] text-ink-soft">
                {selectedDateEvents.length} workforce event{selectedDateEvents.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormDate(selectedDateStr);
                setIsAddModalOpen(true);
              }}
              className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-glow text-xs font-bold transition cursor-pointer"
              title="Add Event on Date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin pr-1">
            {selectedDateEvents.length === 0 ? (
              <div className="py-12 text-center text-ink-soft text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-ink-soft/40" />
                <p>No company events on this date.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFormDate(selectedDateStr);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs font-bold text-primary-glow hover:underline cursor-pointer"
                >
                  + Add Event or Shift
                </button>
              </div>
            ) : (
              selectedDateEvents.map((evt) => {
                const conf = CATEGORY_CONFIG[evt.category];
                return (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl border border-border bg-surface-alt/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${conf.badgeBg} ${conf.badgeText}`}>
                          {conf.label}
                        </span>
                        <h4 className="text-xs font-bold text-ink mt-1">{evt.title}</h4>
                      </div>
                      <span className="text-[10px] font-semibold text-ink-soft shrink-0">
                        {evt.startTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-ink-soft flex items-center gap-2">
                      <Clock className="w-3 h-3 text-ink-soft shrink-0" />
                      <span>{evt.startTime} - {evt.endTime}</span>
                      <span>•</span>
                      <span>{evt.department}</span>
                    </div>

                    {evt.locationOrLink && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/60">
                        <div className="flex items-center gap-1 text-ink truncate max-w-[170px]">
                          {evt.isVirtual ? (
                            <Video className="w-3 h-3 text-primary-glow shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 text-ink-soft shrink-0" />
                          )}
                          <span className="truncate">{evt.locationOrLink}</span>
                        </div>

                        {evt.isVirtual && evt.locationOrLink.startsWith("http") && (
                          <a
                            href={evt.locationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-primary-glow hover:underline inline-flex items-center gap-1"
                          >
                            <span>Join</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Add Workforce Event / Shift</h3>
                  <p className="text-[11px] text-ink-soft">Create an event on the workforce calendar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Q4 Strategy All-Hands"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  >
                    <option value="shift">Team Shift</option>
                    <option value="meeting">All-Hands / Meeting</option>
                    <option value="deadline">Sprint / Deadline</option>
                    <option value="training">Workforce Training</option>
                    <option value="holiday">Holiday / Off</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Engineering, All Hands"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Start Time</label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">End Time</label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Location or Virtual Link</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="https://meet.google.com/... or Room 402"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
