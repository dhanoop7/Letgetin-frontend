"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck,
} from "lucide-react";
import { admissionService } from "@/features/institution/services/admissionService";
import {
  AdmissionApplication,
  AdmissionStage,
  AdmissionTrack,
} from "@/features/institution/types/admission.types";
import { AdmissionApplicantModal } from "@/features/institution/components/AdmissionApplicantModal";

const STAGES: { id: AdmissionStage; name: string; color: string; badge: string }[] = [
  {
    id: "inquiry",
    name: "Inquiry / Lead",
    color: "border-blue-500/30 text-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "submitted",
    name: "Form Submitted",
    color: "border-amber-500/30 text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "shortlisted",
    name: "Merit Shortlist",
    color: "border-purple-500/30 text-purple-500",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "counseling",
    name: "Counseling Slot",
    color: "border-indigo-500/30 text-indigo-500",
    badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  {
    id: "enrolled",
    name: "Seat Confirmed",
    color: "border-emerald-500/30 text-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
];

export default function InstitutionAdmissionKanbanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("All");
  const [tracks, setTracks] = useState<AdmissionTrack[]>([]);
  const [applicants, setApplicants] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<AdmissionApplication | null>(null);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [trackData, appData] = await Promise.all([
        admissionService.getTracks(),
        admissionService.getApplications(),
      ]);
      setTracks(trackData);
      setApplicants(appData);
    } catch (err) {
      console.error("Failed to load kanban data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const moveStage = async (id: string, direction: "next" | "prev") => {
    const stageOrder: AdmissionStage[] = [
      "inquiry",
      "submitted",
      "shortlisted",
      "counseling",
      "enrolled",
    ];

    const currentApp = applicants.find((a) => a._id === id);
    if (!currentApp) return;

    const currentIndex = stageOrder.indexOf(currentApp.stage);
    const nextIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, stageOrder.length - 1)
        : Math.max(currentIndex - 1, 0);

    const targetStage = stageOrder[nextIndex];
    if (targetStage === currentApp.stage) return;

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((app) => (app._id === id ? { ...app, stage: targetStage } : app))
    );

    try {
      await admissionService.updateStage(id, targetStage);
      showToast(`${currentApp.name} moved to stage "${targetStage.toUpperCase()}"`);
    } catch (err) {
      console.error("Stage move failed", err);
      // Reload on failure
      loadData();
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: AdmissionStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedAppId;
    if (!id) return;

    const currentApp = applicants.find((a) => a._id === id);
    if (!currentApp || currentApp.stage === targetStage) return;

    setApplicants((prev) =>
      prev.map((app) => (app._id === id ? { ...app, stage: targetStage } : app))
    );

    try {
      await admissionService.updateStage(id, targetStage);
      showToast(`${currentApp.name} moved to "${targetStage}"`);
    } catch (err) {
      console.error("Stage move failed", err);
      loadData();
    } finally {
      setDraggedAppId(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.score && app.score.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProgram =
      programFilter === "All" || app.program.toLowerCase().includes(programFilter.toLowerCase());

    return matchesSearch && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
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
            Visual pipeline board with real-time stage progression and dossier management across admission tracks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary shadow-xs"
          >
            <option value="All">All Tracks ({applicants.length})</option>
            {tracks.map((t) => (
              <option key={t._id} value={t.program}>
                {t.program}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Filter candidate or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Kanban Board Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-ink-soft text-xs">Loading admission pipeline board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const colApplicants = filteredApplicants.filter((a) => a.stage === col.id);

            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-surface/90 border border-border/80 rounded-2xl p-3.5 flex flex-col min-w-[260px] shadow-xs space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <span className={`text-xs font-black tracking-tight ${col.color}`}>{col.name}</span>
                  <span className="text-[11px] font-bold bg-surface-alt text-ink px-2 py-0.5 rounded-full border border-border">
                    {colApplicants.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 min-h-[420px]">
                  {colApplicants.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-border/60 rounded-xl text-[11px] text-ink-soft">
                      Drop applicants here
                    </div>
                  ) : (
                    colApplicants.map((app) => (
                      <div
                        key={app._id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", app._id);
                          setDraggedAppId(app._id);
                        }}
                        className="p-3.5 rounded-xl bg-surface-alt/50 hover:bg-surface-alt/90 border border-border hover:border-primary/40 transition shadow-xs space-y-2 group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-ink group-hover:text-primary-glow transition truncate">
                              {app.name}
                            </h4>
                            <span className="text-[10px] text-primary-glow font-medium block truncate max-w-[170px]">
                              {app.program}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                            {app.category}
                          </span>
                        </div>

                        <div className="text-[10px] text-ink-soft space-y-0.5">
                          <p className="font-semibold text-ink truncate">{app.score || "Awaiting score"}</p>
                          <div className="flex items-center justify-between text-[10px]">
                            <span>ID: {app.applicantId}</span>
                            <span>{app.appliedDate}</span>
                          </div>
                        </div>

                        {/* Card Footer Features from AdmitFlow */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicant(app)}
                            className="text-[10px] font-bold text-ink-soft hover:text-ink transition cursor-pointer flex items-center gap-1"
                          >
                            <FileCheck className="w-3 h-3 text-primary-glow" />
                            <span>Dossier</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {col.id !== "inquiry" && (
                              <button
                                type="button"
                                onClick={() => moveStage(app._id, "prev")}
                                className="p-1 rounded-md bg-surface hover:bg-surface-alt border border-border text-ink-soft hover:text-ink text-[10px] transition cursor-pointer"
                                title="Move Back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== "enrolled" && (
                              <button
                                type="button"
                                onClick={() => moveStage(app._id, "next")}
                                className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-glow text-[10px] font-bold transition cursor-pointer"
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
      )}

      {/* Applicant Dossier Modal (AdmitFlow Integration) */}
      {selectedApplicant && (
        <AdmissionApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStage={async (st, note) => {
            await admissionService.updateStage(selectedApplicant._id, st, note);
            await loadData();
            setSelectedApplicant(null);
            showToast(`${selectedApplicant.name} moved to "${st}"`);
          }}
          onAddNote={async (note) => {
            await admissionService.addNote(selectedApplicant._id, note);
            await loadData();
            showToast("Internal note recorded");
          }}
        />
      )}
    </div>
  );
}
