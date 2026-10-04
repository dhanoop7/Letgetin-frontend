"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  Bot,
  Video,
  FileText,
  Search,
  Award,
} from "lucide-react";
import { applicationService } from "@/features/applications/services/applicationService";
import { ApplicationItem } from "@/features/applications/types";

interface TimelineEvent {
  id: string;
  title: string;
  company: string;
  location?: string;
  category: "interview" | "assessment" | "application" | "offer";
  status: "completed" | "upcoming" | "in-progress" | "pending";
  date: string;
  time?: string;
  description: string;
  matchScore?: number;
  actionLabel?: string;
  actionHref?: string;
}

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "tl-1",
    title: "Simulated Hiring Manager Practice Round",
    company: "LetGetIn AI Suite",
    location: "Online / Voice Room",
    category: "interview",
    status: "upcoming",
    date: "Today",
    time: "03:00 PM",
    description:
      "STAR behavioral probing, team coordination leadership, and architectural conflict resolution practice.",
    matchScore: 94,
    actionLabel: "Launch Voice Practice",
    actionHref: "/interviews/ai-practice",
  },
  {
    id: "tl-2",
    title: "Senior Full Stack Engineer Application Submitted",
    company: "Growww Financial Technologies",
    location: "Bengaluru, India (Hybrid)",
    category: "application",
    status: "completed",
    date: "Yesterday",
    time: "11:30 AM",
    description:
      "Tailored resume and custom cover letter successfully submitted. ATS score verified at 91%.",
    matchScore: 91,
    actionLabel: "View Application",
    actionHref: "/applications",
  },
  {
    id: "tl-3",
    title: "AI Skill Assessment & System Design Drill",
    company: "CloudScale Systems",
    location: "Technical Assessment Hub",
    category: "assessment",
    status: "completed",
    date: "Sep 25, 2026",
    time: "02:15 PM",
    description:
      "Distributed caching, microservices data consistency, and database indexing evaluation completed with score 88%.",
    matchScore: 88,
    actionLabel: "Review Assessment",
    actionHref: "/interviews/assessment",
  },
  {
    id: "tl-4",
    title: "Staff Platform Engineer Technical Screen",
    company: "Nexus AI Labs",
    location: "Remote",
    category: "interview",
    status: "upcoming",
    date: "Sep 30, 2026",
    time: "10:00 AM",
    description:
      "Live interactive interview round focusing on high-throughput distributed pipelines and cloud resilience.",
    matchScore: 96,
    actionLabel: "Prepare Interview",
    actionHref: "/interviews/ai-practice",
  },
  {
    id: "tl-5",
    title: "Lead Frontend Architect Offer Discussion",
    company: "FinVertex Solutions",
    location: "Mumbai, India",
    category: "offer",
    status: "in-progress",
    date: "Oct 03, 2026",
    time: "04:30 PM",
    description:
      "Final compensation package, equity vesting schedule, and leadership scope alignment meeting.",
    matchScore: 98,
    actionLabel: "View Offer Details",
    actionHref: "/applications",
  },
];

const CATEGORY_CONFIG: Record<
  TimelineEvent["category"],
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  interview: {
    label: "Interview",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    icon: Video,
  },
  assessment: {
    label: "Assessment",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    icon: Bot,
  },
  application: {
    label: "Application",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: FileText,
  },
  offer: {
    label: "Offer & Milestone",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    icon: Award,
  },
};

const STATUS_PILL: Record<
  TimelineEvent["status"],
  { label: string; bg: string; text: string }
> = {
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    text: "text-emerald-600",
  },
  upcoming: {
    label: "Upcoming",
    bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    text: "text-blue-600",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    text: "text-amber-600",
  },
  pending: {
    label: "Pending",
    bg: "bg-surface-alt text-ink-soft border-border",
    text: "text-ink-soft",
  },
};

