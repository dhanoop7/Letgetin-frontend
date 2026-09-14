"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronRight,
  Sparkles,
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  Check,
  X,
  ArrowRight,
  Eye,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import {
  PIPELINE_STAGES,
  MOCK_CANDIDATES,
  PIPELINE_METRICS,
} from "@/features/hiringPipeline/data/mockPipelineData";
import {
  PipelineCandidate,
  PipelineStageId,
  CandidateStatus,
} from "@/features/hiringPipeline/types/pipeline.types";

const STAGE_BADGES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  "resume-gathering": {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/20",
  },
  "resume-shortlisting": {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/20",
  },
  "interview-round-1": {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20",
  },
  "interview-round-2": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/20",
  },
  "final-shortlist": {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
  },
  hired: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20",
  },
};

const STATUS_PILLS: Record<string, string> = {
  "Under Review": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  "Screening": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  "Interview Scheduled": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  "Passed Round 1": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  "In Panel Review": "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  "Offer Extended": "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  "Hired": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
};

export default function CandidateListingPage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(MOCK_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match-desc" | "exp-desc" | "name-asc">("match-desc");
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter and Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((cand) => {
        const matchesSearch =
          cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cand.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cand.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cand.currentCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cand.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStage =
          selectedStage === "All" || cand.stageId === selectedStage;

        const matchesRole =
          selectedRole === "All" || cand.appliedRole === selectedRole;

        return matchesSearch && matchesStage && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === "match-desc") {
          return b.matchScore - a.matchScore;
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "exp-desc") {
          const expA = parseFloat(a.experience) || 0;
          const expB = parseFloat(b.experience) || 0;
          return expB - expA;
        }
        return 0;
      });
  }, [candidates, searchQuery, selectedStage, selectedRole, sortBy]);

  // Roles list
  const roles = [
    "All",
    "Senior Full Stack Engineer",
    "Staff AI/ML Engineer",
    "Lead Product Designer",
    "DevOps & Infrastructure Lead",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
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
            <span className="font-semibold text-primary">Candidate Listing</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Candidate Listing
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary-glow border border-primary/20">
              <Users className="w-3 h-3" /> Complete Roster
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Browse, search, and evaluate all active applicants across every hiring stage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => showToast("Exported candidate listing to CSV")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-ink shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-ink-soft" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <HiringPipelineNavTabs />

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <span className="text-xs text-ink-soft font-semibold">Total Sourced</span>
          <div className="text-2xl font-black text-ink mt-1">
            {PIPELINE_METRICS.totalSourced}
          </div>
          <div className="text-[11px] text-ink-soft mt-0.5">
            Across direct & external portals
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <span className="text-xs text-ink-soft font-semibold">Active in Stages</span>
          <div className="text-2xl font-black text-ink mt-1">
            {PIPELINE_METRICS.activeInFunnel}
          </div>
          <div className="text-[11px] text-primary font-semibold mt-0.5">
            {filteredCandidates.length} matching active filters
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <span className="text-xs text-ink-soft font-semibold">In Interview Rounds</span>
          <div className="text-2xl font-black text-ink mt-1">36</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
            Round 1 & Round 2 evaluations
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <span className="text-xs text-ink-soft font-semibold">Hired / Accepted</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            2
          </div>
          <div className="text-[11px] text-ink-soft mt-0.5">
            100% acceptance conversion
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate by name, email, skill, or employer..."
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

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="All">All Stages ({candidates.length})</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Briefcase className="w-3.5 h-3.5" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r === "All" ? "All Roles" : r}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="match-desc">Highest Match %</option>
                <option value="exp-desc">Most Experience</option>
                <option value="name-asc">Candidate Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CANDIDATE TABLE */}
      <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-alt/60 text-[11px] font-extrabold text-ink-soft uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Applied Role</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Match %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-soft">
                    <Users className="w-10 h-10 mx-auto mb-2 text-ink-soft/50" />
                    <p className="font-semibold text-ink">No candidates match your current search criteria.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStage("All");
                        setSelectedRole("All");
                      }}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const stageBadge =
                    STAGE_BADGES[cand.stageId] || STAGE_BADGES["resume-gathering"];
                  const statusPill =
                    STATUS_PILLS[cand.status] ||
                    "bg-surface-alt text-ink-soft border-border";

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-surface-alt/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 shadow-2xs">
                            {cand.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-bold text-ink group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{cand.name}</span>
                              <div className="flex items-center text-[10px] text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span className="ml-0.5">{cand.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-[11px] text-ink-soft truncate max-w-[180px]">
                              {cand.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Role & Company */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-ink">{cand.appliedRole}</div>
                        <div className="text-[11px] text-ink-soft">
                          {cand.currentCompany}
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/recruiter/hiring-pipeline/timeline/${cand.stageId}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${stageBadge.bg} ${stageBadge.text} ${stageBadge.border} hover:opacity-80 transition`}
                        >
                          <span>{cand.stageName}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-4 font-semibold text-ink">
                        {cand.experience}
                        <div className="text-[10px] text-ink-soft font-normal">
                          {cand.location.split("(")[0]}
                        </div>
                      </td>

                      {/* Match % */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-primary text-xs">
                            {cand.matchScore}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-surface-alt border border-border overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
                              style={{ width: `${cand.matchScore}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-[10px] text-ink-soft mt-0.5">
                          {cand.skills[0]}, {cand.skills[1]}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill}`}
                        >
                          {cand.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-ink-soft hover:text-ink transition shadow-2xs"
                            title="View Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`Candidate ${cand.name} marked for interview scheduling`)
                            }
                            className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-surface font-bold text-[11px] shadow-2xs transition"
                          >
                            Advance
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary */}
        <div className="p-4 border-t border-border bg-surface-alt/40 flex items-center justify-between text-xs text-ink-soft">
          <span>
            Showing <strong className="text-ink">{filteredCandidates.length}</strong> of{" "}
            {candidates.length} candidates
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">Mock Recruitment Database</span>
          </div>
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-xl shadow-xs">
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
                    <Phone className="w-3.5 h-3.5" /> {selectedCandidate.phone}
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
                <span>Evaluation Status</span>
                <span className="text-primary font-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedCandidate.rating.toFixed(1)} / 5.0 Rating
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

            {/* Skills */}
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
                  showToast(`Scheduled next step for ${selectedCandidate.name}!`);
                  setSelectedCandidate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Advance Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
