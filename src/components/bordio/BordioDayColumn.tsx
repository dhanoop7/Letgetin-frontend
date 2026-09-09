"use client";

import React, { useState } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  BordioItem,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";
import { BordioItemCard } from "./BordioItemCard";

interface BordioDayColumnProps {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon"
  dayNum: string; // e.g. "07"
  isToday: boolean;
  onQuickAdd: (dateStr: string, type: "task" | "event") => void;
}

export function BordioDayColumn({
  dateStr,
  dayLabel,
  dayNum,
  isToday,
  onQuickAdd,
}: BordioDayColumnProps) {
  const { items, moveItemDate, hideCompleted, selectedProjectId, selectedPriority, searchQuery } =
    useBordioStore();

  const [isDragOver, setIsDragOver] = useState(false);

  // Filter items belonging to this date
  const dayItems = items.filter((item) => {
    if (item.date !== dateStr) return false;
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

  const events = dayItems.filter((item) => item.type === "event");
  const tasks = dayItems.filter((item) => item.type === "task");

  // Calculate workload in minutes
  const totalMinutes = dayItems.reduce((acc, item) => acc + (item.durationMinutes || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeString = `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : hours === 0 ? "0m" : ""}`;

  // Workload capacity bar (based on standard 8-hour workday = 480 minutes)
  const capacityPercent = Math.min(100, Math.round((totalMinutes / 480) * 100));
  const isOverloaded = totalMinutes > 480;
  const isHeavy = totalMinutes >= 360 && totalMinutes <= 480;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      moveItemDate(itemId, dateStr);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[240px] flex flex-col h-full bg-surface border rounded-3xl overflow-hidden transition-all duration-200 select-none ${
        isDragOver
          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
          : isToday
          ? "border-primary/50 shadow-sm"
          : "border-border"
      }`}
    >
      {/* Day Header */}
      <div
        className={`p-3.5 border-b transition-colors ${
          isToday
            ? "bg-primary/10 border-primary/25"
            : "bg-surface-alt/40 border-border/70"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-black tracking-tight ${
                isToday ? "text-primary-glow" : "text-ink"
              }`}
            >
              {dayLabel}
            </span>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                isToday
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "bg-surface text-ink-soft border border-border"
              }`}
            >
              {dayNum}
            </span>
          </div>

          <span className="text-[10px] font-bold text-ink-soft bg-surface px-2 py-0.5 rounded-full border border-border">
            {dayItems.length} {dayItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Workload / Estimated Time Capacity Bar (Bordio Signature) */}
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold">
            <span className="text-ink-soft flex items-center gap-1">
              <Clock className="w-3 h-3 text-ink-soft" />
              <span>{timeString} planned</span>
            </span>

            {isOverloaded ? (
              <span className="text-rose-500 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Overbooked</span>
              </span>
            ) : (
              <span className="text-ink-soft/70">8h cap</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface-alt overflow-hidden border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverloaded
                  ? "bg-rose-500"
                  : isHeavy
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* Events Block (Fixed time appointments) */}
        {events.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/70 px-1">
              Scheduled Events
            </div>
            {events.map((event) => (
              <BordioItemCard key={event.id} item={event} />
            ))}
          </div>
        )}

        {/* Tasks Block */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            {events.length > 0 && (
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/70 px-1 pt-1">
                Tasks To Do
              </div>
            )}
            {tasks.map((task) => (
              <BordioItemCard key={task.id} item={task} />
            ))}
          </div>
        )}

        {dayItems.length === 0 && (
          <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-ink-soft/60 border border-dashed border-border/50 rounded-2xl">
            <CalendarDays className="w-6 h-6 mb-1 text-ink-soft/30" />
            <span className="text-[11px] font-medium">No items scheduled</span>
            <span className="text-[9.5px] mt-0.5 text-ink-soft/50">
              Drag from Waiting List or click + below
            </span>
          </div>
        )}
      </div>

      {/* Column Footer: Quick Add Action Buttons */}
      <div className="p-2.5 border-t border-border/70 bg-surface-alt/30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onQuickAdd(dateStr, "task")}
          className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-border transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-primary-glow" />
          <span>Task</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickAdd(dateStr, "event")}
          className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-border transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-purple-500" />
          <span>Event</span>
        </button>
      </div>
    </div>
  );
}
