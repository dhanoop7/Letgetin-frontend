"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  PlusCircle,
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  BarChart3,
  Search,
} from "lucide-react";
import { TOP_TABS, NAV_GROUPS } from "../constants/navigation";
import type { CreateType, FresherTab } from "../types";
import { FresherModalContext } from "../hooks/useFresherModal";
import { useFresherHiring } from "../hooks/useFresherHiring";
import { FresherCreateModal } from "./modals/FresherCreateModal";

// Tabs
import { OverviewTab } from "./tabs/OverviewTab";
import { CandidatesTab } from "./tabs/CandidatesTab";
import { DrivesTab } from "./tabs/DrivesTab";
import { JobsTab } from "./tabs/JobsTab";
import { InternshipsTab } from "./tabs/InternshipsTab";
import { ApprenticeshipsTab } from "./tabs/ApprenticeshipsTab";
import { JuniorTab } from "./tabs/JuniorTab";
import { AssessmentTab } from "./tabs/AssessmentTab";
import { InterviewsTab } from "./tabs/InterviewsTab";
import { OffersTab } from "./tabs/OffersTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";

export function FresherHiringWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab State: initialized from URL query param `?tab=...` or default to "overview"
  const tabParam = searchParams.get("tab") as FresherTab | null;
  const [activeTab, setActiveTab] = useState<FresherTab>(
    tabParam && TOP_TABS.some((t) => t.id === tabParam) ? tabParam : "overview"
  );

  // Synchronize state if URL query param changes
  useEffect(() => {
    if (tabParam && TOP_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = useCallback(
    (tab: FresherTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Create Modal State
  const [createType, setCreateType] = useState<CreateType | null>(null);
  const openCreate = useCallback((type: CreateType) => setCreateType(type), []);
  const closeCreate = useCallback(() => setCreateType(null), []);

  // Shared Data Hook
  const {
    candidates,
    drives,
    jobs,
    programs,
    juniorRoles,
    interviews,
    searchCandidate,
    setSearchCandidate,
    filterQualification,
    setFilterQualification,
    filterStage,
    setFilterStage,
    filterLocation,
    setFilterLocation,
    searchDrive,
    setSearchDrive,
    filterDriveStatus,
    setFilterDriveStatus,
    filterCollegeType,
    setFilterCollegeType,
    handleExportCandidates,
  } = useFresherHiring();

  return (
    <FresherModalContext.Provider value={{ createType, openCreate, closeCreate }}>
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                Fresher Hiring Suite
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-primary-glow" />
                Campus & Early Career 2026–27
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-soft mt-1.5 max-w-3xl leading-relaxed">
              Build your complete early-career talent pipeline — from university campus drives
              and verified pools to internships, apprenticeships, automated assessments, and PPO conversions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => openCreate("candidate")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-primary-glow" />
              <span>Add Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => openCreate("drive")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-purple-500" />
              <span>Campus Drive</span>
            </button>
            <button
              type="button"
              onClick={() => openCreate("job")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Fresher Job</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="bg-surface border border-border rounded-2xl p-1.5 shadow-xs">
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5"
            role="tablist"
          >
            {TOP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-surface-alt border border-border text-ink-soft"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="transition-opacity duration-200">
          {activeTab === "overview" && (
            <OverviewTab
              candidates={candidates}
              onNavigateTab={(tab) => handleTabChange(tab)}
            />
          )}

          {activeTab === "candidates" && (
            <CandidatesTab
              candidates={candidates}
              search={searchCandidate}
              onSearchChange={setSearchCandidate}
              qualification={filterQualification}
              onQualificationChange={setFilterQualification}
              stage={filterStage}
              onStageChange={setFilterStage}
              location={filterLocation}
              onLocationChange={setFilterLocation}
              onExport={handleExportCandidates}
            />
          )}

          {activeTab === "drives" && (
            <DrivesTab
              drives={drives}
              search={searchDrive}
              onSearchChange={setSearchDrive}
              status={filterDriveStatus}
              onStatusChange={setFilterDriveStatus}
              collegeType={filterCollegeType}
              onCollegeTypeChange={setFilterCollegeType}
              onOpenCreate={() => openCreate("drive")}
            />
          )}

          {activeTab === "jobs" && (
            <JobsTab
              jobs={jobs}
              onOpenCreate={() => openCreate("job")}
            />
          )}

          {activeTab === "internships" && (
            <InternshipsTab
              programs={programs}
              onOpenCreate={() => openCreate("internship")}
            />
          )}

          {activeTab === "apprenticeships" && (
            <ApprenticeshipsTab
              onOpenCreate={() => openCreate("apprenticeship")}
            />
          )}

          {activeTab === "junior" && (
            <JuniorTab
              juniorRoles={juniorRoles}
              onOpenCreate={() => openCreate("junior")}
            />
          )}

          {activeTab === "assessment" && <AssessmentTab />}

          {activeTab === "interviews" && (
            <InterviewsTab interviews={interviews} />
          )}

          {activeTab === "offers" && <OffersTab />}

          {activeTab === "analytics" && <AnalyticsTab />}
        </div>

        {/* Unified Create Modal Dialog */}
        <FresherCreateModal
          type={createType}
          onClose={closeCreate}
          onSuccess={() => {
            // Can reload or update data
          }}
        />
      </div>
    </FresherModalContext.Provider>
  );
}
