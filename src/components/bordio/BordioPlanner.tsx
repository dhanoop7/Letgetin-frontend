"use client";

import React, { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { BordioTopBar } from "./BordioTopBar";
import { BordioWaitingList } from "./BordioWaitingList";
import { BordioDayColumn } from "./BordioDayColumn";
import { BordioItemModal } from "./BordioItemModal";
import {
  BordioItem,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { BordioItemCard } from "./BordioItemCard";
import {
  Plus,
  CheckCircle2,
  Clock,
  CalendarDays,
  Sparkles,
  Building2,
  Rocket,
  GraduationCap,
} from "lucide-react";

export interface BordioPlannerProps {
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  defaultView?: "week" | "day" | "month" | "board";
  moduleContext?: "company" | "startup" | "institution";
}

export function BordioPlanner({
  title,
  subtitle,
  badgeLabel,
  defaultView,
  moduleContext,
}: BordioPlannerProps = {}) {
  const {
    items,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    activeItemId,
    setActiveItemId,
    addItem,
    hideCompleted,
    selectedProjectId,
    selectedPriority,
    searchQuery,
    moveItemDate,
  } = useBordioStore();

  const { orgProfile } = useRecruiterStore();
  const activeEntity = moduleContext || orgProfile?.entity || "company";

  // If defaultView is passed, initialize on mount
  useEffect(() => {
    if (defaultView) {
      setViewMode(defaultView);
    }
  }, [defaultView, setViewMode]);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<"task" | "event">("task");
  const [createInitialDate, setCreateInitialDate] = useState<string | null>("2026-09-09");

  // Calculate the 7 days of the current viewed week (starting on Monday)
  const currentAnchor = new Date(selectedDate);
  const weekStart = startOfWeek(currentAnchor, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Date range formatted string
  const dateRangeText =
    viewMode === "day"
      ? format(currentAnchor, "EEEE, MMMM d, yyyy")
      : `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "MMM d, yyyy")}`;

  const handlePrevDate = () => {
    if (viewMode === "day") {
      const prev = subDays(currentAnchor, 1);
      setSelectedDate(format(prev, "yyyy-MM-dd"));
    } else {
      const prev = subDays(weekStart, 7);
      setSelectedDate(format(prev, "yyyy-MM-dd"));
    }
  };

  const handleNextDate = () => {
    if (viewMode === "day") {
      const next = addDays(currentAnchor, 1);
      setSelectedDate(format(next, "yyyy-MM-dd"));
    } else {
      const next = addDays(weekStart, 7);
      setSelectedDate(format(next, "yyyy-MM-dd"));
    }
  };

  const handleToday = () => {
    setSelectedDate("2026-09-09");
  };

  const handleOpenCreateModal = (type: "task" | "event", dateStr?: string) => {
    const newItem = addItem({
      type,
      title: type === "task" ? "New Task" : "New Meeting",
      date: dateStr !== undefined ? dateStr : "2026-09-09",
      durationMinutes: type === "task" ? 45 : 60,
      startTime: type === "event" ? "10:00 AM" : undefined,
      endTime: type === "event" ? "11:00 AM" : undefined,
      status: "todo",
      priority: "medium",
      projectId: "recruitment",
      assignee: { name: "You" },
      subtasks: [],
    });

    setActiveItemId(newItem.id);
  };

  // Filter items for Kanban / Board view
  const filteredItems = items.filter((item) => {
    if (hideCompleted && item.status === "done") return false;
    if (selectedProjectId !== "all" && item.projectId !== selectedProjectId) return false;
    if (selectedPriority !== "all" && item.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen bg-background overflow-hidden">
      {/* Bordio Entity & Page Header Banner */}
      <header className="px-4 py-2.5 sm:px-6 sm:py-3 bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 select-none">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary-glow border border-primary/25 text-[11px] font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              {badgeLabel || (activeEntity === "startup" ? "Startup Workspace" : activeEntity === "institution" ? "Institution Suite" : "Company Workforce")}
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-ink-soft bg-surface-alt px-2.5 py-0.5 rounded-full border border-border">
              {activeEntity === "startup" && <Rocket className="w-3 h-3 text-amber-500" />}
              {activeEntity === "institution" && <GraduationCap className="w-3 h-3 text-purple-500" />}
              {activeEntity === "company" && <Building2 className="w-3 h-3 text-blue-500" />}
              <span className="capitalize">{activeEntity} Mode</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight">
            {title || (activeEntity === "startup" ? "Startup Tasks & Calendar" : activeEntity === "institution" ? "Campus Drives & Schedule" : "Workforce Calendar & Tasks")}
          </h1>
          <p className="text-xs text-ink-soft line-clamp-1">
            {subtitle || "All-in-one daily/weekly schedule, task delegation, backlog waiting list, and capacity planner like Bordio.com."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-surface-alt border border-border text-ink-soft flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-ink text-[11px]">Bordio Planner</span>
          </div>
        </div>
      </header>

      {/* Bordio Top Bar */}
      <BordioTopBar
        dateRangeText={dateRangeText}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onOpenCreateModal={(type) => handleOpenCreateModal(type, selectedDate)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Waiting List Left Drawer (Backlog) */}
        <BordioWaitingList />

        {/* View Content */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-4 bg-background">
          {viewMode === "week" && (
            <div className="flex gap-3.5 h-full min-w-fit pb-1">
              {weekDays.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const dayLabel = format(d, "EEE");
                const dayNum = format(d, "dd");
                const isToday = dateStr === "2026-09-09";

                return (
                  <BordioDayColumn
                    key={dateStr}
                    dateStr={dateStr}
                    dayLabel={dayLabel}
                    dayNum={dayNum}
                    isToday={isToday}
                    onQuickAdd={(date, type) => handleOpenCreateModal(type, date)}
                  />
                );
              })}
            </div>
          )}

          {viewMode === "day" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <BordioDayColumn
                dateStr={selectedDate}
                dayLabel={format(currentAnchor, "EEEE")}
                dayNum={format(currentAnchor, "d")}
                isToday={selectedDate === "2026-09-09"}
                onQuickAdd={(date, type) => handleOpenCreateModal(type, date)}
              />
            </div>
          )}

          {viewMode === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-y-auto">
              {(["todo", "in_progress", "done"] as const).map((status) => {
                const colItems = filteredItems.filter((i) => i.status === status);
                const titles = {
                  todo: "To Do / Upcoming",
                  in_progress: "In Progress",
                  done: "Completed",
                };
                const badgeBgs = {
                  todo: "bg-slate-500/10 text-slate-500",
                  in_progress: "bg-blue-500/10 text-blue-500",
                  done: "bg-emerald-500/10 text-emerald-500",
                };

                return (
                  <div
                    key={status}
                    className="p-3.5 rounded-3xl bg-surface border border-border flex flex-col h-full space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/70">
                      <span className="text-xs font-bold text-ink">
                        {titles[status]}
                      </span>
                      <span
                        className={`text-[10.5px] font-black px-2 py-0.5 rounded-full ${badgeBgs[status]}`}
                      >
                        {colItems.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
                      {colItems.map((item) => (
                        <BordioItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Item Detail & Edit Modal */}
      <BordioItemModal
        itemId={activeItemId}
        isOpen={activeItemId !== null}
        onClose={() => setActiveItemId(null)}
      />
    </div>
  );
}
