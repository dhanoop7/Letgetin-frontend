"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  User,
  LayoutGrid,
  CheckCircle2,
  X,
  CalendarDays,
  SlidersHorizontal,
  Video,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  MoreVertical,
  AlertCircle,
  Lock,
  Bell,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { interviewService } from "@/features/interview/services/interviewService";

// Check if candidate is allowed to join (strictly unlocks 15 minutes before scheduled start time)
export function checkJoinEligibility(dateStr: string, timeStr: string): { canJoin: boolean; label: string; countdownText: string } {
  try {
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) return { canJoin: true, label: "Join Interview", countdownText: "Live / Ready" };
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridian = timeMatch[3]?.toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
    if (!year || !month || !day) return { canJoin: true, label: "Join Interview", countdownText: "Live / Ready" };
    const interviewDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const now = new Date();
    const diffMs = interviewDate.getTime() - now.getTime();
    const fifteenMinsMs = 15 * 60 * 1000;

    // Unlocks 15 minutes prior to scheduled start time
    if (diffMs <= fifteenMinsMs) {
      return { canJoin: true, label: "Join Interview", countdownText: "Live / Ready" };
    }

    const minutesRemaining = Math.ceil((diffMs - fifteenMinsMs) / (60 * 1000));
    const hoursRem = Math.floor(minutesRemaining / 60);
    const minsRem = minutesRemaining % 60;
    const timeRemainingStr = hoursRem > 0 ? `${hoursRem}h ${minsRem}m` : `${minsRem}m`;

    return {
      canJoin: false,
      label: `Join in ${timeRemainingStr}`,
      countdownText: `Unlocks 15m before (${timeRemainingStr} remaining)`,
    };
  } catch {
    return { canJoin: true, label: "Join Interview", countdownText: "Live / Ready" };
  }
}

export interface CandidateInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  roundName: string;
  title: string; // for Timeline
  stage: "to_schedule" | "upcoming" | "today" | "feedback_pending" | "completed" | "cancelled";
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  datetime: string; // "YYYY-MM-DD • 10:30 AM" for Timeline
  durationMinutes: number;
  duration: string; // "45 mins" for Timeline
  interviewers: { name: string; role?: string }[];
  interviewerName: string; // for Timeline
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "LetGetIn Room" | "On-Site";
  meetingLink: string;
  score?: number;
  category: "Technical" | "Strategic" | "Hiring" | "Operational";
  notes?: string;
}

