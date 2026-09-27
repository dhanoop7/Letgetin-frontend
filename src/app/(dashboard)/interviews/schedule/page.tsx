"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Settings,
  Layers,
  Clock,
  CheckCircle2,
  User,
  MoreVertical,
  Trash2,
  Sparkles,
  ArrowRight,
  Tag,
  Briefcase,
  Search,
  Filter,
} from "lucide-react";

export type ViewTab = "kanban" | "calendar" | "timeline";

export interface TaskItem {
  id: string;
  title: string;
  category?: string;
  date?: string; // YYYY-MM-DD
  time?: string;
  candidateName?: string;
  interviewer?: string;
  status: "new" | "scheduled" | "in-progress" | "completed";
}

export interface Column {
  id: "new" | "scheduled" | "in-progress" | "completed";
  title: string;
  tasks: TaskItem[];
}

export const CATEGORY_OPTIONS = [
  { id: "operational", name: "Operational", color: "bg-[#D0E2FF] text-blue-800 border-blue-200" },
  { id: "technical", name: "Technical", color: "bg-[#F8D468] text-amber-900 border-amber-300" },
  { id: "strategic", name: "Strategic", color: "bg-[#C8F0BE] text-emerald-900 border-emerald-300" },
  { id: "hiring", name: "Hiring", color: "bg-[#FCAAA6] text-rose-900 border-rose-300" },
  { id: "financial", name: "Financial", color: "bg-[#D1D5DB] text-slate-800 border-slate-300" },
];

export const STATUS_CONFIG: Record<
  TaskItem["status"],
  { label: string; bg: string; text: string; dot: string; columnId: Column["id"] }
> = {
  new: {
    label: "New Task",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    columnId: "new",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    columnId: "scheduled",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    columnId: "in-progress",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    columnId: "completed",
  },
};

const INITIAL_COLUMNS: Column[] = [
  {
    id: "new",
    title: "New task",
    tasks: [
      {
        id: "task-1",
        title: "Review candidate portfolio & code assessment",
        category: "technical",
        date: "2026-12-18",
        time: "09:30 AM",
        candidateName: "Sarah Jenkins",
        interviewer: "Lead Architect",
        status: "new",
      },
    ],
  },
  {
    id: "scheduled",
    title: "Scheduled",
    tasks: [
      {
        id: "task-2",
        title: "Technical Interview - System Architecture",
        category: "technical",
        date: "2026-12-18",
        time: "10:00 AM",
        candidateName: "Alex Rivera",
        interviewer: "David Chen",
        status: "scheduled",
      },
      {
        id: "task-3",
        title: "Strategic Product Alignment Discussion",
        category: "strategic",
        date: "2026-12-19",
        time: "02:30 PM",
        candidateName: "Elena Rostova",
        interviewer: "Maria Garcia",
        status: "scheduled",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "task-4",
        title: "HR & Culture Fit Round",
        category: "hiring",
        date: "2026-12-18",
        time: "02:00 PM",
        candidateName: "Michael Chang",
        interviewer: "Rachel Green",
        status: "in-progress",
      },
    ],
  },
  {
    id: "completed",
    title: "Completed",
    tasks: [
      {
        id: "task-5",
        title: "Final Leadership & Executive Interview",
        category: "strategic",
        date: "2026-12-17",
        time: "05:00 PM",
        candidateName: "James Wilson",
        interviewer: "VP Engineering",
        status: "completed",
      },
    ],
  },
];

