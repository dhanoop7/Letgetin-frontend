"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Filter,
  UserCheck,
  Brain,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Calendar,
  MessageSquare,
  Clock,
  UserPlus,
  Users,
  ExternalLink,
} from "lucide-react";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import {
  PIPELINE_STAGES,
  getStageById,
  getCandidatesByStage,
} from "@/features/hiringPipeline/data/mockPipelineData";
import {
  PipelineStage,
  PipelineCandidate,
} from "@/features/hiringPipeline/types/pipeline.types";

const STAGE_ICONS: Record<string, React.ElementType> = {
  "resume-gathering": FileText,
  "resume-shortlisting": Filter,
  "interview-round-1": UserCheck,
  "interview-round-2": Brain,
  "final-shortlist": Award,
  hired: CheckCircle2,
};

export default function StageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const stageSlug = typeof params?.stage === "string" ? params.stage : "";

  const stage: PipelineStage | undefined = useMemo(() => {
    return getStageById(stageSlug);
  }, [stageSlug]);

  const allStageCandidates: PipelineCandidate[] = useMemo(() => {
    return getCandidatesByStage(stageSlug);
  }, [stageSlug]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCandidates = useMemo(() => {
    return allStageCandidates.filter((cand) => {
      const matchesSearch =
        cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cand.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "All" || cand.appliedRole === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [allStageCandidates, searchQuery, selectedRole]);

  // If stage not found
  if (!stage) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <HiringPipelineNavTabs />
        <div className="p-12 text-center rounded-3xl bg-surface border border-border">
          <FileText className="w-12 h-12 text-ink-soft mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">Stage Not Found</h2>
          <p className="text-sm text-ink-soft mt-1 max-w-md mx-auto">
            The requested pipeline stage &quot;{stageSlug}&quot; does not exist in the hiring workflow.
          </p>
          <Link
            href="/recruiter/hiring-pipeline/timeline"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-primary text-surface font-semibold text-xs hover:bg-primary-hover transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Hiring Timeline</span>
          </Link>
        </div>
      </div>
    );
  }

  const StageIcon = STAGE_ICONS[stage.id] || FileText;

  // Determine stage adjacent navigation
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === stage.id);
  const prevStage = currentIndex > 0 ? PIPELINE_STAGES[currentIndex - 1] : null;
  const nextStage =
    currentIndex < PIPELINE_STAGES.length - 1
      ? PIPELINE_STAGES[currentIndex + 1]
      : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-ink text-surface shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-soft mb-2">
            <Link
              href="/recruiter/hiring-pipeline/timeline"
              className="hover:text-primary transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Timeline
            </Link>
            <ChevronRight className="w-3 h-3 text-ink-soft/50" />
            <span>Hiring Pipeline</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/50" />
            <span>Stages</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/50" />
            <span className="font-semibold text-primary">{stage.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.colorTheme.iconBg}`}
            >
              <StageIcon className={`w-5 h-5 ${stage.colorTheme.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {stage.name}
                </h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stage.colorTheme.badge}`}
                >
                  Stage {stage.stepNumber} of {PIPELINE_STAGES.length}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">{stage.description}</p>
            </div>
          </div>
        </div>

        {/* Stage Pager */}
        <div className="flex items-center gap-2">
          {prevStage && (
            <Link
              href={`/recruiter/hiring-pipeline/timeline/${prevStage.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-ink shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-ink-soft" />
              <span className="hidden sm:inline">Prev:</span> {prevStage.shortName}
            </Link>
          )}
          {nextStage && (
            <Link
              href={`/recruiter/hiring-pipeline/timeline/${nextStage.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-surface hover:bg-primary-hover text-xs font-semibold shadow-xs transition"
            >
              <span className="hidden sm:inline">Next:</span> {nextStage.shortName}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <HiringPipelineNavTabs />

      {/* Stage KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Candidates in Stage</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-ink mt-2">{stage.count}</div>
          <div className="text-[11px] text-ink-soft font-medium mt-0.5">
            {allStageCandidates.length} profiles displayed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Avg. Velocity</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-ink mt-2">{stage.avgDays}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            On track with SLA
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Conversion Target</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-ink mt-2">
            {stage.conversionRate.split(" ")[0]}
          </div>
          <div className="text-[11px] text-ink-soft font-medium mt-0.5">
            Advances to next milestone
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Stage Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stage.status}
          </div>
          <div className="text-[11px] text-ink-soft font-medium mt-0.5">
            Zero blockers detected
          </div>
        </div>
      </div>

      {/* Candidate Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, role, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-alt/70 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
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

        {/* Filter by Role */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-soft font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All">All Roles ({allStageCandidates.length})</option>
            <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
            <option value="Staff AI/ML Engineer">Staff AI/ML Engineer</option>
            <option value="Lead Product Designer">Lead Product Designer</option>
            <option value="DevOps & Infrastructure Lead">DevOps & Infrastructure Lead</option>
          </select>

          <button
            onClick={() => showToast("Exported stage candidate list to CSV")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-ink shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-ink-soft" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Active Candidates in this Stage ({filteredCandidates.length})
          </h2>
          <span className="text-xs text-ink-soft">
            Showing curated profiles with AI match scores
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-border">
            <Users className="w-10 h-10 text-ink-soft mx-auto mb-3" />
            <h3 className="text-sm font-bold text-ink">No candidates match your filters</h3>
            <p className="text-xs text-ink-soft mt-1">
              Try adjusting your search query or role filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:bg-surface transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="group rounded-2xl bg-surface border border-border hover:border-primary/50 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Match Score & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="w-3 h-3 text-primary-glow" />
                      {cand.matchScore}% Match
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{cand.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Candidate Avatar & Names */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-xs shrink-0">
                      {cand.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                        {cand.name}
                      </h3>
                      <p className="text-xs font-medium text-ink-soft">
                        {cand.appliedRole}
                      </p>
                      <p className="text-[11px] text-ink-soft/80 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" /> {cand.currentCompany} ({cand.experience})
                      </p>
                    </div>
                  </div>

                  {/* Contact Snippets */}
                  <div className="space-y-1 text-[11px] text-ink-soft bg-surface-alt/60 p-2.5 rounded-xl border border-border/60 mb-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-ink-soft shrink-0" />
                      <span className="truncate">{cand.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-ink-soft shrink-0" />
                      <span className="truncate">{cand.location}</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cand.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                    {cand.skills.length > 4 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-ink-soft">
                        +{cand.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity & Action Buttons */}
                <div className="border-t border-border/70 pt-3 space-y-2">
                  <div className="text-[11px] text-ink-soft flex items-center justify-between">
                    <span className="truncate font-medium text-xs text-ink/80">
                      {cand.lastActivity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(cand)}
                      className="w-full py-2 px-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-bold text-ink transition text-center shadow-xs"
                    >
                      View Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Advanced ${cand.name} towards next evaluation round!`)
                      }
                      className="w-full py-2 px-2.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold transition text-center shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Advance</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Next Step Recommendation Banner */}
      {nextStage && (
        <div className="p-6 rounded-3xl bg-surface-alt/60 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Next Recommended Pipeline Milestone
            </div>
            <h3 className="text-base font-extrabold text-ink">
              Ready to progress candidates to {nextStage.name}?
            </h3>
            <p className="text-xs text-ink-soft mt-0.5 max-w-2xl">
              Qualified candidates in {stage.name} can be bulk-promoted to {nextStage.name} once technical screenings and interview rubrics are verified.
            </p>
          </div>
          <Link
            href={`/recruiter/hiring-pipeline/timeline/${nextStage.id}`}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-surface hover:bg-primary-hover text-xs font-bold shadow-xs transition"
          >
            <span>Proceed to {nextStage.shortName}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

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
                <div className="flex items-center gap-2.5 flex-wrap">
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

            {/* Evaluation Summary */}
            <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border space-y-3">
              <div className="text-xs font-bold text-ink flex items-center justify-between">
                <span>Stage Evaluation Summary</span>
                <span className="text-primary font-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedCandidate.rating.toFixed(1)} / 5.0 Rating
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Strong proficiency demonstrated across core architectural principles. Candidate successfully passed code review assessment and showed deep system problem solving.
              </p>
              <div className="flex items-center justify-between text-[11px] text-ink-soft border-t border-border/60 pt-2">
                <span>Assigned Interviewer: <strong className="text-ink">{selectedCandidate.interviewer}</strong></span>
                <span>Applied: {selectedCandidate.appliedDate}</span>
              </div>
            </div>

            {/* Verified Skills */}
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

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Candidate ${selectedCandidate.name} approved for promotion!`);
                  setSelectedCandidate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-surface text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Promote to Next Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
