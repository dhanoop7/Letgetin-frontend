"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  LayoutGrid,
  Columns3,
  CalendarDays,
} from "lucide-react";
import {
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";

interface BordioTopBarProps {
  onOpenCreateModal: (type: "task" | "event") => void;
  dateRangeText: string;
  onPrevDate: () => void;
  onNextDate: () => void;
  onToday: () => void;
}

export function BordioTopBar({
  onOpenCreateModal,
  dateRangeText,
  onPrevDate,
  onNextDate,
  onToday,
}: BordioTopBarProps) {
  const {
    items,
    waitingListOpen,
    toggleWaitingList,
    viewMode,
    setViewMode,
    selectedProjectId,
    setSelectedProjectId,
    selectedPriority,
    setSelectedPriority,
    hideCompleted,
    setHideCompleted,
    searchQuery,
    setSearchQuery,
  } = useBordioStore();

  const waitingCount = items.filter((i) => i.date === null).length;

  // Calculate total weekly planned time
  const totalWeeklyMinutes = items
    .filter((i) => i.date !== null)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);
  const weeklyHours = Math.floor(totalWeeklyMinutes / 60);
  const weeklyMins = totalWeeklyMinutes % 60;
  const capacityPercent = Math.min(100, Math.round((totalWeeklyMinutes / (40 * 60)) * 100));

  return (
    <header className="p-3 sm:p-4 bg-surface border-b border-border flex flex-col gap-3 shrink-0 select-none">
      {/* Row 1: Date Navigation, View Modes, and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Waiting List Toggle & Date Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={toggleWaitingList}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              waitingListOpen
                ? "bg-primary/15 text-primary-glow border-primary/30 shadow-xs"
                : "bg-surface border-border text-ink-soft hover:text-ink hover:bg-surface-alt"
            }`}
            title="Toggle Waiting List (Backlog)"
          >
            <Inbox className="w-3.5 h-3.5 text-primary-glow" />
            <span className="hidden sm:inline">Waiting List</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary-glow">
              {waitingCount}
            </span>
          </button>

          {/* Date Picker Range Controls */}
          <div className="flex items-center gap-1 bg-surface-alt/70 p-1 rounded-2xl border border-border">
            <button
              type="button"
              onClick={onPrevDate}
              className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-surface transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToday}
              className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-ink hover:bg-surface transition cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={onNextDate}
              className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-surface transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-black text-ink px-2 tracking-tight">
              {dateRangeText}
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Week, Day, Month, Board) */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-alt/80 border border-border">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "week"
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Week</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "day"
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Day</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "board"
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
        </div>

        {/* Right: Workload Meter & Create Buttons */}
        <div className="flex items-center gap-2">
          {/* Weekly Workload Bar */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface-alt/50 border border-border text-[11px]">
            <Clock className="w-3.5 h-3.5 text-primary-glow" />
            <span className="font-semibold text-ink">
              {weeklyHours}h {weeklyMins}m / 40h
            </span>
            <div className="w-16 h-1.5 rounded-full bg-surface-alt overflow-hidden border border-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenCreateModal("task")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCreateModal("event")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-500" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Row 2: Search, Filters & Toggles */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap flex-1 max-w-2xl">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, meetings, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-alt border border-border text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-surface-alt border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
          >
            <option value="all">All Projects</option>
            {DEFAULT_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-surface-alt border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>

        {/* Hide Completed Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-soft hover:text-ink select-none">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5"
          />
          <span>Hide completed</span>
        </label>
      </div>
    </header>
  );
}
