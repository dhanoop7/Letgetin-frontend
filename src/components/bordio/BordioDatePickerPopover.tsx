"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, setMonth, setYear, getDaysInMonth, startOfMonth, getDay, isSameDay, parseISO } from "date-fns";
import { useBordioStore } from "@/features/recruiter/store/useBordioStore";

interface BordioDatePickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export function BordioDatePickerPopover({
  isOpen,
  onClose,
  anchorDate,
  onSelectDate,
}: BordioDatePickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedParsed = parseISO(anchorDate || "2026-09-10");
  const [viewDate, setViewDate] = useState<Date>(selectedParsed);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate Month list for left pane
  // Showing e.g. current year remaining months and next year start months
  const currentYear = viewDate.getFullYear();
  const monthsList = [
    { label: `Sep ${currentYear}`, month: 8, year: currentYear },
    { label: "October", month: 9, year: currentYear },
    { label: "November", month: 10, year: currentYear },
    { label: "December", month: 11, year: currentYear },
    { isHeader: true, label: `${currentYear + 1}` },
    { label: "January", month: 0, year: currentYear + 1 },
    { label: "February", month: 1, year: currentYear + 1 },
    { label: "March", month: 2, year: currentYear + 1 },
  ];

  // Days grid for right pane
  const startDayOfMonth = getDay(startOfMonth(viewDate)); // 0 = Sun
  const totalDays = getDaysInMonth(viewDate);

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const handleSelectDay = (dayNum: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    onSelectDate(format(newDate, "yyyy-MM-dd"));
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-12 left-28 z-50 w-[360px] bg-[#1a1d21] border border-[#2a2e35] rounded-2xl shadow-2xl flex overflow-hidden text-xs select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Left Pane: Month Selector */}
      <div className="w-36 bg-[#15171a] border-r border-[#262a30] p-2 py-3 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto scrollbar-none">
        {monthsList.map((m, idx) => {
          if (m.isHeader) {
            return (
              <div
                key={idx}
                className="text-[11px] font-bold text-ink-soft/60 px-3 pt-3 pb-1 uppercase tracking-wider"
              >
                {m.label}
              </div>
            );
          }

          const isCurrentView =
            viewDate.getMonth() === m.month && viewDate.getFullYear() === m.year;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (m.month !== undefined && m.year !== undefined) {
                  const updated = setMonth(setYear(viewDate, m.year), m.month);
                  setViewDate(updated);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-left font-medium transition cursor-pointer ${
                isCurrentView
                  ? "bg-[#252a32] text-white font-bold"
                  : "text-ink-soft hover:text-ink hover:bg-[#1e2227]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Right Pane: Day Grid */}
      <div className="flex-1 p-3.5 flex flex-col">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-ink-soft/70 text-[11px] pb-2 border-b border-[#262a30]">
          {daysOfWeek.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 text-center pt-2 flex-1 items-center">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: startDayOfMonth }).map((_, i) => (
            <span key={`empty-${i}`} className="w-7 h-7" />
          ))}

          {/* Days 1..N */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const thisDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
            const isSelected = isSameDay(thisDayDate, selectedParsed);
            const isToday = isSameDay(thisDayDate, new Date(2026, 8, 10)); // Current demo date Sep 10, 2026

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-medium transition text-xs cursor-pointer ${
                  isSelected
                    ? "bg-[#0091ff] text-white font-extrabold shadow-sm"
                    : isToday
                    ? "border border-[#0091ff] text-[#0091ff] font-bold"
                    : "text-ink hover:bg-[#252a32]"
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
