"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Sparkles,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Award,
  GraduationCap,
  Download,
  FileCheck,
  CreditCard,
  Building,
  ArrowUpRight,
} from "lucide-react";

interface AdmittedStudent {
  id: string;
  enrollmentNo: string;
  name: string;
  program: string;
  section: string;
  allotmentDate: string;
  feeStatus: "Full Fee Paid" | "Token Paid (₹50k)" | "Scholarship 100%";
  scholarshipTier: string;
  hostelOpted: boolean;
}

export default function InstitutionAdmissionFinalistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("All");

  const [finalists, setFinalists] = useState<AdmittedStudent[]>([
    {
      id: "fin-1",
      enrollmentNo: "LGI-2027-CS-001",
      name: "Divya Nair",
      program: "B.Tech CSE (AI & ML)",
      section: "Section A (Honors)",
      allotmentDate: "Oct 02, 2026",
      feeStatus: "Scholarship 100%",
      scholarshipTier: "Chancellor Gold Scholar",
      hostelOpted: true,
    },
    {
      id: "fin-2",
      enrollmentNo: "LGI-2027-CS-002",
      name: "Rohan Verma",
      program: "B.Tech CSE (AI & ML)",
      section: "Section A",
      allotmentDate: "Oct 04, 2026",
      feeStatus: "Full Fee Paid",
      scholarshipTier: "Merit Tier-1 (25% Waiver)",
      hostelOpted: true,
    },
    {
      id: "fin-3",
      enrollmentNo: "LGI-2027-VL-001",
      name: "Sneha Mukherjee",
      program: "B.Tech Electronics & VLSI",
      section: "Section A",
      allotmentDate: "Oct 05, 2026",
      feeStatus: "Full Fee Paid",
      scholarshipTier: "General Admission",
      hostelOpted: false,
    },
    {
      id: "fin-4",
      enrollmentNo: "LGI-2027-MB-001",
      name: "Pooja Hegde",
      program: "MBA (FinTech & Analytics)",
      section: "Batch Alpha",
      allotmentDate: "Oct 06, 2026",
      feeStatus: "Token Paid (₹50k)",
      scholarshipTier: "Corporate Nominee",
      hostelOpted: false,
    },
    {
      id: "fin-5",
      enrollmentNo: "LGI-2027-RO-001",
      name: "Vikram Malhotra",
      program: "B.Tech Robotics & IoT",
      section: "Section A",
      allotmentDate: "Oct 07, 2026",
      feeStatus: "Full Fee Paid",
      scholarshipTier: "State Domicile Waiver",
      hostelOpted: true,
    },
  ]);

  const filteredFinalists = finalists.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === "All" || f.program.includes(programFilter);
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Admission Finalists</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Confirmed student enrollment list with locked seat allocations, fee verification, and provisional allotment IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/institution/admission-funnel/student-onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Onboarding</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Confirmed Seat Allotments</span>
          <p className="text-2xl font-black text-ink mt-1">218 Seats</p>
          <span className="text-[11px] text-emerald-500 font-semibold">40.3% batch filled</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Tuition Revenue Secured</span>
          <p className="text-2xl font-black text-primary-glow mt-1">₹1.84 Cr</p>
          <span className="text-[11px] text-ink-soft">Verified fee receipts</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Hostel Accommodations</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">142 Rooms</p>
          <span className="text-[11px] text-ink-soft">65% hostel uptake</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Orientation Start Date</span>
          <p className="text-2xl font-black text-ink mt-1">Jan 18</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Batch 2027 kick-off</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search finalist by name or enrollment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["All", "CSE", "VLSI", "Robotics", "MBA"].map((pr) => (
            <button
              key={pr}
              type="button"
              onClick={() => setProgramFilter(pr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                programFilter === pr
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Finalists Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-alt/60 border-b border-border text-ink-soft text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Enrollment ID</th>
                <th className="p-3.5">Admitted Student</th>
                <th className="p-3.5">Program & Cohort</th>
                <th className="p-3.5">Fee & Payment Status</th>
                <th className="p-3.5">Scholarship Tier</th>
                <th className="p-3.5">Hostel</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFinalists.map((f) => (
                <tr key={f.id} className="hover:bg-surface-alt/30 transition">
                  <td className="p-3.5 font-bold text-ink">{f.enrollmentNo}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-ink">{f.name}</div>
                    <span className="text-[10px] text-ink-soft">Allotted: {f.allotmentDate}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-primary-glow font-semibold">{f.program}</div>
                    <span className="text-[10px] text-ink-soft">{f.section}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        f.feeStatus === "Full Fee Paid" || f.feeStatus === "Scholarship 100%"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {f.feeStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-ink-soft font-medium">{f.scholarshipTier}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold ${
                        f.hostelOpted ? "text-emerald-500" : "text-ink-soft"
                      }`}
                    >
                      {f.hostelOpted ? "Opted In" : "Day Scholar"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink text-[11px] font-semibold transition"
                    >
                      Allotment Letter
                    </button>
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
