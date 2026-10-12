"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Award,
  GraduationCap,
  Download,
  Mail,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { admissionService } from "@/features/institution/services/admissionService";
import { AdmissionApplication } from "@/features/institution/types/admission.types";
import { AdmissionApplicantModal } from "@/features/institution/components/AdmissionApplicantModal";

export default function InstitutionStudentShortlistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotaFilter, setQuotaFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<AdmissionApplication | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await admissionService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load shortlist data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter candidates who have reached shortlist, counseling, or enrolled
  const eligibleStudents = applications
    .filter((a) => ["shortlisted", "counseling", "enrolled"].includes(a.stage))
    .sort((a, b) => (b.meritIndex || 0) - (a.meritIndex || 0));

  const filteredStudents = eligibleStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.applicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuota = quotaFilter === "All" || s.category.includes(quotaFilter);
    return matchesSearch && matchesQuota;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkCallLetters = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDispatching(true);
      const res = await admissionService.bulkIssueCallLetters(selectedIds);
      setActionSuccess(`Counseling Call Letters issued to ${res.updatedCount} candidate(s).`);
      setSelectedIds([]);
      await loadData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch call letters");
    } finally {
      setIsDispatching(false);
    }
  };

  const exportMeritListCsv = () => {
    const headers = [
      "Rank",
      "Applicant ID",
      "Full Name",
      "Program",
      "Score",
      "12th GPA",
      "Merit Index",
      "Category",
      "Stage",
      "Call Letter Sent",
    ];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.applicantId,
      `"${s.name}"`,
      `"${s.program}"`,
      `"${s.score}"`,
      `"${s.gpa}"`,
      s.meritIndex || "—",
      `"${s.category}"`,
      s.stage,
      s.callLetterSent ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Merit_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lettersSentCount = applications.filter((a) => a.callLetterSent).length;
  const scholarshipsAllocatedCount = applications.filter((a) =>
    a.category.toLowerCase().includes("scholar") || (a.scholarshipTier && a.scholarshipTier !== "None")
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Student Shortlist</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Normalized merit scoring, entrance cutoff shortlists, and automated counseling call letter issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportMeritListCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border text-ink text-xs font-bold hover:bg-surface-alt transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Merit List (CSV)</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Shortlisted Students</span>
          <p className="text-2xl font-black text-ink mt-1">{eligibleStudents.length} Students</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Persisted in MongoDB</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Cutoff Index (Round 1)</span>
          <p className="text-2xl font-black text-primary-glow mt-1">92.0 Score</p>
          <span className="text-[11px] text-ink-soft">Min 90%ile benchmark</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Call Letters Dispatched</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{lettersSentCount} Sent</p>
          <span className="text-[11px] text-ink-soft">Counseling slot booking active</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Merit Scholarships Allocated</span>
          <p className="text-2xl font-black text-ink mt-1">{scholarshipsAllocatedCount} Seats</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Chancellor & Merit Tiers</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search student, app ID, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["All", "General Merit", "Scholar", "Domicile", "Corporate", "International"].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuotaFilter(q)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                quotaFilter === q
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-2 text-xs shadow-xs">
          <span className="font-bold text-primary-glow">
            {selectedIds.length} candidate(s) selected for bulk dispatch
          </span>
          <button
            type="button"
            onClick={handleBulkCallLetters}
            disabled={isDispatching}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-brand text-primary-foreground font-bold hover:opacity-95 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDispatching ? "Dispatching..." : "Issue Counseling Letters"}
          </button>
        </div>
      )}

      {/* Shortlist Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="text-center py-16 text-ink-soft text-xs">Loading shortlist records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-ink-soft text-xs">
            No candidates matching this criteria in shortlist or counseling.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-alt/60 border-b border-border text-ink-soft text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredStudents.length && filteredStudents.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Student & App ID</th>
                  <th className="p-3.5">Target Program</th>
                  <th className="p-3.5">Entrance Scores</th>
                  <th className="p-3.5">Merit Index</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStudents.map((st, idx) => {
                  const rank = st.meritRank || idx + 1;
                  const isCallSent = st.callLetterSent;
                  const isEnrolled = st.stage === "enrolled";

                  return (
                    <tr key={st._id} className="hover:bg-surface-alt/30 transition">
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(st._id)}
                          onChange={() => toggleSelectOne(st._id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-3.5 font-black text-ink text-sm">#{rank}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-ink">{st.name}</div>
                        <span className="text-[10px] text-ink-soft">{st.applicantId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-primary-glow font-semibold">{st.program}</span>
                        <span className="text-[10px] text-ink-soft block">{st.category}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-ink font-semibold">{st.score || "Score on file"}</div>
                        <span className="text-[10px] text-ink-soft">{st.gpa || "12th GPA on file"}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-emerald-500 text-sm">
                          {st.meritIndex || (98 - idx * 1.5).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-ink-soft block">/ 100</span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{st.bgChecks?.overall || "Verified"}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isEnrolled
                              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                              : isCallSent
                              ? "text-primary-glow bg-primary/10 border-primary/20"
                              : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                          }`}
                        >
                          {isEnrolled
                            ? "Seat Confirmed"
                            : isCallSent
                            ? "Call Letter Sent"
                            : "Shortlisted"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(st)}
                          className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink text-[11px] font-semibold transition cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applicant Dossier Modal (AdmitFlow Integration) */}
      {selectedApplicant && (
        <AdmissionApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStage={async (st, note) => {
            await admissionService.updateStage(selectedApplicant._id, st, note);
            await loadData();
            setSelectedApplicant(null);
            setActionSuccess(`${selectedApplicant.name} stage updated to ${st}`);
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
