"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerOverviewSection } from "@/features/dashboard/components/CareerOverviewSection";
import { JobsBoard } from "@/features/jobs/components/JobsBoard";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { JobNotificationsView } from "@/features/jobs/components/JobNotificationsView";
import { JobOnboardingView } from "@/features/jobs/components/JobOnboardingView";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Bell,
  FileText,
} from "lucide-react";

type MyJobsSection =
  | "overview"
  | "myJobs"
  | "calendar"
  | "notifications"
  | "onboarding";

// Top navigation for the My Jobs area
const MY_JOBS_TABS: {
  id: MyJobsSection;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "myJobs", label: "My Jobs", icon: Briefcase },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "onboarding", label: "Onboarding", icon: FileText },
];

const VALID_MY_JOBS_TABS: MyJobsSection[] = [
  "overview",
  "myJobs",
  "calendar",
  "notifications",
  "onboarding",
];

function MyJobsPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as MyJobsSection | null;

  const [activeSection, setActiveSection] = useState<MyJobsSection>(() => {
    if (tabFromUrl && VALID_MY_JOBS_TABS.includes(tabFromUrl)) {
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
      setActiveSection("myJobs");
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

        {/* 2. My Jobs */}
        {activeSection === "myJobs" && (
          <JobsBoard
            onSwitchTab={handleSwitchTab}
            initialStageFilter={selectedStage}
            initialViewMode="kanban"
          />
        )}

        {/* 3. Calendar */}
        {activeSection === "calendar" && (
          <CalendarWorkspace
            title="My Jobs & Applications Schedule"
            subtitle="Keep track of your interview timings, assessment deadlines, and job application timelines in one place."
            badgeLabel="Candidate Schedule"
            defaultView="week"
          />
        )}

        {/* 4. Notifications */}
        {activeSection === "notifications" && (
          <JobNotificationsView />
        )}

        {/* 5. Onboarding */}
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