import { create } from "zustand";

export type CalendarItemType = "task" | "event";
export type CalendarPriority = "urgent" | "high" | "medium" | "low";
export type CalendarStatus = "todo" | "in_progress" | "done";
export type CalendarColorTheme = "green" | "teal" | "blue" | "slate";

export interface CalendarSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CalendarProject {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface CalendarParticipant {
  name: string;
  isMe?: boolean;
  avatar?: string;
}

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  description?: string;
  date: string | null; // YYYY-MM-DD or null if in Waiting List
  startTime?: string; // e.g. "11:00"
  endTime?: string; // e.g. "12:00"
  durationMinutes: number; // e.g. 15, 30, 45, 60, 90
  status: CalendarStatus;
  priority: CalendarPriority;
  projectId: string;
  themeColor?: CalendarColorTheme;
  iconEmoji?: string;
  workspaceName?: string;
  participants?: CalendarParticipant[];
  repeats?: boolean;
  assignee: {
    name: string;
    avatar?: string;
    role?: string;
  };
  subtasks: CalendarSubtask[];
  meetingLink?: string;
  location?: string;
  createdAt: string;
}

export const DEFAULT_PROJECTS: CalendarProject[] = [
  {
    id: "recruitment",
    name: "Talent & Hiring",
    color: "#3b82f6",
    badgeBg: "bg-blue-500/15 border-blue-500/30",
    badgeText: "text-blue-500",
  },
  {
    id: "campus",
    name: "Campus Drives",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500/15 border-purple-500/30",
    badgeText: "text-purple-500",
  },
  {
    id: "engineering",
    name: "Product & Tech",
    color: "#10b981",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    badgeText: "text-emerald-500",
  },
  {
    id: "growth",
    name: "Growth & Marketing",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-500",
  },
  {
    id: "funding",
    name: "Fundraising & VCs",
    color: "#06b6d4",
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    badgeText: "text-cyan-500",
  },
  {
    id: "ops",
    name: "Operations & HR",
    color: "#ec4899",
    badgeBg: "bg-pink-500/15 border-pink-500/30",
    badgeText: "text-pink-500",
  },
];

