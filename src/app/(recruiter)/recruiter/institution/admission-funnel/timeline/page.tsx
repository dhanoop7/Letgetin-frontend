"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface TimelineStage {
  id: string;
  stageNumber: number;
  name: string;
  dateRange: string;
  candidatesCount: number;
  status: "Completed" | "Active" | "Upcoming";
  description: string;
  milestones: string[];
}

export default function InstitutionAdmissionTimelinePage() {
  const [selectedProgram, setSelectedProgram] = useState("B.Tech Computer Science & AI (2027)");

  const stages: TimelineStage[] = [
    {
      id: "stage-1",
      stageNumber: 1,
      name: "Application Portal Open & Early Inquiries",
      dateRange: "Oct 01 – Dec 15, 2026",
      candidatesCount: 840,
      status: "Active",
      description: "Collecting online registration forms, 10+2 marks cards, entrance scorecards, and application fee deposits.",
      milestones: [
        "Online registration portal live",
        "Automated WhatsApp & Email verification",
        "Category certificate upload window",
      ],
    },
    {
      id: "stage-2",
      stageNumber: 2,
      name: "Document Verification & Score Normalization",
      dateRange: "Dec 16 – Dec 22, 2026",
      candidatesCount: 620,
      status: "Upcoming",
      description: "AI & administrative verification of marksheets, JEE Main / SAT percentile validation, and quota tagging.",
      milestones: [
        "Marksheet authenticity cross-checks",
        "Domicile & Sports quota certification",
        "Eligibility clearance report generated",
      ],
    },
    {
      id: "stage-3",
      stageNumber: 3,
      name: "Round 1 Merit Shortlist & Counseling Call",
      dateRange: "Dec 24 – Dec 28, 2026",
      candidatesCount: 380,
      status: "Upcoming",
      description: "Publishing official institutional merit cutoffs and dispatching 1:1 admission counseling appointment slots.",
      milestones: [
        "Cutoff list published on portal",
        "Counseling slot booking activated",
        "Merit scholarship recommendation list",
      ],
    },
    {
      id: "stage-4",
      stageNumber: 4,
      name: "Provisional Seat Allotment & Fee Deposit",
      dateRange: "Jan 02 – Jan 08, 2027",
      candidatesCount: 240,
      status: "Upcoming",
      description: "Issuing formal provisional admission allotment letters and collecting first-semester tuition token deposits.",
      milestones: [
        "Digital allotment letter generated",
        "Online tuition fee payment gateway",
        "Hostel & transport preference forms",
      ],
    },
    {
      id: "stage-5",
      stageNumber: 5,
      name: "Spot Round & Final Waitlist Clearance",
      dateRange: "Jan 10 – Jan 14, 2027",
      candidatesCount: 45,
      status: "Upcoming",
      description: "Final open counseling for vacant quota seats and waitlisted candidates.",
      milestones: [
        "Vacancy seat matrix announcement",
        "On-spot document handoff & fee payment",
      ],
    },
    {
      id: "stage-6",
      stageNumber: 6,
      name: "Orientation & Induction Week",
      dateRange: "Jan 18, 2027",
      candidatesCount: 240,
      status: "Upcoming",
      description: "Campus welcoming ceremony, student ID card distribution, and first semester academic briefing.",
      milestones: [
        "Student ID badge generation",
        "LMS & Portal login credentials issued",
        "Faculty mentorship team assigned",
      ],
    },
  ];

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
            Visual milestone tracker and chronological stage progression for current academic admission batches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary"
          >
            <option value="B.Tech Computer Science & AI (2027)">B.Tech CSE & AI (2027)</option>
            <option value="B.Tech Electronics & VLSI (2027)">B.Tech Electronics & VLSI</option>
            <option value="MBA & Executive Tech Management (2027)">MBA & Executive Tech</option>
          </select>
        </div>
      </div>

      {/* Progress Overview Bar */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink">{selectedProgram}</h3>
            <span className="text-xs text-ink-soft">Stage 1 of 6 in progress · 840 Applicants registered</span>
          </div>
          <span className="text-xs font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            16.6% Completed
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden">
          <div className="h-full bg-gradient-brand rounded-full w-[17%]" />
        </div>
      </div>

      {/* Timeline Steps list */}
      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className={`p-5 rounded-2xl border transition ${
              stage.status === "Active"
                ? "bg-surface border-primary/50 shadow-glow/10"
                : "bg-surface/70 border-border/80"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                    stage.status === "Active"
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
                        stage.status === "Active"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : "text-ink-soft bg-surface-alt border-border"
                      }`}
                    >
                      {stage.status}
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
                            stage.status === "Active" && mIdx === 0
                              ? "text-emerald-500"
                              : "text-ink-soft/40"
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
                  <span className="text-sm font-black text-ink">{stage.candidatesCount}</span>
                </div>
                <Link
                  href="/recruiter/institution/admission-funnel/kanban"
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink text-xs font-bold transition"
                >
                  View Kanban
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
