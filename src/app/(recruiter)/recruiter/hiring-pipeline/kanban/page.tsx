"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  Search,
  Filter,
  Plus,
  Sparkles,
  ChevronRight,
  Star,
  Clock,
  MoreHorizontal,
  MoveRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  X,
  Check,
  Download,
  SlidersHorizontal,
  ArrowRight,
  Layers,
} from "lucide-react";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import {
  PIPELINE_STAGES,
  MOCK_CANDIDATES,
  PIPELINE_METRICS,
} from "@/features/hiringPipeline/data/mockPipelineData";
import {
  PipelineStage,
  PipelineCandidate,
  PipelineStageId,
} from "@/features/hiringPipeline/types/pipeline.types";

const STAGE_COLUMN_COLORS: Record<
  string,
  {
    headerBg: string;
    dotColor: string;
    badgeBg: string;
    borderColor: string;
  }
> = {
  "resume-gathering": {
    headerBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-500/20",
  },
  "resume-shortlisting": {
    headerBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    dotColor: "bg-purple-500",
    badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-500/20",
  },
  "interview-round-1": {
    headerBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-500/20",
  },
  "interview-round-2": {
    headerBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    dotColor: "bg-indigo-500",
    badgeBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    borderColor: "border-indigo-500/20",
  },
  "final-shortlist": {
    headerBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dotColor: "bg-rose-500",
    badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-500/20",
  },
  hired: {
    headerBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-500/20",
  },
};

export default function KanbanBoardPage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(MOCK_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const roles = [
    "All",
    "Senior Full Stack Engineer",
    "Staff AI/ML Engineer",
    "Lead Product Designer",
    "DevOps & Infrastructure Lead",
  ];

  // Quick move candidate to next column (UI simulation)
  const handleAdvanceCandidate = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stageSequence: PipelineStageId[] = [
      "resume-gathering",
      "resume-shortlisting",
      "interview-round-1",
      "interview-round-2",
      "final-shortlist",
      "hired",
    ];

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const currentIndex = stageSequence.indexOf(c.stageId);
          if (currentIndex < stageSequence.length - 1) {
            const nextStageId = stageSequence[currentIndex + 1];
            const nextStage = PIPELINE_STAGES.find((s) => s.id === nextStageId);
            showToast(
              `Moved ${c.name} to ${nextStage?.name || "next stage"}`
            );
            return {
              ...c,
              stageId: nextStageId,
              stageName: nextStage?.name || c.stageName,
            };
          }
        }
        return c;
      })
    );
  };

  // Filter candidates based on search & role
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const matchesSearch =
        cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cand.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "All" || cand.appliedRole === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [candidates, searchQuery, selectedRole]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-ink text-surface shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-soft mb-2">
            <span>Recruiter</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/60" />
            <span>Hiring Pipeline</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/60" />
            <span className="font-semibold text-primary">Kanban Board</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Kanban Board
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary-glow border border-primary/20">
              <KanbanSquare className="w-3 h-3" /> Multi-Stage Flow
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Visual stage-by-stage candidate progression across 6 active recruitment columns.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink shadow-xs focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All Requisitions" : r}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => showToast("Exported Kanban state snapshot")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-ink shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-ink-soft" />
            <span className="hidden sm:inline">Export Board</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <HiringPipelineNavTabs />

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter candidates by name, skill, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-soft font-semibold">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>Showing {filteredCandidates.length} Active Candidates</span>
          </div>
          <span className="text-border">•</span>
          <span className="hidden sm:inline">Click any card to inspect dossier</span>
        </div>
      </div>

      {/* HORIZONTAL KANBAN COLUMNS */}
      <div className="overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1300px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageCands = filteredCandidates.filter(
              (c) => c.stageId === stage.id
            );
            const style = STAGE_COLUMN_COLORS[stage.id] || STAGE_COLUMN_COLORS["resume-gathering"];

            return (
              <div
                key={stage.id}
                className="w-80 shrink-0 flex flex-col rounded-2xl bg-surface-alt/40 border border-border/80 shadow-xs max-h-[780px]"
              >
                {/* Column Header */}
                <div
                  className={`p-4 rounded-t-2xl border-b ${style.borderColor} bg-surface flex items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dotColor}`} />
                    <h3 className="text-xs font-extrabold text-ink tracking-tight">
                      {stage.name === "Resume Shortlisting" ? "Shortlisted" : stage.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${style.badgeBg}`}
                    >
                      {stageCands.length}
                    </span>
                    <Link
                      href={`/recruiter/hiring-pipeline/timeline/${stage.id}`}
                      className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition"
                      title="Inspect Stage Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Candidate Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageCands.length === 0 ? (
                    <div className="py-12 text-center text-xs text-ink-soft border border-dashed border-border/80 rounded-xl">
                      No candidates in this stage
                    </div>
                  ) : (
                    stageCands.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="group p-3.5 rounded-xl bg-surface border border-border hover:border-primary/50 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                      >
                        {/* Match & Rating */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="w-2.5 h-2.5 text-primary-glow" />
                            {cand.matchScore}% Match
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{cand.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Name & Applied Role */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                            {cand.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-ink group-hover:text-primary transition-colors truncate">
                              {cand.name}
                            </h4>
                            <p className="text-[11px] text-ink-soft truncate">
                              {cand.appliedRole}
                            </p>
                          </div>
                        </div>

                        {/* Company & Experience */}
                        <div className="text-[10px] text-ink-soft flex items-center justify-between border-t border-border/60 pt-2">
                          <span className="truncate max-w-[140px] font-medium">
                            {cand.currentCompany}
                          </span>
                          <span className="font-semibold text-ink/80">
                            {cand.experience}
                          </span>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1">
                          {cand.skills.slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface-alt text-ink-soft border border-border"
                            >
                              {skill}
                            </span>
                          ))}
                          {cand.skills.length > 2 && (
                            <span className="text-[9px] font-bold text-ink-soft self-center">
                              +{cand.skills.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Move stage action if not hired */}
                        {stage.id !== "hired" && (
                          <div className="border-t border-border/60 pt-2 flex items-center justify-between text-[10px]">
                            <span className="text-ink-soft truncate text-[9px]">
                              {cand.appliedDate}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleAdvanceCandidate(cand.id, e)}
                              className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary-hover transition"
                            >
                              <span>Next Stage</span>
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Dossier Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-lg shadow-xs">
                {selectedCandidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-ink">
                    {selectedCandidate.name}
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedCandidate.matchScore}% Match
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-border text-ink-soft">
                    {selectedCandidate.stageName}
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  {selectedCandidate.appliedRole} • {selectedCandidate.experience} Experience
                </p>
                <div className="flex items-center gap-4 text-xs text-ink-soft mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedCandidate.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedCandidate.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-2.5">
              <div className="text-xs font-bold text-ink flex items-center justify-between">
                <span>Recent Milestone & Activity</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {selectedCandidate.status}
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                {selectedCandidate.lastActivity}
              </p>
              <div className="flex items-center justify-between text-[11px] text-ink-soft border-t border-border/60 pt-2">
                <span>Interviewer: <strong className="text-ink">{selectedCandidate.interviewer}</strong></span>
                <span>Applied: {selectedCandidate.appliedDate}</span>
              </div>
            </div>

            {/* Skills Badges */}
            <div>
              <h4 className="text-xs font-bold text-ink mb-2">Verified Skill Badges</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-surface-alt border border-border text-ink flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Profile for ${selectedCandidate.name} updated!`);
                  setSelectedCandidate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Evaluation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