const INITIAL_ITEMS: CalendarItem[] = [
  // --- WAITING LIST (Unscheduled) ---
  {
    id: "wl-1",
    type: "task",
    title: "Draft Q4 Campus Placement MOU with Microsoft India",
    description: "Prepare standard university recruiter partner agreement and room allotment terms.",
    date: null,
    durationMinutes: 60,
    status: "todo",
    priority: "high",
    projectId: "campus",
    themeColor: "teal",
    iconEmoji: "🤝",
    assignee: { name: "Sarah Johnson", role: "TPO Lead" },
    subtasks: [
      { id: "st-1", title: "Review standard legal terms", completed: true },
      { id: "st-2", title: "Confirm auditorium capacity (500 pax)", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wl-2",
    type: "task",
    title: "Review Senior Backend Engineer candidate assessments",
    description: "Score Node.js / distributed systems code challenges for top 5 candidates.",
    date: null,
    durationMinutes: 45,
    status: "todo",
    priority: "medium",
    projectId: "recruitment",
    themeColor: "blue",
    iconEmoji: "💻",
    assignee: { name: "Amal Benny", role: "Tech Lead" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wl-startup-1",
    type: "task",
    title: "Update Seed Round Data Room & Cap Table Model",
    description: "Peak XV requested technical IP breakdown and unit economics sheet for $2M seed raise.",
    date: null,
    durationMinutes: 60,
    status: "todo",
    priority: "urgent",
    projectId: "funding",
    themeColor: "green",
    iconEmoji: "📊",
    assignee: { name: "Co-Founder", role: "CEO" },
    subtasks: [
      { id: "st-f1", title: "Update ARR churn curves", completed: true },
      { id: "st-f2", title: "Upload patent disclosures", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },

  // --- WEDNESDAY (2026-09-09) ---
  {
    id: "item-wed-1",
    type: "task",
    title: "Plan your week",
    description: "Map key milestones, interviews, and sprint goals.",
    date: "2026-09-09",
    durationMinutes: 30,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🗓️",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-2",
    type: "task",
    title: "Download mobile app on your phone",
    description: "Install LetGetIn mobile suite for instant recruitment alerts.",
    date: "2026-09-09",
    durationMinutes: 15,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "teal",
    iconEmoji: "📲",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-3",
    type: "task",
    title: "Watch a 2-min video: How to be productive",
    description: "Quick walkthrough of time blocking and capacity scheduling.",
    date: "2026-09-09",
    durationMinutes: 20,
    status: "todo",
    priority: "low",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🎬",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-4",
    type: "task",
    title: "Do a mind sweep: Write down all your to-dos",
    description: "Capture loose backlog items into Waiting List.",
    date: "2026-09-09",
    durationMinutes: 45,
    status: "todo",
    priority: "high",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🧠",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-5",
    type: "task",
    title: "Connect your Google Calendar",
    description: "Two-way synchronization for candidate interview invites.",
    date: "2026-09-09",
    durationMinutes: 15,
    status: "todo",
    priority: "medium",
    projectId: "recruitment",
    themeColor: "teal",
    iconEmoji: "🔗",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- THURSDAY (2026-09-10 - TODAY) ---
  {
    id: "item-thu-1",
    type: "task",
    title: "Add birthday & holiday reminders",
    description: "Keep workforce and team milestones synchronized.",
    date: "2026-09-10",
    durationMinutes: 30,
    status: "todo",
    priority: "low",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🎂",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-2",
    type: "task",
    title: "Create recurring tasks and events",
    description: "Automate bi-weekly sprint standups and reports.",
    date: "2026-09-10",
    durationMinutes: 20,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    themeColor: "teal",
    iconEmoji: "🔁",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-3",
    type: "task",
    title: "Set up daily habit reminders",
    description: "Calendar notifications 10 mins before candidate calls.",
    date: "2026-09-10",
    durationMinutes: 15,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "teal",
    iconEmoji: "🔔",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-4",
    type: "task",
    title: "Upload your profile picture",
    description: "Personalize your recruiter and placement profile avatar.",
    date: "2026-09-10",
    durationMinutes: 10,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "teal",
    iconEmoji: "👤",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-5",
    type: "task",
    title: "Operations & team sync",
    description: "Synchronize weekly placement drive allocations.",
    date: "2026-09-10",
    durationMinutes: 25,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    themeColor: "teal",
    iconEmoji: "⚙️",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-6",
    type: "event",
    title: "Seed Round Partner Intro: Lightspeed India",
    description: "Introductory pitch call regarding autonomous agent recruitment architecture.",
    date: "2026-09-10",
    startTime: "11:00",
    endTime: "12:00",
    durationMinutes: 60,
    status: "todo",
    priority: "urgent",
    projectId: "funding",
    themeColor: "teal",
    iconEmoji: "🚀",
    workspaceName: "Personal Workspace",
    location: "Google Meet",
    meetingLink: "https://meet.google.com/ls-seed-pitch",
    participants: [{ name: "Me", isMe: true }, { name: "Hemant M." }],
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- FRIDAY (2026-09-11) ---
  {
    id: "item-fri-1",
    type: "task",
    title: "Declutter your space",
    description: "Clean desk and organize drive documentation folders.",
    date: "2026-09-11",
    durationMinutes: 30,
    status: "todo",
    priority: "low",
    projectId: "ops",
    themeColor: "blue",
    iconEmoji: "🏡",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-fri-2",
    type: "task",
    title: "Set your personal and professional goals",
    description: "Define placement targets and quarter headcount milestones.",
    date: "2026-09-11",
    durationMinutes: 30,
    status: "todo",
    priority: "high",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🎯",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-fri-3",
    type: "task",
    title: "Buy a gift for your s/o",
    description: "Personal reminder.",
    date: "2026-09-11",
    durationMinutes: 15,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "blue",
    iconEmoji: "🎁",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-fri-4",
    type: "task",
    title: "Define your key time wasters & distractions and remove them",
    description: "Audit calendar meetings and streamline candidate review loops.",
    date: "2026-09-11",
    durationMinutes: 45,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🥞",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-fri-5",
    type: "event",
    title: "Google India Super Dream Placement Drive Kickoff",
    description: "Campus drive presentation in Grand Auditorium.",
    date: "2026-09-11",
    startTime: "02:00",
    endTime: "03:30",
    durationMinutes: 90,
    status: "todo",
    priority: "urgent",
    projectId: "campus",
    themeColor: "green",
    iconEmoji: "🏢",
    location: "Grand Auditorium",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- SATURDAY (2026-09-12) ---
  {
    id: "item-sat-1",
    type: "task",
    title: "Create projects for every idea you have and add tasks there",
    description: "Organize hiring roadmap and campus drive collateral.",
    date: "2026-09-12",
    durationMinutes: 30,
    status: "todo",
    priority: "medium",
    projectId: "engineering",
    themeColor: "green",
    iconEmoji: "💼",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sat-2",
    type: "task",
    title: "Try home exercising in the morning",
    description: "30 min workout and stretch routine.",
    date: "2026-09-12",
    durationMinutes: 30,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "blue",
    iconEmoji: "🏋️",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sat-3",
    type: "task",
    title: "Read a book in the evening",
    description: "Read 2 chapters on high-velocity team leadership.",
    date: "2026-09-12",
    durationMinutes: 45,
    status: "todo",
    priority: "low",
    projectId: "growth",
    themeColor: "blue",
    iconEmoji: "📕",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sat-4",
    type: "task",
    title: "Turn on \"Don't disturb mode\" on your phone at night",
    description: "Sleep hygiene routine.",
    date: "2026-09-12",
    durationMinutes: 10,
    status: "todo",
    priority: "low",
    projectId: "ops",
    themeColor: "green",
    iconEmoji: "🌙",
    assignee: { name: "Me" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

interface CalendarStore {
  items: CalendarItem[];
  projects: CalendarProject[];
  waitingListOpen: boolean;
  selectedDate: string; // YYYY-MM-DD
  viewMode: "week" | "day" | "month" | "board";
  selectedProjectId: string | "all";
  selectedPriority: string | "all";
  hideCompleted: boolean;
  searchQuery: string;
  activeItemId: string | null;
  toolsTab: "calendar" | "tasks" | "notes";
  toolsSidebarOpen: boolean;

  // Actions
  setWaitingListOpen: (open: boolean) => void;
  toggleWaitingList: () => void;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: "week" | "day" | "month" | "board") => void;
  setSelectedProjectId: (id: string | "all") => void;
  setSelectedPriority: (p: string | "all") => void;
  setHideCompleted: (hide: boolean) => void;
  setSearchQuery: (query: string) => void;
  setActiveItemId: (id: string | null) => void;
  setToolsTab: (tab: "calendar" | "tasks" | "notes") => void;
  setToolsSidebarOpen: (open: boolean) => void;
  toggleToolsSidebar: () => void;

  // CRUD
  addItem: (item: Omit<CalendarItem, "id" | "createdAt">) => CalendarItem;
  updateItem: (id: string, updates: Partial<CalendarItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemDone: (id: string) => void;
  moveItemDate: (id: string, targetDate: string | null) => void;
  toggleSubtask: (itemId: string, subtaskId: string) => void;
  addSubtask: (itemId: string, title: string) => void;
  deleteSubtask: (itemId: string, subtaskId: string) => void;
}

const STORAGE_KEY = "letgetin_planner_items_v2";

function loadSavedItems(): CalendarItem[] {
  if (typeof window !== "undefined") {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("letgetin_planner_items_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }
  return INITIAL_ITEMS;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  items: loadSavedItems(),
  projects: DEFAULT_PROJECTS,
  waitingListOpen: true,
  selectedDate: "2026-09-10",
  viewMode: "week",
  selectedProjectId: "all",
  selectedPriority: "all",
  hideCompleted: false,
  searchQuery: "",
  activeItemId: null,
  toolsTab: "calendar",
  toolsSidebarOpen: true,

  setWaitingListOpen: (open) => set({ waitingListOpen: open }),
  toggleWaitingList: () => set((s) => ({ waitingListOpen: !s.waitingListOpen })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedPriority: (selectedPriority) => set({ selectedPriority }),
  setHideCompleted: (hideCompleted) => set({ hideCompleted }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveItemId: (activeItemId) => set({ activeItemId }),
  setToolsTab: (toolsTab) => set({ toolsTab }),
  setToolsSidebarOpen: (toolsSidebarOpen) => set({ toolsSidebarOpen }),
  toggleToolsSidebar: () => set((s) => ({ toolsSidebarOpen: !s.toolsSidebarOpen })),

  addItem: (data) => {
    const newItem: CalendarItem = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newItem, ...state.items];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
    return newItem;
  },

  updateItem: (id, updates) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  deleteItem: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated, activeItemId: state.activeItemId === id ? null : state.activeItemId };
    });
  },

  toggleItemDone: (id) => {
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: CalendarStatus = item.status === "done" ? "todo" : "done";
        return { ...item, status: nextStatus };
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  moveItemDate: (id, targetDate) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, date: targetDate } : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  toggleSubtask: (itemId, subtaskId) => {
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.id !== itemId) return item;
        const subtasks = item.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...item, subtasks };
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  addSubtask: (itemId, title) => {
    if (!title.trim()) return;
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.id !== itemId) return item;
        const newSub: CalendarSubtask = {
          id: `st-${Date.now()}`,
          title: title.trim(),
          completed: false,
        };
        return { ...item, subtasks: [...item.subtasks, newSub] };
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  deleteSubtask: (itemId, subtaskId) => {
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          subtasks: item.subtasks.filter((st) => st.id !== subtaskId),
        };
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { items: updated };
    });
  },
}));
