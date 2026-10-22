"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  FileCheck,
  Award,
  Layers,
  GraduationCap,
  AlertCircle,
  Eye,
} from "lucide-react";
import { admissionService } from "@/features/institution/services/admissionService";
import {
  AdmissionApplication,
  AdmissionTrack,
} from "@/features/institution/types/admission.types";
import { AdmissionApplicantModal } from "@/features/institution/components/AdmissionApplicantModal";

interface TimelineStage {
  id: string;
  stageNumber: number;
  name: string;
  stageKey: string;
  dateRange: string;
  status: "Completed" | "Active" | "Upcoming";
  description: string;
  milestones: string[];
}

export default function InstitutionAdmissionTimelinePage() {
  const [tracks, setTracks] = useState<AdmissionTrack[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("All");
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<AdmissionApplication | null>(null);

  const baseStages: TimelineStage[] = [
    {
      id: "stage-1",
      stageNumber: 1,
      name: "Inquiry Registration & Portal Open",
      stageKey: "inquiry",
      dateRange: "Oct 01 – Dec 15, 2026",
      status: "Active",
      description: "Collecting student registrations, basic contact verification, brochure downloads, and initial inquiries.",
      milestones: [
        "Online registration portal live",
        "Automated WhatsApp & Email verification",
        "Counselor assignment & outreach",
      ],
    },
    {
      id: "stage-2",
      stageNumber: 2,
      name: "Application Submission & Document Check",
      stageKey: "submitted",
      dateRange: "Dec 16 – Dec 22, 2026",
      status: "Upcoming",
      description: "Collecting formal application forms, 10+2 marks cards, entrance scorecards, and application fee clearance.",
      milestones: [
        "Marksheet authenticity cross-checks",
        "Domicile & Sports quota certification",
        "Eligibility clearance report generated",
      ],
    },
    {
      id: "stage-3",
      stageNumber: 3,
      name: "Round 1 Merit Shortlist & Cutoffs",
      stageKey: "shortlisted",
      dateRange: "Dec 24 – Dec 28, 2026",
      status: "Upcoming",
      description: "Publishing official institutional merit cutoffs and calculating composite index percentiles.",
      milestones: [
        "Cutoff list published on portal",
        "Merit ranking normalized",
        "Counseling call letter dispatched",
      ],
    },
    {
      id: "stage-4",
      stageNumber: 4,
      name: "1:1 Counseling Slot & Interviews",
      stageKey: "counseling",
      dateRange: "Jan 02 – Jan 08, 2027",
      status: "Upcoming",
      description: "Personal and AI-guided counseling appointments, department tour, and course track allotment.",
      milestones: [
        "Faculty counseling slot attended",
        "Subject proficiency & aptitude review",
        "Token deposit payment gateway open",
      ],
    },
    {
      id: "stage-5",
      stageNumber: 5,
      name: "Seat Confirmation & Enrollment Locked",
      stageKey: "enrolled",
      dateRange: "Jan 10 – Jan 18, 2027",
      status: "Upcoming",
      description: "Digital enrollment ID generated, fee verification recorded, and hostel allotment finalized.",
      milestones: [
        "Provisional admission letter generated",
        "Tuition deposit confirmed",
        "Ready for campus onboarding & induction",
      ],
    },
  ];

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [trackData, appData] = await Promise.all([
        admissionService.getTracks(),
        admissionService.getApplications(),
      ]);
      setTracks(trackData);
      setApplications(appData);
    } catch (err) {
      console.error("Failed to load timeline data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApps = applications.filter((a) =>
    selectedProgram === "All" ? true : a.program === selectedProgram
  );

  // Compute live count per stage
  const stageCounts: Record<string, number> = {
    inquiry: filteredApps.filter((a) => a.stage === "inquiry").length,
    submitted: filteredApps.filter((a) => a.stage === "submitted").length,
    shortlisted: filteredApps.filter((a) => a.stage === "shortlisted").length,
    counseling: filteredApps.filter((a) => a.stage === "counseling").length,
    enrolled: filteredApps.filter((a) => a.stage === "enrolled").length,
  };

  const completedCount = stageCounts.enrolled || 0;
  const totalCount = filteredApps.length || 1;
  const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Admission Timeline</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Chronological stage milestones and live progression tracking backed by real admission records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary shadow-xs"
          >
            <option value="All">All Program Tracks ({applications.length})</option>
            {tracks.map((t) => (
              <option key={t._id} value={t.program}>
                {t.program}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Overview Bar */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink">
              {selectedProgram === "All" ? "Combined Institutional Cohort" : selectedProgram}
            </h3>
            <span className="text-xs text-ink-soft">
              {filteredApps.length} Applicants in pipeline · {stageCounts.enrolled} confirmed seat allotments
            </span>
          </div>
          <span className="text-xs font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            {progressPercent}% Confirmed Seats
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand rounded-full transition-all duration-500"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps list */}
      <div className="space-y-4">
        {baseStages.map((stage) => {
          const countInStage = stageCounts[stage.stageKey] || 0;
          const isActive = countInStage > 0;

          return (
            <div
              key={stage.id}
              className={`p-5 rounded-2xl border transition ${
                isActive
                  ? "bg-surface border-primary/40 shadow-xs"
                  : "bg-surface/70 border-border/80"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                      isActive
                        ? "bg-gradient-brand text-primary-foreground shadow-glow"
                        : "bg-surface-alt text-ink-soft border border-border"
                    }`}
                  >
                    {stage.stageNumber}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-ink">{stage.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                            : "text-ink-soft bg-surface-alt border-border"
                        }`}
                      >
                        {countInStage > 0 ? "Active in Cohort" : "Upcoming"}
                      </span>
                      <span className="text-xs text-ink-soft font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stage.dateRange}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft max-w-2xl">{stage.description}</p>

                    {/* Milestones list */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      {stage.milestones.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-emerald-500" : "text-ink-soft/40"
                            }`}
                          />
                          <span className="truncate">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-right">
                    <span className="text-[10px] text-ink-soft block">Candidates in Stage</span>
                    <span className="text-sm font-black text-ink">{countInStage}</span>
                  </div>
                  <Link
                    href={`/recruiter/institution/admission-funnel/kanban?stage=${stage.stageKey}`}
                    className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View in Kanban</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Applicant Chronological Audit Log (AdmitFlow Integration) */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink">Recent Applicant Milestones & Audit Trail</h3>
            <p className="text-xs text-ink-soft">Chronological log of events across candidates</p>
          </div>
          <span className="text-xs font-bold text-ink-soft">
            {filteredApps.length} active records
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {filteredApps.slice(0, 5).map((app) => {
            const latestEvt = app.timeline?.[0];
            return (
              <div
                key={app._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-surface-alt/20 transition px-2 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-alt border border-border font-bold text-xs flex items-center justify-center text-ink shrink-0">
                    {app.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink">{app.name}</span>
                      <span className="text-[10px] text-ink-soft">{app.applicantId}</span>
                      <span className="text-[10px] text-primary-glow font-semibold bg-primary/10 px-1.5 py-0.5 rounded-md">
                        {app.program}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft mt-0.5">
                      {latestEvt ? `${latestEvt.title} · ${latestEvt.meta}` : "Application on file"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplicant(app)}
                  className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-semibold text-ink transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Eye className="w-3 h-3 text-ink-soft" />
                  <span>Dossier</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applicant Dossier Modal */}
      {selectedApplicant && (
        <AdmissionApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStage={async (st, note) => {
            await admissionService.updateStage(selectedApplicant._id, st, note);
            await loadData();
            setSelectedApplicant(null);
          }}
          onAddNote={async (note) => {
            await admissionService.addNote(selectedApplicant._id, note);
            await loadData();
          }}
        />
      )}
    </div>
  );
}
