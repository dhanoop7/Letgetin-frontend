"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Filter,
  UserCheck,
  Brain,
  Award,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  Briefcase,
  Layers,
} from "lucide-react";
import { HiringPipelineNavTabs } from "@/components/recruiter/HiringPipelineNavTabs";
import {
  PIPELINE_STAGES,
  PIPELINE_METRICS,
} from "@/features/hiringPipeline/data/mockPipelineData";
import { PipelineStage } from "@/features/hiringPipeline/types/pipeline.types";

const STAGE_ICONS = {
  "resume-gathering": FileText,
  "resume-shortlisting": Filter,
  "interview-round-1": UserCheck,
  "interview-round-2": Brain,
  "final-shortlist": Award,
  hired: CheckCircle2,
};

export default function HiringTimelinePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("All Open Requisitions");

  const roles = [
    "All Open Requisitions",
    "Senior Full Stack Engineer",
    "Staff AI/ML Engineer",
    "Lead Product Designer",
    "DevOps & Infrastructure Lead",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-soft mb-2">
            <span>Recruiter</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/60" />
            <span>Hiring Pipeline</span>
            <ChevronRight className="w-3 h-3 text-ink-soft/60" />
            <span className="font-semibold text-primary">Hiring Timeline</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Hiring Timeline
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary-glow border border-primary/20">
              <Sparkles className="w-3 h-3" /> Visual Hiring Journey
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            End-to-end recruitment lifecycle from initial resume intake to final hire. Click any stage to inspect candidate details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Requisition Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-ink shadow-xs focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer pr-8"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-ink shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-ink-soft" />
            <span>Export Journey</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <HiringPipelineNavTabs />

      {/* High-Level Pipeline KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Total Inbound Sourced</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
            {PIPELINE_METRICS.totalSourced}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% vs. previous sprint
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Active in Pipeline</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
            {PIPELINE_METRICS.activeInFunnel}
          </div>
          <div className="text-[11px] text-ink-soft font-medium mt-1">
            Distributed across 6 stages
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Avg. Time to Hire</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
            {PIPELINE_METRICS.avgTimeToHireDays} <span className="text-sm font-bold text-ink-soft">Days</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            3.5 days faster than industry avg
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-soft font-semibold">
            <span>Offer Acceptance</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {PIPELINE_METRICS.offerAcceptanceRate}%
          </div>
          <div className="text-[11px] text-ink-soft font-medium mt-1">
            2 of 2 extended offers accepted
          </div>
        </div>
      </div>

      {/* Main Card-Based Hiring Journey Section */}
      <div className="rounded-3xl bg-surface border border-border/90 p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <span>Recruitment Funnel & Stage Progression</span>
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Click any stage card below to inspect candidate dossiers, scores, and transition details.
            </p>
          </div>
          <span className="text-xs font-bold text-ink-soft px-3 py-1.5 rounded-full bg-surface-alt border border-border">
            Showing 6 Connected Stages
          </span>
        </div>

        {/* CONNECTED TIMELINE CARDS */}
        <div className="max-w-3xl mx-auto space-y-0">
          {PIPELINE_STAGES.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.id] || FileText;
            const isLast = index === PIPELINE_STAGES.length - 1;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Clickable Card */}
                <div
                  onClick={() =>
                    router.push(`/recruiter/hiring-pipeline/timeline/${stage.id}`)
                  }
                  className={`group relative rounded-2xl border bg-surface transition-all duration-200 p-5 sm:p-6 cursor-pointer shadow-xs hover:shadow-lg ${stage.colorTheme.border} ${stage.colorTheme.lightBg}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Step Badge + Icon + Name + Description */}
                    <div className="flex items-start gap-4">
                      {/* Step Number & Icon Container */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${stage.colorTheme.iconBg}`}
                        >
                          <Icon className={`w-6 h-6 ${stage.colorTheme.iconColor}`} />
                        </div>
                        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-ink text-surface text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                          {stage.stepNumber}
                        </span>
                      </div>

                      {/* Stage Text Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-primary transition-colors">
                            {stage.name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.colorTheme.badge}`}
                          >
                            {stage.status}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Candidate Count & Navigation Callout */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-extrabold text-ink group-hover:text-primary transition-colors">
                          {stage.count}
                        </div>
                        <span className="text-[11px] font-semibold text-ink-soft">
                          Candidates
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform mt-2">
                        <span>Inspect Stage</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Progress / Status Bar inside card */}
                  <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-ink-soft">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Avg. Stage Velocity:</span>
                      <span className="font-mono font-bold text-ink">{stage.avgDays}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-surface-alt rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stage.colorTheme.progressBar}`}
                          style={{ width: `${stage.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10.5px] font-semibold">
                        {stage.conversionRate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Connector & Conversion Node (between cards) */}
                {!isLast && (
                  <div className="flex flex-col items-center justify-center my-1.5 py-1">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-border via-primary/30 to-border" />
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border shadow-xs text-[10px] font-bold text-ink-soft my-0.5">
                      <ArrowDown className="w-3 h-3 text-primary" />
                      <span>Proceeds to Next Stage</span>
                    </div>
                    <div className="w-0.5 h-6 bg-gradient-to-b from-border via-primary/30 to-border" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Quick Stage Directory Table */}
      <div className="rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink">
              Stage Velocity & Transition Summary
            </h3>
            <p className="text-xs text-ink-soft">
              Direct stage drill-down with candidate counts and progression metrics.
            </p>
          </div>
          <Link
            href="/recruiter/hiring-pipeline/candidates"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-surface-alt/60 text-ink-soft font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Candidates</th>
                <th className="py-3 px-4">Avg. Time</th>
                <th className="py-3 px-4">Conversion Rate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PIPELINE_STAGES.map((s) => (
                <tr key={s.id} className="hover:bg-surface-alt/40 transition">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center font-bold">
                      {s.stepNumber}
                    </span>
                    <span className="text-ink">{s.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.colorTheme.badge}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono">
                    {s.count}
                  </td>
                  <td className="py-3.5 px-4 text-ink-soft">{s.avgDays}</td>
                  <td className="py-3.5 px-4 text-ink-soft font-mono">
                    {s.conversionRate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/recruiter/hiring-pipeline/timeline/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-xs font-semibold text-primary transition"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