// Initial recruiter-created interviews matching the Recruiter Interview Schedule
const INITIAL_RECRUITER_INTERVIEWS: CandidateInterview[] = [
  {
    id: "int-1",
    candidateName: "Sophia Chen",
    candidateEmail: "sophia.chen@example.com",
    position: "Senior Frontend Engineer",
    department: "Engineering",
    roundName: "Round 2: Architecture & Code",
    title: "Round 2: Architecture & Code",
    stage: "today",
    date: new Date().toISOString().slice(0, 10),
    time: "10:30 AM",
    datetime: `${new Date().toISOString().slice(0, 10)} • 10:30 AM`,
    durationMinutes: 45,
    duration: "45 mins",
    interviewers: [
      { name: "David Kim", role: "Principal Engineer" },
      { name: "Elena Rostova", role: "Frontend Lead" },
    ],
    interviewerName: "David Kim + 1",
    platform: "LetGetIn Room",
    meetingLink: "/interviews/ai-practice?interviewId=int-1",
    category: "Technical",
    notes: "Deep dive into state management, micro-frontends, and performance optimization.",
  },
  {
    id: "int-2",
    candidateName: "Marcus Vance",
    candidateEmail: "marcus.v@example.com",
    position: "Staff Product Designer",
    department: "Design",
    roundName: "Portfolio Deep Dive",
    title: "Portfolio Deep Dive",
    stage: "today",
    date: new Date().toISOString().slice(0, 10),
    time: "02:00 PM",
    datetime: `${new Date().toISOString().slice(0, 10)} • 02:00 PM`,
    durationMinutes: 60,
    duration: "60 mins",
    interviewers: [{ name: "Sarah Jenkins", role: "Design Director" }],
    interviewerName: "Sarah Jenkins",
    platform: "Google Meet",
    meetingLink: "/interviews/ai-practice?interviewId=int-2",
    category: "Strategic",
    notes: "Walkthrough of design system architecture and user testing outcomes.",
  },
  {
    id: "int-3",
    candidateName: "Aarav Sharma",
    candidateEmail: "aarav.sharma@example.com",
    position: "Full Stack Engineer",
    department: "Engineering",
    roundName: "Round 1: Technical Screening",
    title: "Round 1: Technical Screening",
    stage: "upcoming",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "11:00 AM",
    datetime: `${new Date(Date.now() + 86400000).toISOString().slice(0, 10)} • 11:00 AM`,
    durationMinutes: 45,
    duration: "45 mins",
    interviewers: [{ name: "Alex Rivera", role: "Tech Lead" }],
    interviewerName: "Alex Rivera",
    platform: "Zoom",
    meetingLink: "/interviews/ai-practice?interviewId=int-3",
    category: "Technical",
    notes: "Data structures, API design, and asynchronous concurrency round.",
  },
  {
    id: "int-4",
    candidateName: "Emily Watson",
    candidateEmail: "emily.w@example.com",
    position: "Product Marketing Manager",
    department: "Marketing",
    roundName: "Culture & Value Alignment",
    title: "Culture & Value Alignment",
    stage: "upcoming",
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    time: "03:30 PM",
    datetime: `${new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)} • 03:30 PM`,
    durationMinutes: 45,
    duration: "45 mins",
    interviewers: [
      { name: "Rachel Adams", role: "VP Marketing" },
      { name: "Jordan Cole", role: "People Partner" },
    ],
    interviewerName: "Rachel Adams + 1",
    platform: "Google Meet",
    meetingLink: "/interviews/ai-practice?interviewId=int-4",
    category: "Hiring",
    notes: "Culture alignment, team collaboration strategies, and cross-functional leadership.",
  },
  {
    id: "int-5",
    candidateName: "Jameson Miller",
    candidateEmail: "j.miller@example.com",
    position: "DevOps / SRE Specialist",
    department: "Engineering",
    roundName: "Initial Recruiter Screen",
    title: "Initial Recruiter Screen",
    stage: "to_schedule",
    date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    time: "04:00 PM",
    datetime: `${new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)} • 04:00 PM`,
    durationMinutes: 30,
    duration: "30 mins",
    interviewers: [{ name: "Jordan Cole", role: "Talent Partner" }],
    interviewerName: "Jordan Cole",
    platform: "Google Meet",
    meetingLink: "/interviews/ai-practice?interviewId=int-5",
    category: "Operational",
    notes: "Initial screening discussion regarding infrastructure experience and Kubernetes expertise.",
  },
  {
    id: "int-6",
    candidateName: "Ananya Patel",
    candidateEmail: "ananya.patel@example.com",
    position: "Data Science Lead",
    department: "Engineering",
    roundName: "Round 3: System Modeling",
    title: "Round 3: System Modeling",
    stage: "feedback_pending",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time: "01:30 PM",
    datetime: `${new Date(Date.now() - 86400000).toISOString().slice(0, 10)} • 01:30 PM`,
    durationMinutes: 60,
    duration: "60 mins",
    interviewers: [
      { name: "Dr. Vikram Seth", role: "Head of AI" },
      { name: "David Kim", role: "Principal Engineer" },
    ],
    interviewerName: "Dr. Vikram Seth + 1",
    platform: "LetGetIn Room",
    meetingLink: "/interviews/ai-practice?interviewId=int-6",
    score: 4.5,
    category: "Technical",
    notes: "Strong mathematical intuition and clean code style.",
  },
  {
    id: "int-7",
    candidateName: "Lucas Silva",
    candidateEmail: "lucas.silva@example.com",
    position: "Senior Mobile Developer (React Native)",
    department: "Engineering",
    roundName: "Executive Panel",
    title: "Executive Panel",
    stage: "completed",
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    time: "04:30 PM",
    datetime: `${new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10)} • 04:30 PM`,
    durationMinutes: 45,
    duration: "45 mins",
    interviewers: [{ name: "CTO / VP Engineering", role: "Leadership" }],
    interviewerName: "CTO / VP Engineering",
    platform: "Microsoft Teams",
    meetingLink: "/interviews/ai-practice?interviewId=int-7",
    score: 5.0,
    category: "Strategic",
    notes: "Exceeded all technical and culture benchmarks. Recommended for immediate offer.",
  },
  {
    id: "int-8",
    candidateName: "Adarsh Anil",
    candidateEmail: "adarshanil2005au@gmail.com",
    position: "Full Stack AI Engineer",
    department: "Engineering",
    roundName: "Technical Interview - System Architecture",
    title: "Technical Interview - System Architecture",
    stage: "upcoming",
    date: new Date().toISOString().slice(0, 10),
    time: "11:30 AM",
    datetime: `${new Date().toISOString().slice(0, 10)} • 11:30 AM`,
    durationMinutes: 45,
    duration: "45 mins",
    interviewers: [{ name: "David Kim", role: "Principal Engineer" }],
    interviewerName: "David Kim",
    platform: "LetGetIn Room",
    meetingLink: "/interviews/ai-practice?interviewId=int-8",
    category: "Technical",
    notes: "System architecture review, microservice scalability, and full stack coding evaluation.",
  },
];

