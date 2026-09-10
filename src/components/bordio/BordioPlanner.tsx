"use client";

import React, { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { BordioDayColumn } from "./BordioDayColumn";
import { BordioItemModal } from "./BordioItemModal";
import { BordioDatePickerPopover } from "./BordioDatePickerPopover";
import { BordioWaitingList } from "./BordioWaitingList";
import {
  BordioItem,
  DEFAULT_PROJECTS,
  useBordioStore,
} from "@/features/recruiter/store/useBordioStore";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  Plus,
  CalendarDays,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
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
    selectedDate,
    setSelectedDate,
    activeItemId,
    setActiveItemId,
    toolsTab,
    setToolsTab,
    toolsSidebarOpen,
    toggleToolsSidebar,
    searchQuery,
    setSearchQuery,
  } = useBordioStore();

  const { orgProfile } = useRecruiterStore();
  const { user } = useAuthStore();
  const activeEntity = moduleContext || orgProfile?.entity || "company";

  // Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"task" | "event">("event");
  const [modalDate, setModalDate] = useState<string>("2026-09-10");

  // Date picker popover state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Search input visible state
  const [searchOpen, setSearchOpen] = useState(false);

  // Notes state for "Notes" tab
  const [notesContent, setNotesContent] = useState(
    "• Candidate review pipeline meeting scheduled for 2:00 PM\n• Finalize Super Dream offer letters for campus drive finalists\n• Seed round data room updates for Peak XV & Lightspeed"
  );

  // Current anchor date calculation
  const currentAnchor = parseISO(selectedDate || "2026-09-10");
  const weekStart = startOfWeek(currentAnchor, { weekStartsOn: 3 }); // Start on Wednesday (9 Wed) like Screenshot 2!
  const displayDays = Array.from({ length: 4 }, (_, i) => addDays(weekStart, i)); // 9 Wed, 10 Thu, 11 Fri, 12 Sat

  const monthYearLabel = format(currentAnchor, "MMMM yyyy");

  const handlePrevDays = () => {
    const prev = subDays(currentAnchor, 1);
    setSelectedDate(format(prev, "yyyy-MM-dd"));
  };

  const handleNextDays = () => {
    const next = addDays(currentAnchor, 1);
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  const handleTodayClick = () => {
    setSelectedDate("2026-09-10");
  };

  const handleQuickAdd = (type: "task" | "event", dateStr?: string) => {
    setActiveItemId(null);
    setModalType(type);
    setModalDate(dateStr || selectedDate);
    setModalOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen bg-[#111315] text-[#f1f3f5] overflow-hidden select-none font-sans">
      {/* ===== 1. TOOLS SIDEBAR (Matching Screenshot 2 Left Navigation) ===== */}
      <aside
        className={`${
          toolsSidebarOpen ? "w-44" : "w-0"
        } shrink-0 bg-[#16181b] border-r border-[#262a30] transition-all duration-200 flex flex-col justify-between overflow-hidden`}
      >
        <div className="p-3 space-y-4">
          <div className="px-2 pt-1">
            <h2 className="text-xs font-bold text-ink-soft/70 uppercase tracking-wider">
              Tools
            </h2>
          </div>

          <nav className="space-y-1">
            {/* Tasks Tool */}
            <button
              type="button"
              onClick={() => setToolsTab("tasks")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                toolsTab === "tasks"
                  ? "bg-[#242931] text-white font-bold"
                  : "text-ink-soft hover:text-white hover:bg-[#1e2227]"
              }`}
            >
              <CheckSquare className="w-4 h-4 text-ink-soft" />
              <span>Tasks</span>
            </button>

            {/* Calendar Tool (Active blue highlight as in Screenshot 2) */}
            <button
              type="button"
              onClick={() => setToolsTab("calendar")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                toolsTab === "calendar"
                  ? "bg-[#18314f] text-[#3894ff] border border-[#1f4a7a]/60 shadow-xs"
                  : "text-ink-soft hover:text-white hover:bg-[#1e2227]"
              }`}
            >
              <CalendarDays className="w-4 h-4 text-[#3894ff]" />
              <span>Calendar</span>
            </button>

            {/* Notes Tool */}
            <button
              type="button"
              onClick={() => setToolsTab("notes")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                toolsTab === "notes"
                  ? "bg-[#242931] text-white font-bold"
                  : "text-ink-soft hover:text-white hover:bg-[#1e2227]"
              }`}
            >
              <FileText className="w-4 h-4 text-ink-soft" />
              <span>Notes</span>
            </button>
          </nav>
        </div>

        {/* Hide Tools Toggle at Bottom (Screenshot 2: "< Hide tools") */}
        <div className="p-3 border-t border-[#262a30]">
          <button
            type="button"
            onClick={toggleToolsSidebar}
            className="w-full px-2 py-1.5 text-xs text-ink-soft hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Hide tools</span>
          </button>
        </div>
      </aside>

      {/* ===== 2. MAIN PLANNER WORKSPACE ===== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121417] overflow-hidden">
        {/* Top Header Bar (Screenshot 2: + Add new, Today v, Search, Bell, Avatar) */}
        <header className="h-14 px-4 sm:px-6 bg-[#16181b] border-b border-[#262a30] flex items-center justify-between shrink-0 relative z-30">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2.5">
            {!toolsSidebarOpen && (
              <button
                type="button"
                onClick={toggleToolsSidebar}
                className="p-1.5 rounded-xl bg-[#242931] border border-[#313743] text-ink-soft hover:text-white transition cursor-pointer mr-1"
                title="Show tools"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* "+ Add new" Bright Blue Pill Button */}
            <button
              type="button"
              onClick={() => handleQuickAdd("event")}
              className="px-4 py-1.5 rounded-full bg-[#0091ff] hover:bg-[#007fe0] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new</span>
            </button>

            {/* "Today ∨" Dropdown Button (Opens Dual-Pane Date Popover) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDatePickerOpen(!datePickerOpen)}
                className="px-3.5 py-1.5 rounded-full bg-[#242931] hover:bg-[#2b313b] border border-[#313743] text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Today</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
              </button>

              {/* Dual-Pane Month & Day Grid Popover (Screenshot 3) */}
              <BordioDatePickerPopover
                isOpen={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                anchorDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
              />
            </div>
          </div>

          {/* Right Controls: Search, Notifications Bell, User Avatar */}
          <div className="flex items-center gap-2.5">
            {searchOpen ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#242931] border border-[#313743]">
                <Search className="w-3.5 h-3.5 text-ink-soft" />
                <input
                  type="text"
                  placeholder="Search tasks & events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder:text-ink-soft/60 focus:outline-none w-36 sm:w-48"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-ink-soft hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 rounded-full bg-[#242931] hover:bg-[#2b313b] border border-[#313743] text-ink-soft hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#242931] hover:bg-[#2b313b] border border-[#313743] text-ink-soft hover:text-white flex items-center justify-center transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0091ff]" />
            </button>

            {/* Avatar matching screenshot */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-sm ring-1 ring-white/20">
              {user?.fullName?.charAt(0) || "D"}
            </div>
          </div>
        </header>

        {/* ===== 3. BODY: CALENDAR vs TASKS vs NOTES ===== */}
        {toolsTab === "calendar" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Date Strip Header: "September 2026" and Navigation Arrows */}
            <div className="px-4 py-2 bg-[#16181b]/70 border-b border-[#262a30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-ink-soft">
                  {monthYearLabel}
                </span>

                <button
                  type="button"
                  onClick={handlePrevDays}
                  className="p-1 rounded-lg hover:bg-[#242931] text-ink-soft hover:text-white transition cursor-pointer"
                  title="Previous days"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNextDays}
                  className="p-1 rounded-lg hover:bg-[#242931] text-ink-soft hover:text-white transition cursor-pointer"
                  title="Next days"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day Columns Grid (Screenshot 2: 9 Wed, 10 Thu, 11 Fri, 12 Sat) */}
            <main className="flex-1 flex overflow-x-auto overflow-y-hidden bg-[#121417]">
              {displayDays.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const dayNum = format(d, "d");
                const weekdayLabel = format(d, "EEE");
                const isSelected = selectedDate === dateStr;

                return (
                  <BordioDayColumn
                    key={dateStr}
                    dateStr={dateStr}
                    dayNum={dayNum}
                    weekdayLabel={weekdayLabel}
                    isSelected={isSelected}
                    onSelectColumn={() => setSelectedDate(dateStr)}
                    onQuickAddTask={(dt) => handleQuickAdd("task", dt)}
                    onQuickAddEvent={(dt) => handleQuickAdd("event", dt)}
                  />
                );
              })}
            </main>
          </div>
        )}

        {toolsTab === "tasks" && (
          <div className="flex-1 flex overflow-hidden">
            <BordioWaitingList />
            <main className="flex-1 p-4 overflow-y-auto bg-[#121417] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262a30]">
                <div>
                  <h3 className="text-base font-bold text-white">Task Management & Sprint Backlog</h3>
                  <p className="text-xs text-ink-soft">Drag items between Waiting List and active scheduled dates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd("task")}
                  className="px-3.5 py-1.5 rounded-full bg-[#0091ff] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              </div>

              {/* Grouped Tasks by Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEFAULT_PROJECTS.map((proj) => {
                  const projItems = items.filter((i) => i.projectId === proj.id);
                  return (
                    <div key={proj.id} className="p-4 rounded-2xl bg-[#1a1d22] border border-[#282d36] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${proj.badgeBg} ${proj.badgeText}`}>
                          {projItems.length}
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
                        {projItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setActiveItemId(item.id);
                              setModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#22272f] hover:bg-[#282e37] border border-[#313743] transition cursor-pointer text-xs space-y-1"
                          >
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              {item.iconEmoji && <span>{item.iconEmoji}</span>}
                              <span>{item.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-ink-soft">
                              <span>{item.date ? item.date : "Waiting list"}</span>
                              <span>{item.durationMinutes}m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        )}

        {toolsTab === "notes" && (
          <div className="flex-1 p-6 overflow-y-auto bg-[#121417] max-w-4xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262a30]">
              <div>
                <h3 className="text-base font-bold text-white">Workspace Notes & Meeting Agendas</h3>
                <p className="text-xs text-ink-soft">Quick scratchpad for candidate interviews, sprint thoughts, and meeting minutes.</p>
              </div>
            </div>

            <textarea
              rows={16}
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Jot down notes, action items, or agenda topics..."
              className="w-full p-5 rounded-2xl bg-[#1a1d22] border border-[#282d36] text-xs text-white leading-relaxed font-mono focus:outline-none focus:border-[#0091ff] resize-none"
            />
          </div>
        )}
      </div>

      {/* ===== 4. CREATE / EDIT EVENT MODAL (Screenshot 1) ===== */}
      <BordioItemModal
        itemId={activeItemId}
        isOpen={modalOpen || activeItemId !== null}
        onClose={() => {
          setModalOpen(false);
          setActiveItemId(null);
        }}
        defaultDate={modalDate}
        defaultType={modalType}
      />
    </div>
  );
}
