"use client";

import React, { useState } from "react";
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
  X,
} from "lucide-react";

interface ShortlistedStudent {
  id: string;
  rank: number;
  name: string;
  applicationId: string;
  program: string;
  twelfthScore: string;
  entranceScore: string;
  meritIndex: number;
  quota: string;
  status: "Shortlisted" | "Call Letter Sent" | "Scholarship Offered";
}

export default function InstitutionStudentShortlistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotaFilter, setQuotaFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [students, setStudents] = useState<ShortlistedStudent[]>([
    {
      id: "st-1",
      rank: 1,
      name: "Divya Nair",
      applicationId: "LGI-ADM-2027-0101",
      program: "B.Tech CSE (AI & ML)",
      twelfthScore: "97.6% (CBSE)",
      entranceScore: "JEE Main 99.1%ile (Rank 840)",
      meritIndex: 98.4,
      quota: "100% Tuition Merit Scholar",
      status: "Scholarship Offered",
    },
    {
      id: "st-2",
      rank: 2,
      name: "Rohan Verma",
      applicationId: "LGI-ADM-2027-0142",
      program: "B.Tech CSE (AI & ML)",
      twelfthScore: "94.2% (ISC)",
      entranceScore: "JEE Main 98.4%ile (Rank 1,480)",
      meritIndex: 96.3,
      quota: "General Merit",
      status: "Call Letter Sent",
    },
    {
      id: "st-3",
      rank: 3,
      name: "Vikram Malhotra",
      applicationId: "LGI-ADM-2027-0205",
      program: "B.Tech Robotics & IoT",
      twelfthScore: "93.8% (State Board)",
      entranceScore: "JEE Main 97.2%ile (Rank 2,650)",
      meritIndex: 95.5,
      quota: "State Domicile",
      status: "Shortlisted",
    },
    {
      id: "st-4",
      rank: 4,
      name: "Ananya Iyer",
      applicationId: "LGI-ADM-2027-0288",
      program: "B.Tech CSE (AI & ML)",
      twelfthScore: "96.0% (IB Diploma)",
      entranceScore: "SAT 1480 / 1600",
      meritIndex: 94.8,
      quota: "International / NRI",
      status: "Call Letter Sent",
    },
    {
      id: "st-5",
      rank: 5,
      name: "Pooja Hegde",
      applicationId: "LGI-ADM-2027-0310",
      program: "MBA (FinTech & Analytics)",
      twelfthScore: "90.4% (B.Com Honors)",
      entranceScore: "CAT 94.8%ile",
      meritIndex: 93.6,
      quota: "Corporate Sponsored",
      status: "Shortlisted",
    },
    {
      id: "st-6",
      rank: 6,
      name: "Sneha Mukherjee",
      applicationId: "LGI-ADM-2027-0345",
      program: "B.Tech Electronics & VLSI",
      twelfthScore: "91.8% (WB Board)",
      entranceScore: "State CET Rank 1,420",
      meritIndex: 92.1,
      quota: "General Merit",
      status: "Shortlisted",
    },
  ]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkCallLetters = () => {
    setStudents((prev) =>
      prev.map((st) =>
        selectedIds.includes(st.id) ? { ...st, status: "Call Letter Sent" } : st
      )
    );
    setActionSuccess(`Counseling Call Letters issued to ${selectedIds.length} candidate(s).`);
    setSelectedIds([]);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuota = quotaFilter === "All" || s.quota.includes(quotaFilter);
    return matchesSearch && matchesQuota;
  });

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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border text-ink text-xs font-bold hover:bg-surface-alt transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Merit List</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Shortlisted Students</span>
          <p className="text-2xl font-black text-ink mt-1">380 Students</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Top 22.7% percentile</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Cutoff Index (Round 1)</span>
          <p className="text-2xl font-black text-primary-glow mt-1">92.0 Score</p>
          <span className="text-[11px] text-ink-soft">Min JEE 95.0%ile</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Call Letters Dispatched</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">215 Sent</p>
          <span className="text-[11px] text-ink-soft">Counseling slot booking active</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Merit Scholarships Allocated</span>
          <p className="text-2xl font-black text-ink mt-1">45 Seats</p>
          <span className="text-[11px] text-emerald-500 font-semibold">₹38L total value</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search student, app ID, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["All", "General Merit", "Scholar", "Domicile", "Corporate"].map((q) => (
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
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-primary-glow">
            {selectedIds.length} student(s) selected for bulk dispatch
          </span>
          <button
            type="button"
            onClick={handleBulkCallLetters}
            className="px-3 py-1 rounded-lg bg-gradient-brand text-primary-foreground font-bold hover:opacity-95 transition cursor-pointer shadow-xs"
          >
            Issue Counseling Letters
          </button>
        </div>
      )}

      {/* Shortlist Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-alt/60 border-b border-border text-ink-soft text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Student & App ID</th>
                <th className="p-3.5">Target Program</th>
                <th className="p-3.5">Scores & Percentile</th>
                <th className="p-3.5">Merit Index</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-surface-alt/30 transition">
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(st.id)}
                      onChange={() => toggleSelectOne(st.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-3.5 font-black text-ink text-sm">#{st.rank}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-ink">{st.name}</div>
                    <span className="text-[10px] text-ink-soft">{st.applicationId}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-primary-glow font-semibold">{st.program}</span>
                    <span className="text-[10px] text-ink-soft block">{st.quota}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-ink font-semibold">{st.entranceScore}</div>
                    <span className="text-[10px] text-ink-soft">{st.twelfthScore}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-black text-emerald-500 text-sm">{st.meritIndex}</span>
                    <span className="text-[10px] text-ink-soft block">/ 100</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        st.status === "Scholarship Offered"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : st.status === "Call Letter Sent"
                          ? "text-primary-glow bg-primary/10 border-primary/20"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {st.status}
                    </span>
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
