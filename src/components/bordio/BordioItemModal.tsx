"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Inbox,
  Tag,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  BordioItem,
  BordioItemType,
  BordioPriority,
  BordioStatus,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";

interface BordioItemModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BordioItemModal({
  itemId,
  isOpen,
  onClose,
}: BordioItemModalProps) {
  const {
    items,
    updateItem,
    deleteItem,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useBordioStore();

  const item = items.find((i) => i.id === itemId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<BordioItemType>("task");
  const [status, setStatus] = useState<BordioStatus>("todo");
  const [priority, setPriority] = useState<BordioPriority>("medium");
  const [projectId, setProjectId] = useState("recruitment");
  const [date, setDate] = useState<string | "waiting">("waiting");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("11:00 AM");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setType(item.type);
      setStatus(item.status);
      setPriority(item.priority);
      setProjectId(item.projectId);
      setDate(item.date || "waiting");
      setStartTime(item.startTime || "10:00 AM");
      setEndTime(item.endTime || "11:00 AM");
      setDurationMinutes(item.durationMinutes || 45);
      setMeetingLink(item.meetingLink || "");
      setLocation(item.location || "");
      setNewSubtaskTitle("");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateItem(item.id, {
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      priority,
      projectId,
      date: date === "waiting" ? null : date,
      startTime: type === "event" ? startTime : undefined,
      endTime: type === "event" ? endTime : undefined,
      durationMinutes: Number(durationMinutes),
      meetingLink: meetingLink.trim() || undefined,
      location: location.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(item.id);
      onClose();
    }
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(item.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const project =
    DEFAULT_PROJECTS.find((p) => p.id === projectId) || DEFAULT_PROJECTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          {/* Type Toggle: Task vs Event */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-alt border border-border/80">
            <button
              type="button"
              onClick={() => setType("task")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === "task"
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => setType("event")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === "event"
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Calendar Event
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin"
        >
          {/* Title Input */}
          <div className="space-y-1">
            <input
              type="text"
              required
              placeholder={
                type === "task"
                  ? "Task title (e.g. Screen resume batch)"
                  : "Event title (e.g. Technical Interview Round)"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base sm:text-lg font-bold text-ink bg-transparent border-b border-border/80 pb-2 focus:outline-none focus:border-primary placeholder:text-ink-soft/50"
            />
          </div>

          {/* Quick Schedule Grid: Date & Time/Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-alt/50 border border-border">
            {/* Scheduling Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-primary-glow" />
                <span>Date / Placement</span>
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
              >
                <option value="waiting">📥 Waiting List (Unscheduled)</option>
                <option value="2026-09-07">Mon, Sep 7, 2026</option>
                <option value="2026-09-08">Tue, Sep 8, 2026</option>
                <option value="2026-09-09">Wed, Sep 9, 2026 (Today)</option>
                <option value="2026-09-10">Thu, Sep 10, 2026</option>
                <option value="2026-09-11">Fri, Sep 11, 2026</option>
                <option value="2026-09-12">Sat, Sep 12, 2026</option>
                <option value="2026-09-13">Sun, Sep 13, 2026</option>
              </select>
            </div>

            {/* Time or Duration */}
            {type === "task" ? (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Estimated Duration</span>
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span>Meeting Time Slot</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="09:30 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl bg-surface border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
                  />
                  <span className="text-xs text-ink-soft">–</span>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl bg-surface border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Project Tag & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-soft">
                Project / Category
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
              >
                {DEFAULT_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-soft">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as BordioPriority)}
                className="w-full px-3 py-2 rounded-xl bg-surface-alt border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary capitalize"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
          </div>

          {/* Status (For Tasks) */}
          {type === "task" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-soft">Status</label>
              <div className="flex items-center gap-2">
                {(["todo", "in_progress", "done"] as BordioStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer capitalize ${
                      status === s
                        ? "bg-primary/15 text-primary-glow border-primary/40 shadow-xs"
                        : "bg-surface-alt/40 border-border text-ink-soft hover:text-ink"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event-Specific Fields: Virtual link & Location */}
          {type === "event" && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-surface-alt/40 border border-border">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Video Meeting Link (Google Meet / Zoom)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                  <span>Location / Auditorium</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium 1 / Boardroom B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Subtasks Checklist */}
          <div className="space-y-2 pt-1 border-t border-border/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Subtasks / Checklist</span>
              {item.subtasks.length > 0 && (
                <span className="text-[11px] font-semibold text-ink-soft">
                  {item.subtasks.filter((st) => st.completed).length} of{" "}
                  {item.subtasks.length} done
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {item.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-alt/50 border border-border group"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(item.id, st.id)}
                    className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-ink-soft shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        st.completed
                          ? "line-through text-ink-soft"
                          : "text-ink font-medium"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSubtask(item.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-ink-soft hover:text-rose-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add a step / checklist item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSub(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-surface-alt border border-border text-xs text-ink focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSub}
                className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Description Notes */}
          <div className="space-y-1 pt-1 border-t border-border/70">
            <label className="text-xs font-bold text-ink">Description & Notes</label>
            <textarea
              rows={3}
              placeholder="Add details, instructions, agenda, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-2xl bg-surface-alt border border-border text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:text-ink hover:bg-surface-alt transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
