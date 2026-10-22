"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerOverviewSection } from "@/features/dashboard/components/CareerOverviewSection";
import { JobsBoard } from "@/features/jobs/components/JobsBoard";
import { JobsListView } from "@/features/jobs/components/JobsListView";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { JobNotificationsView } from "@/features/jobs/components/JobNotificationsView";
import { JobOnboardingView } from "@/features/jobs/components/JobOnboardingView";
import {
  LayoutDashboard,
  List,
  Columns3,
  Calendar,
  FileText,
} from "lucide-react";

type MyJobsSection =
  | "overview"
  | "list"
  | "kanban"
  | "calendar"
  | "myJobs"
  | "notifications"
  | "onboarding";

// Top navigation for the My Jobs area - exactly 4 tabs: Overview, List, Kanban, Calendar
const MY_JOBS_TABS: {
  id: "overview" | "list" | "kanban" | "calendar";
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "list", label: "List", icon: List },
  { id: "kanban", label: "Kanban", icon: Columns3 },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

const VALID_MY_JOBS_TABS: MyJobsSection[] = [
  "overview",
  "list",
  "kanban",
  "calendar",
  "myJobs",
  "notifications",
  "onboarding",
];

function MyJobsPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as MyJobsSection | null;

  const [activeSection, setActiveSection] = useState<MyJobsSection>(() => {
    if (tabFromUrl && VALID_MY_JOBS_TABS.includes(tabFromUrl)) {
      if (tabFromUrl === "myJobs") return "kanban";
      return tabFromUrl;
    }
    return "overview";
  });

  const [selectedStage, setSelectedStage] = useState<string>("all");

  const handleSwitchTab = (
    tab: string,
    stage?: string
  ) => {
    if (tab === "kanban" || tab === "jobs" || tab === "myJobs") {
      setActiveSection("kanban");
    } else if (tab === "list") {
      setActiveSection("list");
    } else if (tab === "overview") {
      setActiveSection("overview");
    } else if (tab === "calendar") {
      setActiveSection("calendar");
    } else if (tab === "notifications") {
      setActiveSection("notifications");
    } else if (tab === "onboarding") {
      setActiveSection("onboarding");
    } else if (VALID_MY_JOBS_TABS.includes(tab as MyJobsSection)) {
      setActiveSection(tab as MyJobsSection);
    }

    if (stage) {
      setSelectedStage(stage);
    } else {
      setSelectedStage("all");
    }
  };

  useEffect(() => {
    if (tabFromUrl && VALID_MY_JOBS_TABS.includes(tabFromUrl)) {
      if (tabFromUrl === "myJobs") {
        setActiveSection("kanban");
      } else {
        setActiveSection(tabFromUrl);
      }
    }
  }, [tabFromUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Navigation Tabs - My Jobs (Overview | List | Kanban | Calendar) */}
        <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
          {MY_JOBS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeSection === tab.id ||
              (tab.id === "kanban" && activeSection === "myJobs");

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  setSelectedStage("all");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-brand text-white shadow-elegant"
                    : "text-ink-soft hover:text-ink hover:bg-secondary/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-primary-glow"
                  }`}
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

        {/* 2. List View */}
        {activeSection === "list" && (
          <JobsListView
            onSwitchTab={handleSwitchTab}
            initialStageFilter={selectedStage}
          />
        )}

        {/* 3. Kanban Board */}
        {(activeSection === "kanban" || activeSection === "myJobs") && (
          <JobsBoard
            onSwitchTab={handleSwitchTab}
            initialStageFilter={selectedStage}
            initialViewMode="kanban"
          />
        )}

        {/* 4. Calendar */}
        {activeSection === "calendar" && (
          <CalendarWorkspace
            title="My Jobs & Applications Schedule"
            subtitle="Keep track of your interview timings, assessment deadlines, and job application timelines in one place."
            badgeLabel="Candidate Schedule"
            defaultView="week"
          />
        )}

        {/* 5. Notifications (Preserved) */}
        {activeSection === "notifications" && (
          <JobNotificationsView />
        )}

        {/* 6. Onboarding (Preserved) */}
        {activeSection === "onboarding" && (
          <JobOnboardingView onSwitchTab={handleSwitchTab} />
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