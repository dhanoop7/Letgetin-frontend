"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Users,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  X,
} from "lucide-react";

interface ApplicantCard {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  score: string;
  category: string;
  stage: "inquiry" | "submitted" | "shortlisted" | "counseling" | "enrolled";
  appliedDate: string;
}

const STAGES = [
  { id: "inquiry", name: "Inquiry / Lead", color: "border-blue-500/30 text-blue-500" },
  { id: "submitted", name: "Form Submitted", color: "border-amber-500/30 text-amber-500" },
  { id: "shortlisted", name: "Merit Shortlist", color: "border-purple-500/30 text-purple-500" },
  { id: "counseling", name: "Counseling Slot", color: "border-indigo-500/30 text-indigo-500" },
  { id: "enrolled", name: "Seat Confirmed", color: "border-emerald-500/30 text-emerald-500" },
] as const;

export default function InstitutionAdmissionKanbanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantCard | null>(null);

  const [applicants, setApplicants] = useState<ApplicantCard[]>([
    {
      id: "app-1",
      name: "Rohan Verma",
      email: "rohan.v@gmail.com",
      phone: "+91 98451 23041",
      program: "B.Tech CSE (AI & ML)",
      score: "JEE 98.4%ile (94.2% in 12th)",
      category: "General Merit",
      stage: "inquiry",
      appliedDate: "Oct 08, 2026",
    },
    {
      id: "app-2",
      name: "Sneha Mukherjee",
      email: "sneha.m@outlook.com",
      phone: "+91 97120 44521",
      program: "B.Tech Electronics & VLSI",
      score: "State CET Rank 1,420",
      category: "Merit Scholar",
      stage: "inquiry",
      appliedDate: "Oct 09, 2026",
    },
    {
      id: "app-3",
      name: "Aakash Deep",
      email: "aakash.deep@yahoo.com",
      phone: "+91 91234 88765",
      program: "B.Tech CSE (Data Science)",
      score: "92.0% in 12th PCM",
      category: "General",
      stage: "submitted",
      appliedDate: "Oct 05, 2026",
    },
    {
      id: "app-4",
      name: "Pooja Hegde",
      email: "pooja.hegde@gmail.com",
      phone: "+91 88412 99012",
      program: "MBA (FinTech & Analytics)",
      score: "CAT 94.8%ile",
      category: "Corporate Sponsored",
      stage: "submitted",
      appliedDate: "Oct 06, 2026",
    },
    {
      id: "app-5",
      name: "Vikram Malhotra",
      email: "vikram.m@gmail.com",
      phone: "+91 96540 11234",
      program: "B.Tech Robotics & IoT",
      score: "JEE 97.2%ile",
      category: "Merit Quota",
      stage: "shortlisted",
      appliedDate: "Sep 28, 2026",
    },
    {
      id: "app-6",
      name: "Ananya Iyer",
      email: "ananya.iyer@gmail.com",
      phone: "+91 99002 45671",
      program: "B.Tech CSE (AI & ML)",
      score: "SAT 1480 / 1600",
      category: "International Exchange",
      stage: "shortlisted",
      appliedDate: "Sep 29, 2026",
    },
    {
      id: "app-7",
      name: "Karan Johar",
      email: "karan.j@hotmail.com",
      phone: "+91 98860 33412",
      program: "MBA Executive Management",
      score: "GMAT 710 Score",
      category: "Executive Quota",
      stage: "counseling",
      appliedDate: "Sep 20, 2026",
    },
    {
      id: "app-8",
      name: "Divya Nair",
      email: "divya.nair@gmail.com",
      phone: "+91 94471 88921",
      program: "B.Tech CSE (AI & ML)",
      score: "JEE 99.1%ile (Top 1000)",
      category: "100% Tuition Scholar",
      stage: "enrolled",
      appliedDate: "Sep 15, 2026",
    },
  ]);

  const moveStage = (id: string, direction: "next" | "prev") => {
    const stageOrder: ApplicantCard["stage"][] = [
      "inquiry",
      "submitted",
      "shortlisted",
      "counseling",
      "enrolled",
    ];

    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const currentIndex = stageOrder.indexOf(app.stage);
        const nextIndex =
          direction === "next"
            ? Math.min(currentIndex + 1, stageOrder.length - 1)
            : Math.max(currentIndex - 1, 0);
        return { ...app, stage: stageOrder[nextIndex] };
      })
    );
  };

  const filteredApplicants = applicants.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.score.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Admission Kanban</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Visual pipeline board for moving applicants from inquiry to counseling and final seat enrollment.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colApplicants = filteredApplicants.filter((a) => a.stage === col.id);

          return (
            <div
              key={col.id}
              className="bg-surface/90 border border-border/80 rounded-2xl p-3.5 flex flex-col min-w-[250px] shadow-xs space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <span className={`text-xs font-black tracking-tight ${col.color}`}>{col.name}</span>
                <span className="text-[11px] font-bold bg-surface-alt text-ink-soft px-2 py-0.5 rounded-full">
                  {colApplicants.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 min-h-[400px]">
                {colApplicants.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-border/60 rounded-xl text-[11px] text-ink-soft">
                    No applicants in this stage
                  </div>
                ) : (
                  colApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-surface-alt/50 hover:bg-surface-alt/80 border border-border hover:border-primary/40 transition shadow-xs space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-ink group-hover:text-primary-glow transition">
                            {app.name}
                          </h4>
                          <span className="text-[10.5px] text-primary-glow font-medium block truncate max-w-[180px]">
                            {app.program}
                          </span>
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                          {app.category}
                        </span>
                      </div>

                      <div className="text-[10px] text-ink-soft space-y-0.5">
                        <p className="font-semibold text-ink">{app.score}</p>
                        <p>{app.appliedDate}</p>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(app)}
                          className="text-[10px] font-bold text-ink-soft hover:text-ink transition cursor-pointer"
                        >
                          Details
                        </button>
                        <div className="flex items-center gap-1">
                          {col.id !== "inquiry" && (
                            <button
                              type="button"
                              onClick={() => moveStage(app.id, "prev")}
                              className="p-1 rounded-md bg-surface hover:bg-surface-alt border border-border text-ink-soft hover:text-ink text-[10px]"
                              title="Move Back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== "enrolled" && (
                            <button
                              type="button"
                              onClick={() => moveStage(app.id, "next")}
                              className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-glow text-[10px] font-bold"
                              title="Advance Stage"
                            >
                              <ArrowRight className="w-3 h-3" />
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

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Applicant Dossier</h3>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-alt/60 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px]">Candidate Name</span>
                <p className="font-bold text-ink text-sm">{selectedApplicant.name}</p>
                <p className="text-primary-glow font-medium">{selectedApplicant.program}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Score / Percentile</span>
                  <p className="font-bold text-ink mt-0.5">{selectedApplicant.score}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Quota Category</span>
                  <p className="font-bold text-emerald-500 mt-0.5">{selectedApplicant.category}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Email</span>
                  <p className="text-ink truncate mt-0.5">{selectedApplicant.email}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Phone</span>
                  <p className="text-ink mt-0.5">{selectedApplicant.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-bold hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
