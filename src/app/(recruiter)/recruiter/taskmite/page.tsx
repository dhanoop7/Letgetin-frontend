"use client";

import React, { useState, useMemo } from "react";
import {
  ListChecks,
  KanbanSquare,
  List,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  MoreVertical,
  X,
  Filter,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  ChevronDown,
  Trash2,
} from "lucide-react";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface TaskmiteItem {
  id: string;
  title: string;
  description: string;
  department: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: { name: string; avatar?: string };
  points?: number;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; badgeBg: string; badgeText: string; dot: string }
> = {
  todo: {
    label: "To Do / Backlog",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-600 dark:text-slate-400 border-slate-500/20",
    dot: "bg-slate-500",
  },
  in_progress: {
    label: "In Progress",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  review: {
    label: "Under Review",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
  },
  done: {
    label: "Completed",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  High: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

const INITIAL_TASKS: TaskmiteItem[] = [
  {
    id: "tsk-1",
    title: "Draft Q4 Senior React Native Role Specification",
    description: "Define core benchmark competencies, compensation bandwidth, and interview rubric.",
    department: "Talent Acquisition",
    status: "in_progress",
    priority: "High",
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    assignee: { name: "Jordan Cole" },
    points: 3,
  },
  {
    id: "tsk-2",
    title: "Review Backend Candidate Technical Assessments",
    description: "Evaluate 6 submitted code challenges for GraphQL and caching performance.",
    department: "Engineering",
    status: "todo",
    priority: "High",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    assignee: { name: "David Kim" },
    points: 5,
  },
  {
    id: "tsk-3",
    title: "Update Employee Onboarding Welcome Kit",
    description: "Refresh company policy PDF, hardware requisition forms, and Buddy Slack bot.",
    department: "People Ops",
    status: "in_progress",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    assignee: { name: "Rachel Adams" },
    points: 2,
  },
  {
    id: "tsk-4",
    title: "Conduct Live Architecture Interview with Sophia Chen",
    description: "Evaluate system scaling architecture and microservices consensus round.",
    department: "Engineering",
    status: "review",
    priority: "High",
    dueDate: new Date().toISOString().slice(0, 10),
    assignee: { name: "Elena Rostova" },
    points: 4,
  },
  {
    id: "tsk-5",
    title: "Synchronize Campus Drive Job Postings with University Portals",
    description: "Export job descriptions and verify bulk applicant import mappings.",
    department: "Recruiting",
    status: "done",
    priority: "Medium",
    dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    assignee: { name: "Alex Rivera" },
    points: 3,
  },
  {
    id: "tsk-6",
    title: "Design Performance Appraisal Review Forms for Managers",
    description: "360 peer feedback questionnaire and objective key results (OKRs) scorecard.",
    department: "Human Resources",
    status: "todo",
    priority: "Low",
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10),
    assignee: { name: "Sarah Jenkins" },
    points: 2,
  },
];

export default function TaskmitePage() {
  const [tasks, setTasks] = useState<TaskmiteItem[]>(INITIAL_TASKS);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDepartment, setFormDepartment] = useState("Engineering");
  const [formPriority, setFormPriority] = useState<TaskPriority>("Medium");
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formAssignee, setFormAssignee] = useState("");
  const [formPoints, setFormPoints] = useState(3);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (departmentFilter !== "all" && t.department !== departmentFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchUser = t.assignee.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchUser) return false;
      }
      return true;
    });
  }, [tasks, departmentFilter, priorityFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const highPriority = tasks.filter((t) => t.priority === "High" && t.status !== "done").length;
    return { total, inProgress, completed, highPriority };
  }, [tasks]);

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const toggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Remove this task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newTask: TaskmiteItem = {
      id: `tsk-${Date.now()}`,
      title: formTitle.trim(),
      description: formDesc.trim(),
      department: formDepartment,
      status: "todo",
      priority: formPriority,
      dueDate: formDueDate,
      assignee: { name: formAssignee || "Unassigned" },
      points: formPoints,
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setFormTitle("");
    setFormDesc("");
    setFormAssignee("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Taskmite
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-primary-glow" />
              Workforce Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Delegate sprint tasks, coordinate recruitment deliverables, and track team velocity in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Total Assigned
            </div>
            <div className="text-2xl font-black text-ink mt-0.5">{metrics.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <ListChecks className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {metrics.inProgress}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              High Priority
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {metrics.highPriority}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {metrics.completed}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar: View Toggle, Filters, Search */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* View Switcher: Board vs List */}
        <div className="flex items-center p-1 rounded-xl bg-surface-alt border border-border/80 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === "board"
                ? "bg-surface text-ink shadow-xs border border-border"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5 text-primary-glow" />
            <span>Board View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === "list"
                ? "bg-surface text-ink shadow-xs border border-border"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <List className="w-3.5 h-3.5 text-primary-glow" />
            <span>List View</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, department, or assignee..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs text-ink placeholder:text-ink-soft outline-none focus:border-primary transition"
            />
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-3 pr-7 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink appearance-none outline-none focus:border-primary"
            >
              <option value="all">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Talent Acquisition">Talent Acquisition</option>
              <option value="People Ops">People Ops</option>
              <option value="Human Resources">Human Resources</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-soft absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-3 pr-7 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink appearance-none outline-none focus:border-primary"
            >
              <option value="all">Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-soft absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: KANBAN BOARD                                                      */}
      {/* ========================================================================= */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((stKey) => {
            const conf = STATUS_CONFIG[stKey];
            const colTasks = filteredTasks.filter((t) => t.status === stKey);

            return (
              <div
                key={stKey}
                className="bg-surface rounded-2xl border border-border flex flex-col min-h-[500px] shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                    <h3 className="text-xs font-bold text-ink">{conf.label}</h3>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${conf.badgeBg} ${conf.badgeText}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl text-ink-soft text-xs">
                      <span>No tasks in this lane</span>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-border bg-surface-alt/40 hover:bg-surface-alt hover:border-primary/40 transition-all shadow-xs space-y-2.5 group"
                      >
                        {/* Header: Priority & Department */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${PRIORITY_BADGE[task.priority]}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[10px] text-ink-soft font-medium truncate">
                            {task.department}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <h4 className="text-xs font-bold text-ink leading-snug group-hover:text-primary-glow transition">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-ink-soft line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
                          <div className="flex items-center gap-1.5 text-ink font-semibold">
                            <div className="w-5 h-5 rounded-full bg-gradient-brand text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="truncate max-w-[90px]">{task.assignee.name}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-ink-soft font-semibold">
                            <Clock className="w-3 h-3 text-ink-soft shrink-0" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Bottom Stage Shifter Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                          <button
                            type="button"
                            onClick={() => toggleDone(task.id)}
                            className="text-primary-glow hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{task.status === "done" ? "Re-open" : "Mark Done"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {stKey !== "todo" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const order: TaskStatus[] = ["todo", "in_progress", "review", "done"];
                                  const idx = order.indexOf(stKey);
                                  if (idx > 0) handleStatusChange(task.id, order[idx - 1]);
                                }}
                                title="Move Previous Lane"
                                className="px-1.5 py-0.5 rounded hover:bg-surface border border-border text-ink-soft cursor-pointer"
                              >
                                ←
                              </button>
                            )}
                            {stKey !== "done" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const order: TaskStatus[] = ["todo", "in_progress", "review", "done"];
                                  const idx = order.indexOf(stKey);
                                  if (idx < order.length - 1) handleStatusChange(task.id, order[idx + 1]);
                                }}
                                title="Advance Next Lane"
                                className="px-1.5 py-0.5 rounded bg-primary/10 text-primary-glow font-bold hover:bg-primary/20 cursor-pointer"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIST VIEW                                                         */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-alt/70 border-b border-border text-ink-soft font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-10">Done</th>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((task) => {
                  const conf = STATUS_CONFIG[task.status];
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-surface-alt/40 transition-colors group"
                    >
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => toggleDone(task.id)}
                          className="cursor-pointer text-ink-soft hover:text-emerald-500 transition"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              task.status === "done" ? "text-emerald-500 fill-emerald-500/20" : ""
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-3.5 font-bold text-ink">
                        <div className={task.status === "done" ? "line-through text-ink-soft" : ""}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-ink-soft font-normal truncate max-w-sm">
                          {task.description}
                        </div>
                      </td>
                      <td className="p-3.5 text-ink-soft font-medium">
                        {task.department}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${conf.badgeBg} ${conf.badgeText}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                          <span>{conf.label}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${PRIORITY_BADGE[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-ink">
                        {task.assignee.name}
                      </td>
                      <td className="p-3.5 text-ink-soft font-medium whitespace-nowrap">
                        {task.dueDate}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg text-ink-soft hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow">
                  <ListChecks className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Create Workforce Task</h3>
                  <p className="text-[11px] text-ink-soft">Assign tasks to team members with priority and deadlines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Screen Senior React candidates"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Details and deliverables required..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="People Ops">People Ops</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Assignee</label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    placeholder="e.g. Jordan Cole"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
