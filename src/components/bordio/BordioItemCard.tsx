"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  GripVertical,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  BordioItem,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";

interface BordioItemCardProps {
  item: BordioItem;
}

export function BordioItemCard({ item }: BordioItemCardProps) {
  const { toggleItemDone, setActiveItemId } = useBordioStore();

  const project =
    DEFAULT_PROJECTS.find((p) => p.id === item.projectId) || DEFAULT_PROJECTS[0];
  const isDone = item.status === "done";
  const isEvent = item.type === "event";

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  if (isEvent) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => setActiveItemId(item.id)}
        className="p-3 rounded-2xl border border-border/80 bg-surface-alt/40 hover:bg-surface-alt hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group shadow-2xs space-y-2 relative overflow-hidden"
      >
        {/* Left Color Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: project.color }}
        />

        <div className="pl-1">
          {/* Time & Meeting Indicator */}
          <div className="flex items-center justify-between gap-1 text-[10.5px]">
            <span className="font-extrabold text-primary-glow flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {item.startTime} {item.endTime ? `– ${item.endTime}` : ""}
              </span>
            </span>

            {item.meetingLink && (
              <a
                href={item.meetingLink}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[9.5px] font-bold text-primary-glow hover:underline bg-primary/10 px-1.5 py-0.5 rounded-md"
              >
                <Video className="w-3 h-3" />
                <span>Join</span>
              </a>
            )}
          </div>

          <h4 className="text-xs font-bold text-ink leading-snug mt-1 group-hover:text-primary-glow transition-colors">
            {item.title}
          </h4>

          {item.location && (
            <div className="flex items-center gap-1 text-[10px] text-ink-soft mt-1">
              <MapPin className="w-3 h-3 text-ink-soft" />
              <span className="truncate">{item.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 mt-1">
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${project.badgeBg} ${project.badgeText}`}
            >
              {project.name}
            </span>

            <span className="text-[10px] text-ink-soft truncate max-w-[100px]">
              {item.assignee.name}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Task Card
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setActiveItemId(item.id)}
      className={`p-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing group hover:shadow-md ${
        isDone
          ? "bg-surface-alt/30 border-border/60 opacity-60"
          : "bg-surface border-border hover:border-primary/40 shadow-2xs"
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
            className={`text-xs font-semibold leading-snug break-words group-hover:text-ink transition-colors ${
              isDone ? "line-through text-ink-soft" : "text-ink"
            }`}
          >
            {item.title}
          </h4>

          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            {/* Project Tag */}
            <span
              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${project.badgeBg} ${project.badgeText}`}
            >
              {project.name}
            </span>

            {/* Duration Tag */}
            <span className="inline-flex items-center gap-1 text-[10px] text-ink-soft font-medium bg-surface-alt px-1.5 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-ink-soft" />
              <span>{item.durationMinutes}m</span>
            </span>

            {/* Subtasks Count */}
            {item.subtasks.length > 0 && (
              <span className="text-[10px] text-ink-soft bg-surface-alt px-1.5 py-0.5 rounded-md font-medium">
                ✓ {item.subtasks.filter((st) => st.completed).length}/
                {item.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <GripVertical className="w-3.5 h-3.5 text-ink-soft/30 group-hover:text-ink-soft shrink-0" />
      </div>
    </div>
  );
}
