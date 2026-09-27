"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerOverviewSection } from "@/features/dashboard/components/CareerOverviewSection";
import { JobsBoard } from "@/features/jobs/components/JobsBoard";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { JobTimelineView } from "@/features/jobs/components/JobTimelineView";
import {
  LayoutDashboard,
  LayoutGrid,
  Calendar,
  Clock,
  Search,
  FileText,
} from "lucide-react";

type MyJobsSection = "overview" | "kanban" | "calendar" | "timeline" | "jobs";

// Top navigation for the My Jobs area
const MY_JOBS_TABS: {
  id: MyJobsSection;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "kanban", label: "Kanban Board", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "jobs", label: "Explore Jobs", icon: Search },
];

function MyJobsPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as MyJobsSection | null;

  const [activeSection, setActiveSection] = useState<MyJobsSection>(() => {
    if (
      tabFromUrl &&
      ["overview", "kanban", "calendar", "timeline", "jobs"].includes(tabFromUrl)
    ) {
      return tabFromUrl;
    }
    return "overview";
  });
  const [selectedStage, setSelectedStage] = useState<string>("all");

  const handleSwitchTab = (tab: any, stage?: string) => {
    if (["overview", "kanban", "calendar", "timeline", "jobs"].includes(tab)) {
      setActiveSection(tab as MyJobsSection);
    }
    if (stage) {
      setSelectedStage(stage);
    } else {
      setSelectedStage("all");
    }
  };

  useEffect(() => {
    if (
      tabFromUrl &&
      ["overview", "kanban", "calendar", "timeline", "jobs"].includes(tabFromUrl)
    ) {
      setActiveSection(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Navigation Tabs - My Jobs */}
        <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
          {MY_JOBS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-brand text-white shadow-elegant"
                    : "text-ink-soft hover:text-ink hover:bg-secondary/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-primary-glow"}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Overview Section */}
        {activeSection === "overview" && (
          <CareerOverviewSection onSwitchTab={handleSwitchTab} />
        )}

        {/* 2. Kanban Board */}
        {activeSection === "kanban" && (
          <JobsBoard
            onSwitchTab={handleSwitchTab}
            initialStageFilter={selectedStage}
            initialViewMode="kanban"
          />
        )}

        {/* 3. Calendar Workspace */}
        {activeSection === "calendar" && (
          <div className="space-y-4">
            <CalendarWorkspace
              title="My Jobs & Applications Schedule"
              subtitle="Keep track of your interview timings, assessment deadlines, and job application timelines in one place."
              badgeLabel="Candidate Schedule"
              defaultView="week"
            />
          </div>
        )}

        {/* 4. Timeline Workspace */}
        {activeSection === "timeline" && <JobTimelineView />}

        {/* 5. Jobs Board (Explore & Search Jobs) */}
        {activeSection === "jobs" && (
          <JobsBoard
            onSwitchTab={handleSwitchTab}
            initialStageFilter={selectedStage}
            initialViewMode="list"
          />
        )}
      </main>
    </div>
  );
}

export default function MyJobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MyJobsPageContent />
    </Suspense>
  );
}