// 5 Columns matching the recruiter Kanban screenshot
const KANBAN_STAGES: {
  id: CandidateInterview["stage"];
  title: string;
  dotColor: string;
}[] = [
  { id: "to_schedule", title: "Requested / To Schedule", dotColor: "bg-amber-500" },
  { id: "upcoming", title: "Confirmed / Upcoming", dotColor: "bg-blue-500" },
  { id: "today", title: "In Progress / Today", dotColor: "bg-emerald-500" },
  { id: "feedback_pending", title: "Feedback Pending", dotColor: "bg-purple-500" },
  { id: "completed", title: "Completed / Decided", dotColor: "bg-teal-500" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Helper to parse date string format "YYYY-MM-DD • HH:MM AM/PM" or ISO
function parseInterviewDate(datetimeStr: string): Date {
  if (!datetimeStr) return new Date();
  try {
    const parts = datetimeStr.split("•").map((s) => s.trim());
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const combined = `${datePart} ${timePart}`;
      const parsed = new Date(combined);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const d = new Date(datetimeStr);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // fallback
  }
  return new Date();
}

export default function InterviewSchedulePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isCandidate = user?.role === "user";

  // Tab state: exactly 3 tabs (Kanban Board, Calendar, Timeline)
  const [activeTab, setActiveTab] = useState<"kanban" | "calendar" | "timeline">("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Categories");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);

  // Recruiter-created interviews state (fetched from backend or initial recruiter list)
  const [backendInterviews, setBackendInterviews] = useState<CandidateInterview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<CandidateInterview | null>(null);
  const [lockedModalInterview, setLockedModalInterview] = useState<CandidateInterview | null>(null);
  const [newInterviewAlert, setNewInterviewAlert] = useState<string | null>(null);

  // Calendar specific state
  const today = useMemo(() => new Date(), []);
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(today.toISOString().slice(0, 10));

  // Handle Join Interview
  const handleJoinInterview = (interview: CandidateInterview) => {
    const eligibility = checkJoinEligibility(interview.date, interview.time);
    if (!eligibility.canJoin) {
      setLockedModalInterview(interview);
      return;
    }

    // Google Meet / Zoom -> Open external link in a new browser tab without WebRTC
    if (
      interview.platform === "Google Meet" ||
      interview.platform === "Zoom" ||
      (interview.meetingLink && interview.meetingLink.startsWith("http"))
    ) {
      const targetUrl =
        interview.meetingLink && interview.meetingLink.startsWith("http")
          ? interview.meetingLink
          : interview.platform === "Google Meet"
          ? `https://meet.google.com/lgi-${interview.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`
          : `https://zoom.us/j/${interview.id.replace(/[^0-9]/g, "").padEnd(10, "0")}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // LetGetIn Room -> Open existing LetGetIn Video Interview Suite inside the platform
    router.push(`/interviews/ai-practice?interviewId=${encodeURIComponent(interview.id)}`);
  };

  // Load recruiter-scheduled interviews from existing backend service
  const loadInterviews = useCallback(async () => {
    try {
      const data = await interviewService.getInterviews();
      if (data && data.length > 0) {
        const mapped: CandidateInterview[] = data.map((item) => ({
          id: item._id || item.id || `inv-${Date.now()}`,
          candidateName: item.candidateName,
          candidateEmail: item.candidateEmail,
          position: item.position || "Candidate",
          department: item.department || "Engineering",
          roundName: item.roundName || "Technical Interview",
          title: item.roundName || "Technical Interview",
          stage: item.stage,
          date: item.date,
          time: item.time,
          datetime: `${item.date} • ${item.time}`,
          durationMinutes: item.durationMinutes || 45,
          duration: `${item.durationMinutes || 45} mins`,
          interviewers: item.interviewers || [{ name: "Hiring Team", role: "Interviewer" }],
          interviewerName: item.interviewers?.[0]?.name || "Hiring Team",
          platform: item.platform || "LetGetIn Room",
          meetingLink: item.meetingLink || `/interviews/ai-practice?interviewId=${item._id || item.id}`,
          score: item.score,
          category: "Technical",
          notes: item.feedbackNotes || "",
        }));

        setBackendInterviews((prev) => {
          if (prev.length > 0 && mapped.length > prev.length) {
            const newlyAdded = mapped[0];
            if (newlyAdded) {
              setNewInterviewAlert(`New Interview Scheduled: ${newlyAdded.position} on ${newlyAdded.date} at ${newlyAdded.time}`);
            }
          }
          return mapped;
        });
      }
    } catch {
      // Fallback to initial recruiter interviews if backend not reachable
    }
  }, []);

  useEffect(() => {
    loadInterviews();
    // Auto polling every 10 seconds and on window focus/storage events for instant sync between recruiter and candidate tabs
    const interval = setInterval(loadInterviews, 10000);
    const handleFocus = () => loadInterviews();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "letgetin_interviews_sync" || !e.key) {
        loadInterviews();
      }
    };
    const handleCustom = () => loadInterviews();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("letgetin_interview_scheduled", handleCustom);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("letgetin_interview_scheduled", handleCustom);
    };
  }, [loadInterviews]);

  // Master list of recruiter-created interviews
  const allInterviews = useMemo(() => {
    return backendInterviews.length > 0 ? backendInterviews : INITIAL_RECRUITER_INTERVIEWS;
  }, [backendInterviews]);

  // Candidate filtering: Candidate sees interviews scheduled for their account
  const candidateInterviews = useMemo(() => {
    if (isCandidate && user) {
      const email = user.email?.toLowerCase();
      const name = (user.fullName || user.username || "").toLowerCase();
      const userMatches = allInterviews.filter((inv) => {
        const emailMatch = email && inv.candidateEmail?.toLowerCase() === email;
        const nameMatch = name && inv.candidateName?.toLowerCase().includes(name);
        return emailMatch || nameMatch;
      });
      // If user has direct scheduled interviews, display their assigned interviews;
      // otherwise, display recruiter interviews in candidate recipient mode for evaluation.
      return userMatches.length > 0 ? userMatches : allInterviews;
    }
    return allInterviews;
  }, [allInterviews, isCandidate, user]);

  // Derived 4 stat cards metrics for the candidate
  const candidateMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const total = candidateInterviews.length;
    const todayCount = candidateInterviews.filter(
      (i) => i.date === todayStr || i.stage === "today"
    ).length;
    const pendingFeedback = candidateInterviews.filter(
      (i) => i.stage === "feedback_pending"
    ).length;
    const completedCount = candidateInterviews.filter(
      (i) => i.stage === "completed"
    ).length;

    return { total, todayCount, pendingFeedback, completedCount };
  }, [candidateInterviews]);

  // Unified filtered interviews (shared across Kanban, Calendar, and Timeline)
  const filteredInterviews = useMemo(() => {
    return candidateInterviews.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewers.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategoryFilter === "All Categories" ||
        item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [candidateInterviews, searchQuery, selectedCategoryFilter]);

  // Chronologically sorted tasks for PRESERVED Timeline view
  const sortedTimelineTasks = useMemo(() => {
    return [...filteredInterviews].sort((a, b) => {
      const dateA = parseInterviewDate(a.datetime).getTime();
      const dateB = parseInterviewDate(b.datetime).getTime();
      return dateA - dateB;
    });
  }, [filteredInterviews]);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: true });
    }

    // Next month leading days to complete full weeks
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      days.push({ dayNumber: day, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [calendarYear, calendarMonth]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Interviews on the selected date in Calendar view
  const selectedDayInterviews = useMemo(() => {
    return filteredInterviews.filter((item) => item.date === selectedDateStr);
  }, [filteredInterviews, selectedDateStr]);

  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  const getRoundBadgeStyle = (roundName: string) => {
    const r = roundName.toLowerCase();
    if (r.includes("round 1") || r.includes("screening")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/40";
    }
    if (r.includes("round 2") || r.includes("code") || r.includes("architecture")) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40";
    }
    if (r.includes("culture") || r.includes("fit")) {
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/40";
    }
    if (r.includes("executive") || r.includes("portfolio")) {
      return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300/40";
    }
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40";
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case "Technical":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40";
      case "Strategic":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40";
      case "Hiring":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/40";
      case "Operational":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/40";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/40";
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in text-ink">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Interview Schedule
            </h1>
            <span className="text-xs font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full shadow-xs">
              {filteredInterviews.length} {filteredInterviews.length === 1 ? "Interview" : "Interviews"}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Candidate View</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft">
            View and join your upcoming scheduled interviews, meeting links, and interview stages
          </p>
        </div>
      </div>

      {/* Real-time Recruiter Schedule Alert Toast */}
      {newInterviewAlert && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold block">{newInterviewAlert}</span>
              <span className="text-[11px] opacity-80">You can join the live room 15 minutes before the start time.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewInterviewAlert(null)}
            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Candidate Metrics Row (4 Summary Cards matching recruiter reference) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Upcoming Interviews */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Upcoming Interviews
            </div>
            <div className="text-2xl font-black text-ink mt-0.5">{candidateMetrics.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Today's Interviews */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Today's Interviews
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {candidateMetrics.todayCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Feedback Pending */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Feedback Pending
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {candidateMetrics.pendingFeedback}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Interviews Completed */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Interviews Completed
            </div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
              {candidateMetrics.completedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Top Navigation View Switcher (Kanban Board, Calendar, Timeline) */}
      <div className="bg-surface border border-border rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 w-fit select-none flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("kanban")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "kanban"
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Kanban Board</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "calendar"
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "timeline"
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </button>
      </div>

      {/* 3. Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, interview title, or interviewer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-surface border border-border rounded-full text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-primary-glow focus:ring-1 focus:ring-primary-glow shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-ink-soft font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Category:
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-ink hover:border-primary-glow/60 shadow-xs transition-all cursor-pointer"
            >
              <span>{selectedCategoryFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                {["All Categories", "Technical", "Strategic", "Hiring", "Operational"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? "bg-primary/10 text-primary-glow font-bold"
                        : "text-ink hover:bg-surface-alt"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategoryFilter === cat && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TAB CONTENT: 1. CANDIDATE KANBAN (Based on recruiter Kanban reference) */}
      {activeTab === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-2">
          {KANBAN_STAGES.map((col) => {
            const columnInterviews = filteredInterviews.filter((inv) => inv.stage === col.id);
            const totalInStage = columnInterviews.length;

            return (
              <div
                key={col.id}
                className="bg-surface border border-border rounded-3xl p-4 shadow-sm space-y-3.5 min-h-[520px] flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h2 className="text-xs font-bold text-ink leading-tight">{col.title}</h2>
                    </div>
                    <span className="text-[11px] font-extrabold text-ink-soft bg-surface-alt px-2 py-0.5 rounded-full border border-border">
                      {totalInStage}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    {columnInterviews.length === 0 ? (
                      <div className="py-8 text-center rounded-2xl border border-dashed border-border text-xs text-ink-soft/70">
                        No interviews
                      </div>
                    ) : (
                      columnInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          onClick={() => setSelectedInterview(interview)}
                          className="bg-surface border border-border/80 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-primary-glow/40 transition-all space-y-2.5 cursor-pointer group"
                        >
                          {/* Top row: Candidate Name & Round Badge */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold text-ink leading-tight group-hover:text-primary-glow transition-colors truncate">
                                {interview.candidateName}
                              </h3>
                              <p className="text-[11px] text-ink-soft truncate mt-0.5">
                                {interview.position}
                              </p>
                            </div>
                            <span
                              className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getRoundBadgeStyle(
                                interview.roundName
                              )}`}
                            >
                              {interview.roundName.includes(":") ? interview.roundName.split(":")[0] : interview.roundName}
                            </span>
                          </div>

                          {/* Date & Time pill */}
                          <div className="flex items-center gap-2 text-[11px] text-ink-soft bg-surface-alt/60 px-2.5 py-1.5 rounded-xl border border-border/40">
                            <Clock className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                            <span className="font-semibold text-ink">{interview.date}</span>
                            <span>•</span>
                            <span className="font-bold text-ink">{interview.time}</span>
                            {interview.durationMinutes && (
                              <span className="text-[10px] text-ink-soft">({interview.durationMinutes}m)</span>
                            )}
                          </div>

                          {/* Interviewer row */}
                          <div className="flex items-center justify-between gap-1 text-[11px] text-ink-soft pt-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                              <span className="truncate">{interview.interviewerName}</span>
                            </div>
                            {interview.platform && (
                              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                {interview.platform}
                              </span>
                            )}
                          </div>

                          {/* Score badge if completed or feedback pending */}
                          {interview.score && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                              <span>Score: {interview.score} / 5.0</span>
                              <span className="ml-auto text-[9px] uppercase tracking-wider">APPROVED</span>
                            </div>
                          )}

                          {/* Bottom Action: Join Link */}
                          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                            {(() => {
                              const eligibility = checkJoinEligibility(interview.date, interview.time);
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinInterview(interview);
                                  }}
                                  className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    eligibility.canJoin
                                      ? "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                      : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                  }`}
                                  title={eligibility.countdownText}
                                >
                                  {eligibility.canJoin ? (
                                    <Video className="w-3.5 h-3.5" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                  <span>{eligibility.canJoin ? "Join" : eligibility.label}</span>
                                </button>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={() => setSelectedInterview(interview)}
                              className="p-1 text-ink-soft hover:text-ink rounded-lg transition"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TAB CONTENT: 2. CANDIDATE CALENDAR (Based on recruiter Calendar reference) */}
      {activeTab === "calendar" && (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-elegant space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-border hover:bg-surface-alt transition cursor-pointer text-ink"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-ink">
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </h2>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-border hover:bg-surface-alt transition cursor-pointer text-ink"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="ml-2 px-3 py-1 rounded-xl text-xs font-semibold border border-border hover:bg-surface-alt transition cursor-pointer text-ink"
              >
                Today
              </button>
            </div>

            <span className="text-xs font-bold text-primary-glow bg-primary/10 px-3 py-1 rounded-full border border-primary/20 self-start sm:self-auto">
              {filteredInterviews.length} Scheduled Sessions
            </span>
          </div>

          {/* 2-Column Calendar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side: Month Grid */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-ink-soft uppercase tracking-wider pb-2 border-b border-border/60">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayObj, idx) => {
                  const isSelected = dayObj.dateStr === selectedDateStr;
                  const isTodayDate = dayObj.dateStr === today.toISOString().slice(0, 10);
                  const dayInterviews = filteredInterviews.filter((item) => item.date === dayObj.dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(dayObj.dateStr)}
                      className={`p-2 rounded-2xl border transition-all flex flex-col justify-between min-h-[95px] text-left cursor-pointer ${
                        isSelected
                          ? "border-primary-glow ring-2 ring-primary-glow/40 bg-primary/5"
                          : dayObj.isCurrentMonth
                          ? "border-border bg-surface hover:border-primary/40"
                          : "border-border/40 bg-surface-alt/20 opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isTodayDate ? "text-primary-glow font-extrabold" : "text-ink"}`}>
                          {dayObj.dayNumber}
                        </span>
                        {dayInterviews.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>

                      {dayInterviews.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayInterviews.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 truncate"
                            >
                              {item.roundName || item.candidateName}
                            </div>
                          ))}
                          {dayInterviews.length > 2 && (
                            <span className="text-[9px] text-ink-soft">+{dayInterviews.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Selected Day Schedule Panel */}
            <div className="lg:col-span-5 xl:col-span-4 bg-surface-alt/40 border border-border rounded-3xl p-5 space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-ink">{formattedSelectedDate}</h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  {selectedDayInterviews.length} {selectedDayInterviews.length === 1 ? "interview scheduled" : "interviews scheduled"}
                </p>
              </div>

              {selectedDayInterviews.length === 0 ? (
                <div className="py-12 text-center text-xs text-ink-soft">
                  No interviews scheduled for this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayInterviews.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInterview(item)}
                      className="bg-surface border border-border hover:border-primary-glow/40 p-4 rounded-2xl transition-all shadow-xs space-y-2.5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-ink">{item.candidateName}</h4>
                          <p className="text-xs text-ink-soft">{item.position}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                          {item.time}
                        </span>
                      </div>

                      <div className="text-xs text-ink-soft space-y-1">
                        <div>
                          Round: <span className="font-semibold text-ink">{item.roundName}</span>
                        </div>
                        {item.interviewers?.length > 0 && (
                          <div>
                            Panel: <span className="text-ink">{item.interviewers.map((i) => i.name).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/50 flex justify-end">
                        {(() => {
                          const eligibility = checkJoinEligibility(item.date, item.time);
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinInterview(item);
                              }}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                                eligibility.canJoin
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                              }`}
                              title={eligibility.countdownText}
                            >
                              {eligibility.canJoin ? (
                                <Video className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                              <span>{eligibility.canJoin ? "Join" : eligibility.label}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: 3. CANDIDATE TIMELINE (PRESERVED - UNCHANGED) */}
      {activeTab === "timeline" && (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-elegant space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary-glow">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Chronological Interview Timeline</h2>
                <p className="text-xs text-ink-soft">Sequenced from earliest to latest based on actual schedule date and time</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-ink-soft bg-surface-alt px-3 py-1 rounded-full border border-border">
              {sortedTimelineTasks.length} Scheduled Events
            </span>
          </div>

          {sortedTimelineTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-soft">
              No interviews scheduled matching your search or filters.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
              {sortedTimelineTasks.map((task) => (
                <div key={task.id} className="relative group">
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full ring-4 ring-surface shadow-xs transition-transform group-hover:scale-125 ${
                      task.stage === "completed"
                        ? "bg-emerald-500"
                        : task.stage === "today"
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                  />

                  {/* Card container */}
                  <div
                    onClick={() => setSelectedInterview(task)}
                    className="bg-surface border border-border hover:border-primary-glow/40 p-5 rounded-2xl transition-all space-y-3 cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-ink group-hover:text-primary-glow transition-colors">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(task.category)}`}>
                            {task.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              task.stage === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : task.stage === "today"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {task.stage.replace("_", " ")}
                          </span>
                          {task.duration && (
                            <span className="text-[11px] text-ink-soft flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const eligibility = checkJoinEligibility(task.date, task.time);
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinInterview(task);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 self-start sm:self-auto cursor-pointer shadow-sm ${
                              eligibility.canJoin
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                            }`}
                            title={eligibility.countdownText}
                          >
                            {eligibility.canJoin ? (
                              <Video className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            <span>{eligibility.canJoin ? "Join Video Round" : eligibility.label}</span>
                          </button>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-ink-soft">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium text-ink">
                          <User className="w-3.5 h-3.5 text-primary-glow" /> Candidate: {task.candidateName}
                        </span>
                        {task.interviewerName && (
                          <span className="flex items-center gap-1.5 text-ink-soft">
                            Interviewer: <strong className="text-ink font-medium">{task.interviewerName}</strong>
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1.5 font-semibold text-ink">
                        <CalendarDays className="w-3.5 h-3.5 text-primary-glow" /> {task.datetime}
                      </span>
                    </div>

                    {task.notes && (
                      <div className="p-2.5 rounded-xl bg-surface-alt/60 text-xs text-ink-soft/90 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-ink-soft shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{task.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. INTERVIEW DETAILS MODAL (Candidate View) */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-surface border border-white/20 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-elegant space-y-5 text-ink animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary-glow font-bold text-sm">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Interview Session Details</h2>
                  <p className="text-xs text-ink-soft">Scheduled by your recruiter panel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-ink">{selectedInterview.roundName}</h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getRoundBadgeStyle(
                      selectedInterview.roundName
                    )}`}
                  >
                    {selectedInterview.position}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
                  <span>Status:</span>
                  <span className="capitalize px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    {selectedInterview.stage.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-alt/50 border border-border text-xs">
                <div>
                  <span className="text-ink-soft block mb-0.5">Candidate</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-glow" /> {selectedInterview.candidateName}
                  </span>
                  {selectedInterview.candidateEmail && (
                    <span className="text-[11px] text-ink-soft block mt-0.5">{selectedInterview.candidateEmail}</span>
                  )}
                </div>

                <div>
                  <span className="text-ink-soft block mb-0.5">Interviewer Panel</span>
                  <span className="font-bold text-ink">
                    {selectedInterview.interviewers.map((i) => i.name).join(", ") || "Hiring Team"}
                  </span>
                </div>

                <div>
                  <span className="text-ink-soft block mb-0.5">Scheduled Date & Time</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary-glow" /> {selectedInterview.date} • {selectedInterview.time}
                  </span>
                </div>

                <div>
                  <span className="text-ink-soft block mb-0.5">Duration & Platform</span>
                  <span className="font-bold text-ink">
                    {selectedInterview.durationMinutes} mins ({selectedInterview.platform})
                  </span>
                </div>
              </div>

              {/* Video Meeting Call to Action */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Video Interview Meeting
                  </span>
                  <p className="text-[11px] text-ink-soft">Join inside LetGetIn Video Interview Suite</p>
                </div>
                {(() => {
                  const eligibility = checkJoinEligibility(selectedInterview.date, selectedInterview.time);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        handleJoinInterview(selectedInterview);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        eligibility.canJoin
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                      }`}
                      title={eligibility.countdownText}
                    >
                      {eligibility.canJoin ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                      <span>{eligibility.canJoin ? "Join Interview" : eligibility.label}</span>
                    </button>
                  );
                })()}
              </div>

              {/* Evaluation score if provided */}
              {selectedInterview.score && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      Overall Score: {selectedInterview.score} / 5.0
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                    APPROVED
                  </span>
                </div>
              )}

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-soft uppercase tracking-wider">Preparation / Notes</label>
                  <div className="p-3 rounded-xl bg-surface-alt border border-border text-xs text-ink whitespace-pre-wrap">
                    {selectedInterview.notes}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b1e38] text-white text-xs font-bold transition hover:bg-[#15325b] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. INTERVIEW ROOM LOCKED MODAL (Friendly 15-minute restriction message) */}
      {lockedModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-amber-500/30 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-elegant space-y-4 text-ink animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setLockedModalInterview(null)}
                className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-ink">Interview Room Locked</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Your interview for <strong className="text-ink">{lockedModalInterview.position}</strong> ({lockedModalInterview.roundName}) is scheduled for:
              </p>
              <div className="p-3 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{lockedModalInterview.date} at {lockedModalInterview.time}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <span>Your live video room will automatically unlock <strong>15 minutes</strong> before the scheduled interview time.</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLockedModalInterview(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
