"use client";

import React from "react";
import {
  Clock,
  Video,
} from "lucide-react";
import {
  CalendarItem,
  CalendarColorTheme,
  DEFAULT_PROJECTS,
  useCalendarStore,
} from "@/features/recruiter/store/useCalendarStore";

interface CalendarItemCardProps {
  item: CalendarItem;
}

const THEME_STYLES: Record<
  CalendarColorTheme,
  {
    bg: string;
    border: string;
    text: string;
    hover: string;
    durationColor: string;
  }
> = {
  green: {
    bg: "bg-[#1c4d36]",
    border: "border-[#276749]/60",
    text: "text-white",
    hover: "hover:bg-[#225e42]",
    durationColor: "text-emerald-200/80",
  },
  teal: {
    bg: "bg-[#0c576d]",
    border: "border-[#12718e]/60",
    text: "text-white",
    hover: "hover:bg-[#106b86]",
    durationColor: "text-cyan-200/80",
  },
  blue: {
    bg: "bg-[#184e85]",
    border: "border-[#2268b0]/60",
    text: "text-white",
    hover: "hover:bg-[#1e5d9e]",
    durationColor: "text-blue-200/80",
  },
  slate: {
    bg: "bg-[#222831]",
    border: "border-[#393e46]/60",
    text: "text-white",
    hover: "hover:bg-[#2b333e]",
    durationColor: "text-slate-300/80",
  },
};

export function CalendarItemCard({ item }: CalendarItemCardProps) {
  const { toggleItemDone, setActiveItemId } = useCalendarStore();

  let themeKey: CalendarColorTheme = item.themeColor || "teal";
  if (!item.themeColor) {
    if (item.projectId === "growth" || item.projectId === "engineering") {
      themeKey = "blue";
    } else if (item.projectId === "ops" || item.projectId === "campus") {
      themeKey = "green";
    } else {
      themeKey = "teal";
    }
  }

  const theme = THEME_STYLES[themeKey];
  const isDone = item.status === "done";
  const isEvent = item.type === "event";

  const hours = Math.floor((item.durationMinutes || 30) / 60);
  const mins = (item.durationMinutes || 30) % 60;
  const durationText = `${hours}:${mins < 10 ? `0${mins}` : mins}h`;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setActiveItemId(item.id)}
      className={`p-3 rounded-2xl border ${theme.bg} ${theme.border} ${theme.hover} transition-all duration-150 cursor-grab active:cursor-grabbing group shadow-sm flex flex-col justify-between select-none ${
        isDone ? "opacity-60 saturate-50" : ""
      }`}
    >
      {/* Title with Emoji or Icon */}
      <div className="flex items-start gap-1.5">
        {item.iconEmoji ? (
          <span className="text-[13px] leading-tight shrink-0 select-none">
            {item.iconEmoji}
          </span>
        ) : isEvent ? (
          <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-90" />
        ) : null}

        <h4 className={`text-[12px] font-semibold leading-snug tracking-tight ${theme.text} flex-1`}>
          {item.title}
        </h4>
      </div>

      {/* Sub-row: Duration and event time / meeting tag */}
      <div className="flex items-center justify-between gap-1 pt-1.5 text-[11px] font-mono">
        <span className={theme.durationColor}>{durationText}</span>

        {isEvent && item.startTime && (
          <span className="text-[10px] font-sans bg-black/20 px-1.5 py-0.5 rounded-md text-white/90">
            {item.startTime} {item.endTime ? `– ${item.endTime}` : ""}
          </span>
        )}

        {item.meetingLink && (
          <span className="text-[9.5px] font-sans font-bold bg-white/20 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
            <Video className="w-2.5 h-2.5" />
            <span>Join</span>
          </span>
        )}
      </div>
    </div>
  );
}