export default function InterviewSchedulePage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("kanban");
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

  // Inline Task Creation State
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("operational");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calendar Datepicker for creation
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date(2026, 11, 18));
  const [selectedDateDay, setSelectedDateDay] = useState<number | null>(18);
  const [includeTime, setIncludeTime] = useState(true);
  const [timeValue, setTimeValue] = useState("10:00 AM");

  // Main Calendar View State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(2026, 11, 1));
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskItem | null>(null);

  // Board Controls: Search & Category Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarPickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        calendarPickerRef.current &&
        !calendarPickerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    { name: "Mo", isWeekend: false },
    { name: "Tu", isWeekend: false },
    { name: "We", isWeekend: false },
    { name: "Th", isWeekend: false },
    { name: "Fr", isWeekend: false },
    { name: "Sa", isWeekend: true },
    { name: "Su", isWeekend: true },
  ];

  // All tasks flattened
  const allTasks = useMemo(() => {
    return columns.flatMap((col) => col.tasks);
  }, [columns]);

  // Handle Save Task
  const handleSaveTask = () => {
    if (!taskName.trim()) {
      setIsAddingNewTask(false);
      return;
    }

    const year = pickerDate.getFullYear();
    const month = pickerDate.getMonth() + 1;
    const formattedDate = selectedDateDay
      ? `${year}-${String(month).padStart(2, "0")}-${String(selectedDateDay).padStart(2, "0")}`
      : "2026-12-18";

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskName.trim(),
      category: selectedCategory,
      date: formattedDate,
      time: includeTime ? timeValue : undefined,
      candidateName: candidateInput.trim() || undefined,
      status: "new",
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === "new"
          ? {
              ...col,
              tasks: [newTask, ...col.tasks],
            }
          : col
      )
    );

    setTaskName("");
    setCandidateInput("");
    setIsAddingNewTask(false);
    setIsDropdownOpen(false);
    setIsCalendarOpen(false);
  };

  // Move task status
  const handleMoveTask = (taskId: string, targetStatus: TaskItem["status"]) => {
    setColumns((prev) => {
      let movedTask: TaskItem | null = null;

      // Remove from existing column
      const newCols = prev.map((col) => {
        const found = col.tasks.find((t) => t.id === taskId);
        if (found) {
          movedTask = { ...found, status: targetStatus };
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }
        return col;
      });

      if (!movedTask) return prev;

      // Insert into target column
      return newCols.map((col) => {
        if (col.id === targetStatus) {
          return {
            ...col,
            tasks: [...col.tasks, movedTask!],
          };
        }
        return col;
      });
    });

    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail((prev) => (prev ? { ...prev, status: targetStatus } : null));
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      }))
    );
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(null);
    }
  };

  // Generate days for the Mini Picker
  const pickerYear = pickerDate.getFullYear();
  const pickerMonth = pickerDate.getMonth();
  const pickerDaysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  const pickerFirstDayIndex = (new Date(pickerYear, pickerMonth, 1).getDay() + 6) % 7;
  const pickerCalendarDays: (number | null)[] = [];
  for (let i = 0; i < pickerFirstDayIndex; i++) pickerCalendarDays.push(null);
  for (let d = 1; d <= pickerDaysInMonth; d++) pickerCalendarDays.push(d);

  // Generate days for the Full Monthly Calendar Tab
  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calFirstDayIndex = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const fullCalendarDays: (number | null)[] = [];
  for (let i = 0; i < calFirstDayIndex; i++) fullCalendarDays.push(null);
  for (let d = 1; d <= calDaysInMonth; d++) fullCalendarDays.push(d);

  // Helper for tasks on a specific calendar date
  const getTasksForDate = (day: number) => {
    const formatted = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allTasks.filter((t) => t.date === formatted);
  };

  // Timeline sorted tasks grouped by date
  const timelineGrouped = useMemo(() => {
    const sorted = [...allTasks].sort((a, b) => {
      const dateA = a.date || "1970-01-01";
      const dateB = b.date || "1970-01-01";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.time || "").localeCompare(b.time || "");
    });

    const groups: Record<string, TaskItem[]> = {};
    sorted.forEach((task) => {
      const key = task.date || "Unscheduled";
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [allTasks]);

  const formatTimelineDateHeader = (dateStr: string) => {
    if (dateStr === "Unscheduled") return "Unscheduled Interviews";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white text-slate-900 select-none flex flex-col font-sans">
      {/* 1. Top Header Bar with Title, Subtitle, Add Button, and Full-Width Horizontal Navigation Tabs */}
      <div className="py-5 px-6 sm:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B3A5B] tracking-tight">
                Interview Schedule
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {allTasks.length} Tasks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage interview pipelines, calendar schedules, and chronological event timelines
            </p>
          </div>

          {/* New Task Button */}
          <button
            type="button"
            onClick={() => {
              setIsAddingNewTask(true);
              if (activeTab !== "kanban") setActiveTab("kanban");
            }}
            className="w-10 h-10 rounded-full bg-[#1B3A5B] hover:bg-[#122840] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
            title="Add new task"
          >
            <Plus className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Horizontal Navigation Bar matching Reference Image */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-1.5 shadow-2xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "kanban"
                ? "bg-[#0B3B60] text-white shadow-sm"
                : "text-slate-700 hover:text-[#0B3B60] hover:bg-slate-100/80 font-semibold"
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === "kanban" ? "text-white" : "text-[#0B3B60]"}`} />
            <span>Kanban Board</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "calendar"
                ? "bg-[#0B3B60] text-white shadow-sm"
                : "text-slate-700 hover:text-[#0B3B60] hover:bg-slate-100/80 font-semibold"
            }`}
          >
            <CalendarIcon className={`w-4 h-4 ${activeTab === "calendar" ? "text-white" : "text-[#0B3B60]"}`} />
            <span>Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "timeline"
                ? "bg-[#0B3B60] text-white shadow-sm"
                : "text-slate-700 hover:text-[#0B3B60] hover:bg-slate-100/80 font-semibold"
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === "timeline" ? "text-white" : "text-[#0B3B60]"}`} />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT AREA */}

      {/* TAB 1: KANBAN VIEW */}
      {activeTab === "kanban" && (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5 flex-1 animate-fade-in">
          {/* Board Controls: Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, interview or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Discrete Stage Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
            {columns.map((col, index) => {
              const filteredTasks = col.tasks.filter((t) => {
                const q = searchQuery.toLowerCase().trim();
                const matchesQuery =
                  !q ||
                  t.title.toLowerCase().includes(q) ||
                  (t.candidateName && t.candidateName.toLowerCase().includes(q));
                const matchesCategory =
                  categoryFilter === "all" || t.category === categoryFilter;
                return matchesQuery && matchesCategory;
              });

              const statusConfig = STATUS_CONFIG[col.id];

              return (
                <div
                  key={col.id}
                  className="bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs overflow-hidden transition-all hover:shadow-sm"
                >
                  {/* Column Header matching screenshot */}
                  <div className="p-4 border-b border-slate-100 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                          #{index + 1}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            col.id === "new"
                              ? "bg-slate-400"
                              : col.id === "scheduled"
                              ? "bg-blue-500"
                              : col.id === "in-progress"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <h3 className="text-xs font-extrabold text-slate-900 truncate">
                          {col.title}
                        </h3>
                      </div>
                      <span className="text-xs font-extrabold text-blue-700 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        {filteredTasks.length}/{col.tasks.length}
                      </span>
                    </div>

                    {/* Progress Bar & Subtitle */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Total in Stage: {col.tasks.length}</span>
                        <span className="text-slate-600 font-semibold">{statusConfig.label}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            col.id === "completed"
                              ? "bg-emerald-500"
                              : col.id === "in-progress"
                              ? "bg-amber-500"
                              : col.id === "scheduled"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                12,
                                (col.tasks.length / (allTasks.length || 1)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task / Candidate Cards Column Body */}
                  <div className="p-3.5 space-y-3 bg-slate-50/40 flex-1 min-h-[300px] overflow-y-auto max-h-[600px] scrollbar-thin">
                    {/* Column Subheading */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            col.id === "new"
                              ? "bg-slate-400"
                              : col.id === "scheduled"
                              ? "bg-blue-500"
                              : col.id === "in-progress"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        Primary Candidates ({filteredTasks.length})
                      </span>
                    </div>

                    {/* Inline Task Creation Card in "New task" column */}
                    {col.id === "new" && isAddingNewTask && (
                      <div className="relative bg-[#D6E6F5] rounded-xl p-3.5 shadow-sm border border-[#BED7EE] animate-in fade-in zoom-in-98 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewTask(false);
                            setTaskName("");
                            setCandidateInput("");
                            setIsDropdownOpen(false);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#99B7D4] hover:bg-[#85A6C7] text-slate-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer z-10"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>

                        <div className="space-y-2 mb-3 pt-0.5">
                          <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveTask();
                              if (e.key === "Escape") {
                                setIsAddingNewTask(false);
                                setTaskName("");
                                setCandidateInput("");
                                setIsDropdownOpen(false);
                              }
                            }}
                            placeholder="Task / Interview Title"
                            autoFocus
                            className="w-full bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                          />

                          <input
                            type="text"
                            value={candidateInput}
                            onChange={(e) => setCandidateInput(e.target.value)}
                            placeholder="Candidate Name (Optional)"
                            className="w-full bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {/* Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                              <button
                                type="button"
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className="w-6 h-6 rounded-full border border-slate-500/60 text-slate-700 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer"
                                title="Select category"
                              >
                                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
                              </button>

                              {isDropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  <div className="space-y-1">
                                    {CATEGORY_OPTIONS.map((cat) => (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(cat.id);
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                                          selectedCategory === cat.id
                                            ? "bg-slate-100 font-bold text-slate-900"
                                            : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                      >
                                        <span
                                          className={`w-3 h-3 rounded-sm ${cat.color} shrink-0`}
                                        />
                                        <span>{cat.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Calendar */}
                            <div className="relative" ref={calendarPickerRef}>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCalendarOpen((prev) => !prev);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-6 h-6 rounded-full border text-slate-700 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer ${
                                  selectedDateDay
                                    ? "border-blue-600 bg-white/50 text-blue-700"
                                    : "border-slate-500/60"
                                }`}
                                title="Set date and time"
                              >
                                <CalendarIcon className="w-3 h-3 stroke-[2]" />
                              </button>

                              {isCalendarOpen && (
                                <div className="absolute left-0 top-full mt-2 w-[260px] bg-[#D7E7F6] rounded-2xl shadow-xl border border-[#BED7EE] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  <div className="flex items-center justify-end mb-2">
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPickerDate(
                                            new Date(pickerYear, pickerMonth - 1, 1)
                                          )
                                        }
                                        className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center text-slate-700 text-xs cursor-pointer"
                                      >
                                        ‹
                                      </button>
                                      <span className="bg-black text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">
                                        {monthNames[pickerMonth]}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPickerDate(
                                            new Date(pickerYear, pickerMonth + 1, 1)
                                          )
                                        }
                                        className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center text-slate-700 text-xs cursor-pointer"
                                      >
                                        ›
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-7 text-center gap-1 mb-2">
                                    {daysOfWeek.map((day) => (
                                      <span
                                        key={day.name}
                                        className={`text-[10px] font-medium py-0.5 ${
                                          day.isWeekend
                                            ? "text-[#0070F3]"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {day.name}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-7 text-center gap-1 mb-2">
                                    {pickerCalendarDays.map((day, idx) => {
                                      if (day === null) {
                                        return <div key={`empty-${idx}`} className="w-6 h-6" />;
                                      }
                                      const isSelected = selectedDateDay === day;
                                      return (
                                        <button
                                          key={`day-${day}`}
                                          type="button"
                                          onClick={() => setSelectedDateDay(day)}
                                          className={`w-6 h-6 mx-auto rounded-md text-[11px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-black text-white font-bold"
                                              : "text-slate-700 hover:bg-white/60"
                                          }`}
                                        >
                                          {day}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedDateDay(null);
                                        setIsCalendarOpen(false);
                                      }}
                                      className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded shadow-2xs hover:bg-slate-50 border border-slate-200/60 font-medium transition cursor-pointer"
                                    >
                                      No Date
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveTask}
                            className="px-4 py-1 rounded-lg bg-[#1B3A5B] hover:bg-[#122840] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cards */}
                    {filteredTasks.map((task) => {
                      const categoryMeta = CATEGORY_OPTIONS.find(
                        (c) => c.id === task.category
                      );

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskDetail(task)}
                          className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 relative"
                        >
                          {/* Top: Title & Category Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                              {task.title}
                            </h4>

                            {categoryMeta && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${categoryMeta.color}`}
                              >
                                {categoryMeta.name}
                              </span>
                            )}
                          </div>

                          {/* Middle: Candidate info */}
                          {task.candidateName && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-700 truncate">
                                {task.candidateName}
                              </span>
                            </div>
                          )}

                          {/* Bottom: Date & Time */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {task.date || "2026-12-18"}
                                {task.time ? ` • ${task.time}` : ""}
                              </span>
                            </div>

                            {col.id !== "completed" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus =
                                    col.id === "new"
                                      ? "scheduled"
                                      : col.id === "scheduled"
                                      ? "in-progress"
                                      : "completed";
                                  handleMoveTask(task.id, nextStatus);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                                title="Advance to next column"
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredTasks.length === 0 && !isAddingNewTask && (
                      <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/70">
                        No active primary candidates in this stage.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="p-6 sm:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full animate-fade-in">
          {/* Calendar Navigation Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1B3A5B] text-white flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {monthNames[calMonth]} {calYear}
                </h2>
                <p className="text-xs text-slate-500">
                  {allTasks.length} scheduled interviews across the pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCalendarViewDate(new Date(calYear, calMonth - 1, 1))
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={() => setCalendarViewDate(new Date(2026, 11, 1))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() =>
                  setCalendarViewDate(new Date(calYear, calMonth + 1, 1))
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
                title="Next Month"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-width Calendar Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            {/* Days of Week Row */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
              {daysOfWeek.map((day) => (
                <div
                  key={day.name}
                  className={`py-3 text-xs font-bold uppercase tracking-wider ${
                    day.isWeekend ? "text-blue-600" : "text-slate-600"
                  }`}
                >
                  {day.name}
                </div>
              ))}
            </div>

            {/* Calendar Month Matrix */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {fullCalendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`cal-empty-${idx}`}
                      className="min-h-[110px] sm:min-h-[130px] bg-slate-50/30 p-2"
                    />
                  );
                }

                const dayTasks = getTasksForDate(day);
                const isToday = day === 18 && calMonth === 11 && calYear === 2026;

                return (
                  <div
                    key={`cal-day-${day}`}
                    className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors hover:bg-slate-50/70 group ${
                      isToday ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-[#1B3A5B] text-white"
                            : "text-slate-800"
                        }`}
                      >
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-500">
                          {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                        </span>
                      )}
                    </div>

                    {/* Task list inside calendar day */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[90px] no-scrollbar">
                      {dayTasks.map((t) => {
                        const statusConfig = STATUS_CONFIG[t.status];
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTaskDetail(t)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs text-left text-[11px] font-medium transition cursor-pointer truncate flex items-center gap-1.5"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} shrink-0`}
                            />
                            <span className="truncate flex-1 text-slate-800 font-semibold">
                              {t.title}
                            </span>
                            {t.time && (
                              <span className="text-[10px] text-slate-600 shrink-0">
                                {t.time}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE VIEW */}
      {activeTab === "timeline" && (
        <div className="p-6 sm:p-8 space-y-6 flex-1 max-w-4xl mx-auto w-full animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1B3A5B] text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Interview Timeline
                </h2>
                <p className="text-xs text-slate-500">
                  Chronological schedule of candidate interviews and evaluations
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Total {allTasks.length} Events
            </span>
          </div>

          {/* Chronological Timeline Container */}
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-6 before:w-0.5 before:bg-slate-200">
            {Object.keys(timelineGrouped).map((dateKey) => {
              const groupTasks = timelineGrouped[dateKey];

              return (
                <div key={dateKey} className="space-y-4 relative">
                  {/* Date Heading Pill */}
                  <div className="flex items-center gap-3 sticky top-20 z-10">
                    <div className="w-8 sm:w-12 flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#1B3A5B] border-2 border-white ring-2 ring-blue-200 shadow-xs" />
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 bg-white/90 backdrop-blur px-3.5 py-1 rounded-full border border-slate-200 shadow-xs">
                      {formatTimelineDateHeader(dateKey)}
                    </span>
                  </div>

                  {/* Events on this date */}
                  <div className="space-y-3.5 pl-8 sm:pl-12">
                    {groupTasks.map((task) => {
                      const statusMeta = STATUS_CONFIG[task.status];
                      const categoryMeta = CATEGORY_OPTIONS.find(
                        (c) => c.id === task.category
                      );

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskDetail(task)}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-[#1B3A5B] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-600" />
                                {task.time || "Time TBD"}
                              </span>

                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${statusMeta.bg} ${statusMeta.text}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                              </span>
                            </div>

                            {categoryMeta && (
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border self-start sm:self-auto ${categoryMeta.color}`}
                              >
                                {categoryMeta.name}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {task.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                              {task.candidateName && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Candidate: <strong className="text-slate-700">{task.candidateName}</strong></span>
                                </div>
                              )}
                              {task.interviewer && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Interviewer: <strong className="text-slate-700">{task.interviewer}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action shortcuts */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                              View Details <ArrowRight className="w-3.5 h-3.5" />
                            </span>

                            <div
                              className="flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.status !== "completed" ? (
                                <button
                                  type="button"
                                  onClick={() => handleMoveTask(task.id, "completed")}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                                >
                                  Mark Completed
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {allTasks.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No scheduled timeline events</p>
                <p className="text-xs text-slate-500">
                  Click the + button to create your first interview schedule item.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Task Details Modal Drawer */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    STATUS_CONFIG[selectedTaskDetail.status].bg
                  } ${STATUS_CONFIG[selectedTaskDetail.status].text}`}
                >
                  {STATUS_CONFIG[selectedTaskDetail.status].label}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedTaskDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <strong className="text-slate-800">
                    {selectedTaskDetail.date || "Dec 18, 2026"}{" "}
                    {selectedTaskDetail.time ? `• ${selectedTaskDetail.time}` : ""}
                  </strong>
                </div>

                {selectedTaskDetail.candidateName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Candidate:</span>
                    <strong className="text-slate-800">{selectedTaskDetail.candidateName}</strong>
                  </div>
                )}

                {selectedTaskDetail.interviewer && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Interviewer:</span>
                    <strong className="text-slate-800">{selectedTaskDetail.interviewer}</strong>
                  </div>
                )}

                {selectedTaskDetail.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="capitalize font-bold text-slate-800">
                      {selectedTaskDetail.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Switcher Action */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Stage / Column:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["new", "scheduled", "in-progress", "completed"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleMoveTask(selectedTaskDetail.id, st)}
                      className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        selectedTaskDetail.status === st
                          ? "bg-[#1B3A5B] text-white border-[#1B3A5B]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {STATUS_CONFIG[st].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTaskDetail.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#1B3A5B] text-white text-xs font-bold hover:bg-[#122840] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
