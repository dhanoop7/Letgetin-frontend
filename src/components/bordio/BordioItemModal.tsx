"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Repeat,
  ChevronDown,
  UserPlus,
  Trash2,
  Check,
  Star,
  Sparkles,
} from "lucide-react";
import {
  BordioItem,
  BordioItemType,
  BordioPriority,
  BordioStatus,
  BordioColorTheme,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";

interface BordioItemModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultType?: "task" | "event";
}

export function BordioItemModal({
  itemId,
  isOpen,
  onClose,
  defaultDate = "2026-09-10",
  defaultType = "event",
}: BordioItemModalProps) {
  const { items, updateItem, deleteItem, addItem } = useBordioStore();
  const { orgProfile } = useRecruiterStore();

  const currentItem = itemId ? items.find((i) => i.id === itemId) : null;
  const isEditing = !!currentItem;

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<BordioItemType>(defaultType);
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:00");
  const [locationType, setLocationType] = useState("Location");
  const [locationValue, setLocationValue] = useState("");
  const [agenda, setAgenda] = useState("");
  const [workspace, setWorkspace] = useState("Personal Workspace");
  const [eventType, setEventType] = useState("Meeting");
  const [repeats, setRepeats] = useState(false);
  const [themeColor, setThemeColor] = useState<BordioColorTheme>("teal");
  const [participants, setParticipants] = useState<string[]>(["Me"]);
  const [newParticipantInput, setNewParticipantInput] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // Sync state when modal opens or item changes
  useEffect(() => {
    if (currentItem) {
      setTitle(currentItem.title || "");
      setType(currentItem.type || "event");
      setDate(currentItem.date || defaultDate);
      setStartTime(currentItem.startTime || "11:00");
      setEndTime(currentItem.endTime || "12:00");
      setLocationValue(currentItem.location || currentItem.meetingLink || "");
      setAgenda(currentItem.description || "");
      setWorkspace(currentItem.workspaceName || (orgProfile?.name ? `${orgProfile.name} Workspace` : "Personal Workspace"));
      setThemeColor(currentItem.themeColor || "teal");
      setRepeats(!!currentItem.repeats);
      if (currentItem.participants?.length) {
        setParticipants(currentItem.participants.map((p) => p.name));
      } else {
        setParticipants(["Me"]);
      }
    } else {
      setTitle("");
      setType(defaultType);
      setDate(defaultDate);
      setStartTime("11:00");
      setEndTime("12:00");
      setLocationValue("");
      setAgenda("");
      setWorkspace(orgProfile?.name ? `${orgProfile.name} Workspace` : "Personal Workspace");
      setEventType("Meeting");
      setThemeColor("teal");
      setRepeats(false);
      setParticipants(["Me"]);
    }
  }, [currentItem, isOpen, defaultDate, defaultType, orgProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && itemId) {
      updateItem(itemId, {
        title: title.trim(),
        type,
        date: date || null,
        startTime,
        endTime,
        location: locationValue,
        description: agenda,
        workspaceName: workspace,
        themeColor,
        repeats,
        participants: participants.map((name) => ({ name, isMe: name === "Me" })),
      });
    } else {
      addItem({
        title: title.trim(),
        type,
        date: date || null,
        startTime,
        endTime,
        durationMinutes: 60,
        status: "todo",
        priority: "medium",
        projectId: "recruitment",
        themeColor,
        iconEmoji: type === "event" ? "📅" : "📝",
        location: locationValue,
        description: agenda,
        workspaceName: workspace,
        repeats,
        participants: participants.map((name) => ({ name, isMe: name === "Me" })),
        assignee: { name: "Me" },
        subtasks: [],
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (itemId) {
      deleteItem(itemId);
      onClose();
    }
  };

  const handleAddParticipant = () => {
    if (newParticipantInput.trim()) {
      setParticipants([...participants, newParticipantInput.trim()]);
      setNewParticipantInput("");
      setShowAddParticipant(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-2xl bg-[#1e2227] border border-[#2e333d] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (Matching Screenshot 1) */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2b3039]">
          <h2 className="text-lg font-black text-white tracking-tight">
            {isEditing ? (type === "event" ? "Edit event" : "Edit task") : type === "event" ? "Create event" : "Create task"}
          </h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRepeats(!repeats)}
              className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition cursor-pointer ${
                repeats
                  ? "bg-[#0091ff]/20 text-[#0091ff]"
                  : "text-ink-soft hover:text-ink hover:bg-[#282d36]"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{repeats ? "Repeats active" : "Set repeats"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-ink-soft hover:text-ink hover:bg-[#282d36] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Left Form & Right Meta Column */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column (Primary Inputs) */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* Date & Time Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date button / pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#262b32] border border-[#353c47] text-xs font-bold text-ink">
                <CalendarIcon className="w-3.5 h-3.5 text-ink-soft" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                />
              </div>

              {/* Time Range */}
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#262b32] border border-[#353c47] text-xs font-mono text-white focus:outline-none focus:border-[#0091ff]"
                />
                <span className="text-ink-soft font-bold">–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#262b32] border border-[#353c47] text-xs font-mono text-white focus:outline-none focus:border-[#0091ff]"
                />
              </div>
            </div>

            {/* Event Name Input with blue focus border */}
            <div className="space-y-1">
              <input
                type="text"
                required
                autoFocus
                placeholder={type === "event" ? "Event name" : "Task name"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#262b32] border border-[#353c47] text-sm text-white placeholder:text-ink-soft/60 focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff]"
              />
            </div>

            {/* Location Row with Dropdown & Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#262b32] border border-[#353c47] text-xs font-semibold text-ink-soft shrink-0">
                <MapPin className="w-3.5 h-3.5 text-ink-soft" />
                <span>Location</span>
                <ChevronDown className="w-3 h-3 text-ink-soft/60" />
              </div>

              <input
                type="text"
                placeholder="Event location or Google Meet link"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#262b32] border border-[#353c47] text-xs text-white placeholder:text-ink-soft/60 focus:outline-none focus:border-[#0091ff]"
              />
            </div>

            {/* Event Agenda / Description Textarea */}
            <div className="space-y-1">
              <textarea
                rows={5}
                placeholder="Event agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#262b32] border border-[#353c47] text-xs text-white placeholder:text-ink-soft/60 focus:outline-none focus:border-[#0091ff] resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Actions Row: Cancel & Create event */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2b3039]">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0091ff] hover:bg-[#007fe0] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {isEditing ? "Save changes" : type === "event" ? "Create event" : "Create task"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Meta matching Screenshot 1) */}
          <div className="w-full md:w-56 bg-[#181a1f] border-t md:border-t-0 md:border-l border-[#2b3039] p-5 space-y-5 text-xs">
            {/* Create in (Workspace) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-ink-soft/70">Create in</span>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#242931] border border-[#313743]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                  {workspace.charAt(0)}
                </div>
                <span className="font-semibold text-white truncate text-xs">
                  {workspace}
                </span>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-ink-soft/70">Type</span>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#242931] border border-[#313743]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none w-full cursor-pointer"
                >
                  <option value="Meeting" className="bg-[#1e2227]">Meeting</option>
                  <option value="Placement Drive" className="bg-[#1e2227]">Placement Drive</option>
                  <option value="Candidate Screen" className="bg-[#1e2227]">Candidate Screen</option>
                  <option value="Sprint Review" className="bg-[#1e2227]">Sprint Review</option>
                  <option value="Personal Task" className="bg-[#1e2227]">Personal Task</option>
                </select>
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-ink-soft/70">Card Color</span>
              <div className="flex items-center gap-2">
                {[
                  { key: "green", bg: "bg-[#1c4d36]" },
                  { key: "teal", bg: "bg-[#0c576d]" },
                  { key: "blue", bg: "bg-[#184e85]" },
                  { key: "slate", bg: "bg-[#222831]" },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setThemeColor(c.key as BordioColorTheme)}
                    className={`w-6 h-6 rounded-lg ${c.bg} border transition flex items-center justify-center cursor-pointer ${
                      themeColor === c.key ? "border-white ring-2 ring-white/30" : "border-transparent"
                    }`}
                  >
                    {themeColor === c.key && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-ink-soft/70">Participants</span>

              <div className="space-y-1.5">
                {participants.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                        {p.charAt(0)}
                      </div>
                      {p === "Me" && (
                        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-[#0091ff] flex items-center justify-center">
                          <Star className="w-2 h-2 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-white text-xs">{p}</span>
                  </div>
                ))}
              </div>

              {showAddParticipant ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newParticipantInput}
                    onChange={(e) => setNewParticipantInput(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-[#242931] border border-[#313743] text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="px-2 py-1 bg-[#0091ff] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddParticipant(true)}
                  className="text-xs font-semibold text-ink-soft hover:text-white flex items-center gap-1 transition cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0091ff]" />
                  <span>Add participants</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
