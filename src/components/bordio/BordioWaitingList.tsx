"use client";

import React, { useState } from "react";
import {
  Inbox,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  BordioItem,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";

export function BordioWaitingList() {
  const {
    items,
    waitingListOpen,
    toggleWaitingList,
    addItem,
    toggleItemDone,
    moveItemDate,
    setActiveItemId,
  } = useBordioStore();

  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("recruitment");
  const [selectedDuration, setSelectedDuration] = useState(45);

  const waitingItems = items.filter((item) => item.date === null);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addItem({
      type: "task",
      title: newTitle.trim(),
      date: null, // Waiting list
      durationMinutes: selectedDuration,
      status: "todo",
      priority: "medium",
      projectId: selectedProjectId,
      assignee: { name: "You" },
      subtasks: [],
    });

    setNewTitle("");
    setIsAdding(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      moveItemDate(itemId, null);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  if (!waitingListOpen) {
    return (
      <button
        type="button"
        onClick={toggleWaitingList}
        className="hidden lg:flex flex-col items-center gap-2 py-4 px-2 bg-surface border-r border-border hover:bg-surface-alt transition text-ink-soft hover:text-ink cursor-pointer select-none"
        title="Open Waiting List (Backlog)"
      >
        <Inbox className="w-5 h-5 text-primary-glow" />
        <span
          className="text-[11px] font-bold tracking-wider uppercase text-center"
          style={{ writingMode: "vertical-rl" }}
        >
          Waiting List
        </span>
        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-glow text-[10px] font-bold flex items-center justify-center">
          {waitingItems.length}
        </span>
      </button>
    );
  }

  return (
    <aside
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-72 sm:w-80 shrink-0 bg-surface border-r border-border flex flex-col h-full select-none transition-all duration-300"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-ink tracking-tight">
                Waiting List
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/15 text-primary-glow border border-primary/25">
                {waitingItems.length}
              </span>
            </div>
            <p className="text-[10px] text-ink-soft leading-none mt-0.5">
              Drag tasks directly onto calendar
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleWaitingList}
          className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
          title="Collapse Waiting List"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Form Trigger */}
      <div className="p-3 border-b border-border/80">
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-border hover:border-primary/50 bg-surface-alt/40 hover:bg-surface-alt text-xs font-semibold text-ink-soft hover:text-ink flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-primary-glow" />
            <span>Add Unscheduled Task</span>
          </button>
        ) : (
          <form onSubmit={handleQuickAdd} className="space-y-2.5">
            <input
              type="text"
              autoFocus
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
            />

            <div className="flex items-center gap-2">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-surface-alt border border-border text-[11px] text-ink focus:outline-none focus:border-primary"
              >
                {DEFAULT_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                className="w-20 px-2 py-1.5 rounded-lg bg-surface-alt border border-border text-[11px] text-ink focus:outline-none focus:border-primary"
              >
                <option value={15}>15m</option>
                <option value={30}>30m</option>
                <option value={45}>45m</option>
                <option value={60}>1h</option>
                <option value={90}>1.5h</option>
                <option value={120}>2h</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 rounded-lg text-xs text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {waitingItems.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-ink-soft border border-dashed border-border/70 rounded-2xl">
            <Inbox className="w-8 h-8 text-ink-soft/40 mb-2" />
            <span className="text-xs font-semibold text-ink">
              Waiting list is empty
            </span>
            <span className="text-[10px] mt-1 max-w-[180px]">
              Add backlog items or drag tasks from the calendar here to unschedule them.
            </span>
          </div>
        ) : (
          waitingItems.map((item) => {
            const project =
              DEFAULT_PROJECTS.find((p) => p.id === item.projectId) ||
              DEFAULT_PROJECTS[0];
            const isDone = item.status === "done";

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => setActiveItemId(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing group hover:shadow-md ${
                  isDone
                    ? "bg-surface-alt/30 border-border/60 opacity-65"
                    : "bg-surface border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemDone(item.id);
                    }}
                    className="mt-0.5 text-ink-soft hover:text-primary transition shrink-0 cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-ink-soft hover:text-primary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-semibold leading-snug break-words ${
                        isDone ? "line-through text-ink-soft" : "text-ink"
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Metadata Badges */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-2">
                      {/* Project Pill */}
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${project.badgeBg} ${project.badgeText}`}
                      >
                        {project.name}
                      </span>

                      {/* Duration */}
                      <span className="inline-flex items-center gap-1 text-[10px] text-ink-soft font-medium bg-surface-alt px-1.5 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-ink-soft" />
                        <span>{item.durationMinutes}m</span>
                      </span>

                      {/* Subtasks Count */}
                      {item.subtasks.length > 0 && (
                        <span className="text-[10px] text-ink-soft bg-surface-alt px-1.5 py-0.5 rounded-md font-medium">
                          ✓{" "}
                          {
                            item.subtasks.filter((st) => st.completed).length
                          }
                          /{item.subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <GripVertical className="w-3.5 h-3.5 text-ink-soft/40 group-hover:text-ink-soft shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