export function JobTimelineView() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const res = await applicationService.getApplications({ limit: 50, sort: "recent" });
        setApplications(res.applications || []);
      } catch (err) {
        console.warn("Failed to load applications for timeline:", err);
      }
    };

    loadApplications();
  }, []);

  // Merge real backend applications into timeline events if available
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const dynamicEvents: TimelineEvent[] = applications.map((app) => {
      const isInterview = app.status === "interviewing";
      const isOffer = app.status === "offered";

      let category: TimelineEvent["category"] = "application";
      if (isInterview) category = "interview";
      else if (isOffer) category = "offer";

      const companyName =
        typeof app.job?.company === "object"
          ? app.job?.company?.name || "Target Company"
          : app.job?.company || "Target Company";

      const locationStr =
        typeof app.job?.location === "object"
          ? [app.job?.location?.city, app.job?.location?.country].filter(Boolean).join(", ") || "Hybrid"
          : app.job?.location || "Hybrid";

      return {
        id: `app-tl-${app._id}`,
        title: `${app.job?.title || "Target Role"} — Status: ${app.status.toUpperCase()}`,
        company: companyName,
        location: locationStr,
        category,
        status: isOffer ? "completed" : isInterview ? "upcoming" : "completed",
        date: app.appliedAt
          ? new Date(app.appliedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        time: "10:00 AM",
        description: `Application status is currently ${app.status}. Tracked with ATS match score of ${app.matchScore || 85}%.`,
        matchScore: app.matchScore || 85,
        actionLabel: isInterview ? "Practice Interview" : "View Application Details",
        actionHref: isInterview ? "/interviews/ai-practice" : "/applications",
      };
    });

    // If no backend applications, display curated default milestones
    if (dynamicEvents.length === 0) {
      return DEFAULT_TIMELINE_EVENTS;
    }

    return [...dynamicEvents, ...DEFAULT_TIMELINE_EVENTS.slice(0, 2)];
  }, [applications]);

  // Filter events by category and search
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((ev) => {
      const matchesCategory = filterCategory === "all" || ev.category === filterCategory;
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [timelineEvents, filterCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-brand rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-elegant relative overflow-hidden text-white">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/90 bg-white/15 px-3 py-1 rounded-full w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Chronological Career Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Application & Interview Timeline
          </h1>
          <p className="text-sm text-white/85 max-w-2xl leading-relaxed">
            Track your key job milestones, assessment schedules, AI mock interviews, and offer progress in a unified chronological feed.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/interviews/ai-practice"
            className="bg-white text-ink text-xs font-extrabold px-5 py-3 rounded-xl shadow-md hover:bg-white/90 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-primary" />
            <span>Practice Interview</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Milestones" },
            { id: "interview", label: "Interviews" },
            { id: "assessment", label: "Assessments" },
            { id: "application", label: "Applications" },
            { id: "offer", label: "Offers" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterCategory === cat.id
                  ? "bg-gradient-brand text-white shadow-xs"
                  : "bg-surface-alt hover:bg-secondary text-ink-soft hover:text-ink border border-border/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="input-base pl-9 text-xs py-2 h-9"
          />
          <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-3" />
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-glow" />
            <span>Timeline Feed</span>
          </h2>
          <span className="text-xs text-ink-soft font-semibold">
            {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} tracked
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-surface/50 border border-dashed border-border rounded-3xl space-y-3">
            <Clock className="w-10 h-10 text-ink-soft mx-auto" />
            <h3 className="text-sm font-bold text-ink">No timeline events found</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">
              No milestones match your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80 space-y-6">
            {filteredEvents.map((event) => {
              const catMeta = CATEGORY_CONFIG[event.category];
              const Icon = catMeta.icon;
              const statusMeta = STATUS_PILL[event.status];

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-6 sm:-left-8 top-4 w-5 h-5 rounded-full bg-surface border-2 border-primary-glow flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary-glow animate-pulse" />
                  </div>

                  {/* Event Card */}
                  <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-3">
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{catMeta.label}</span>
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.bg}`}
                        >
                          {statusMeta.label}
                        </span>

                        {event.matchScore && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{event.matchScore}% Match</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary-glow" />
                          {event.date}
                        </span>
                        {event.time && <span>• {event.time}</span>}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-ink group-hover:text-primary-glow transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <Building2 className="w-3.5 h-3.5 text-primary-glow" />
                          {event.company}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-ink-soft/70" />
                            {event.location}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-soft leading-relaxed pt-1">
                        {event.description}
                      </p>
                    </div>

                    {/* Card Action Link */}
                    {event.actionLabel && event.actionHref && (
                      <div className="pt-2 border-t border-border/40 flex items-center justify-end">
                        <Link
                          href={event.actionHref}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-glow hover:underline"
                        >
                          <span>{event.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
