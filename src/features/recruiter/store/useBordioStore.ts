import { create } from "zustand";

export type BordioItemType = "task" | "event";
export type BordioPriority = "urgent" | "high" | "medium" | "low";
export type BordioStatus = "todo" | "in_progress" | "done";

export interface BordioSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BordioProject {
  id: string;
  name: string;
  color: string; // Tailwind color or hex
  badgeBg: string;
  badgeText: string;
}

export interface BordioItem {
  id: string;
  type: BordioItemType;
  title: string;
  description?: string;
  date: string | null; // YYYY-MM-DD or null if in Waiting List
  startTime?: string; // e.g. "10:00 AM"
  endTime?: string; // e.g. "11:30 AM"
  durationMinutes: number; // e.g. 30, 45, 60, 90, 120
  status: BordioStatus;
  priority: BordioPriority;
  projectId: string;
  assignee: {
    name: string;
    avatar?: string;
    role?: string;
  };
  subtasks: BordioSubtask[];
  meetingLink?: string;
  location?: string;
  createdAt: string;
}

export const DEFAULT_PROJECTS: BordioProject[] = [
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

const INITIAL_ITEMS: BordioItem[] = [
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
    assignee: { name: "Amal Benny", role: "Tech Lead" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wl-3",
    type: "task",
    title: "Design student placement brochure 2026-27 edition",
    description: "Include placement stats, top visiting companies, and faculty research highlights.",
    date: null,
    durationMinutes: 90,
    status: "todo",
    priority: "low",
    projectId: "growth",
    assignee: { name: "Maya Chen", role: "Designer" },
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
    assignee: { name: "Co-Founder", role: "CEO" },
    subtasks: [
      { id: "st-f1", title: "Update ARR churn curves", completed: true },
      { id: "st-f2", title: "Upload patent disclosures", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },

  // --- MONDAY ---
  {
    id: "item-mon-1",
    type: "event",
    title: "Weekly All-Hands & Sprint Planning",
    description: "Review recruitment velocity, open requisitions, and weekly team capacity.",
    date: "2026-09-07",
    startTime: "09:30 AM",
    endTime: "10:30 AM",
    durationMinutes: 60,
    status: "done",
    priority: "high",
    projectId: "ops",
    assignee: { name: "Alex Rivera", role: "Team Lead" },
    meetingLink: "https://meet.google.com/abc-defg-hij",
    location: "Main Boardroom / Virtual",
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-mon-2",
    type: "task",
    title: "Screen 25 Inbound Applications for SDE-1",
    description: "Shortlist candidates meeting CGPA > 8.0 criteria and strong React / Node experience.",
    date: "2026-09-07",
    durationMinutes: 60,
    status: "done",
    priority: "urgent",
    projectId: "recruitment",
    assignee: { name: "Sarah Johnson", role: "Recruiter" },
    subtasks: [
      { id: "st-m1", title: "Batch export resumes", completed: true },
      { id: "st-m2", title: "Send assessment links", completed: true },
    ],
    createdAt: new Date().toISOString(),
  },

  // --- TUESDAY ---
  {
    id: "item-tue-1",
    type: "event",
    title: "Campus Drive Kickoff: Google India Tech Talk",
    description: "Orientation keynote for 2026 engineering batch in Auditorium 1.",
    date: "2026-09-08",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    durationMinutes: 90,
    status: "done",
    priority: "urgent",
    projectId: "campus",
    assignee: { name: "Dr. Anita Sharma", role: "Dean" },
    location: "Grand Auditorium",
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-tue-2",
    type: "task",
    title: "Verify Student Academic Dossiers & Backlog Clearances",
    description: "Audit CSV registry against university controller of examinations record.",
    date: "2026-09-08",
    durationMinutes: 75,
    status: "done",
    priority: "high",
    projectId: "campus",
    assignee: { name: "Amal Benny", role: "Coordinator" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- WEDNESDAY (TODAY) ---
  {
    id: "item-wed-1",
    type: "event",
    title: "Executive Interview Round with Lead Product Architect",
    description: "Final behavioral & systems architecture review for Finalist candidate Priya Sharma.",
    date: "2026-09-09",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    durationMinutes: 60,
    status: "todo",
    priority: "urgent",
    projectId: "recruitment",
    assignee: { name: "Alex Rivera", role: "Interviewer" },
    meetingLink: "https://meet.google.com/xyz-uvwx-rst",
    subtasks: [
      { id: "st-w1", title: "Review interview questions", completed: true },
      { id: "st-w2", title: "Submit feedback rubric", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-2",
    type: "task",
    title: "Publish 4 Job Listings on Campus Portal",
    description: "GET - DevOps, Frontend React Engineer, Product Analyst, Data Scientist.",
    date: "2026-09-09",
    durationMinutes: 45,
    status: "in_progress",
    priority: "high",
    projectId: "recruitment",
    assignee: { name: "Sarah Johnson", role: "Recruiter" },
    subtasks: [
      { id: "st-w3", title: "Draft JD specs", completed: true },
      { id: "st-w4", title: "Set eligibility cutoffs", completed: true },
      { id: "st-w5", title: "Publish live", completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-3",
    type: "task",
    title: "Synchronize Calendar Bookings with TPO Boardroom",
    description: "Ensure no schedule clashes for tomorrow's visiting corporate interview panels.",
    date: "2026-09-09",
    durationMinutes: 30,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    assignee: { name: "Maya Chen", role: "Coordinator" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-wed-startup-1",
    type: "event",
    title: "Partner Intro Pitch: Lightspeed India (Seed Fund)",
    description: "Introductory pitch call with Hemant Mohapatra regarding autonomous agent recruitment architecture.",
    date: "2026-09-09",
    startTime: "04:30 PM",
    endTime: "05:15 PM",
    durationMinutes: 45,
    status: "todo",
    priority: "urgent",
    projectId: "funding",
    assignee: { name: "Founding Team", role: "CEO" },
    meetingLink: "https://meet.google.com/ls-seed-pitch",
    location: "Virtual Meeting Room",
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- THURSDAY ---
  {
    id: "item-thu-1",
    type: "event",
    title: "Deloitte USI Placement Drive: Written Aptitude Test",
    description: "Online coding test across CS Computer Labs 1, 2, and 3 for 180 shortlisted students.",
    date: "2026-09-10",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    durationMinutes: 120,
    status: "todo",
    priority: "urgent",
    projectId: "campus",
    assignee: { name: "Amal Benny", role: "TPO" },
    location: "Computer Labs 1, 2 & 3",
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-thu-2",
    type: "task",
    title: "Generate Offer Letters & CTC Breakdown for 12 Finalists",
    description: "Super Dream category offers (₹24+ LPA) requiring Dean signature & seal.",
    date: "2026-09-10",
    durationMinutes: 90,
    status: "todo",
    priority: "high",
    projectId: "recruitment",
    assignee: { name: "Sarah Johnson", role: "TPO Lead" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },

  // --- FRIDAY ---
  {
    id: "item-fri-1",
    type: "event",
    title: "Weekly Recruitment Retrospective & Metrics Review",
    description: "Analyze candidate pipeline, placement rates, and time-to-hire statistics.",
    date: "2026-09-11",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    durationMinutes: 60,
    status: "todo",
    priority: "medium",
    projectId: "ops",
    assignee: { name: "Alex Rivera", role: "Team Lead" },
    meetingLink: "https://meet.google.com/ret-rose-pec",
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-fri-2",
    type: "task",
    title: "Distribute Weekend Prep Guide for Amazon SDE Drive",
    description: "Share DSA cheat sheet, system design tips, and behavioral STAR framework.",
    date: "2026-09-11",
    durationMinutes: 45,
    status: "todo",
    priority: "medium",
    projectId: "campus",
    assignee: { name: "Maya Chen", role: "Coordinator" },
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

interface BordioStore {
  items: BordioItem[];
  projects: BordioProject[];
  waitingListOpen: boolean;
  selectedDate: string; // YYYY-MM-DD
  viewMode: "week" | "day" | "month" | "board";
  selectedProjectId: string | "all";
  selectedPriority: string | "all";
  hideCompleted: boolean;
  searchQuery: string;
  activeItemId: string | null; // For modal / drawer

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

  // CRUD
  addItem: (item: Omit<BordioItem, "id" | "createdAt">) => BordioItem;
  updateItem: (id: string, updates: Partial<BordioItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemDone: (id: string) => void;
  moveItemDate: (id: string, targetDate: string | null) => void;
  toggleSubtask: (itemId: string, subtaskId: string) => void;
  addSubtask: (itemId: string, title: string) => void;
  deleteSubtask: (itemId: string, subtaskId: string) => void;
}

const STORAGE_KEY = "letgetin_planner_items_v1";

function loadSavedItems(): BordioItem[] {
  if (typeof window !== "undefined") {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("letgetin_bordio_items_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }
  return INITIAL_ITEMS;
}

export const useBordioStore = create<BordioStore>((set, get) => ({
  items: loadSavedItems(),
  projects: DEFAULT_PROJECTS,
  waitingListOpen: true,
  selectedDate: "2026-09-09", // Default today
  viewMode: "week",
  selectedProjectId: "all",
  selectedPriority: "all",
  hideCompleted: false,
  searchQuery: "",
  activeItemId: null,

  setWaitingListOpen: (open) => set({ waitingListOpen: open }),
  toggleWaitingList: () => set((s) => ({ waitingListOpen: !s.waitingListOpen })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedPriority: (selectedPriority) => set({ selectedPriority }),
  setHideCompleted: (hideCompleted) => set({ hideCompleted }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveItemId: (activeItemId) => set({ activeItemId }),

  addItem: (data) => {
    const newItem: BordioItem = {
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
        const nextStatus: BordioStatus = item.status === "done" ? "todo" : "done";
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
        const newSub: BordioSubtask = {
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
