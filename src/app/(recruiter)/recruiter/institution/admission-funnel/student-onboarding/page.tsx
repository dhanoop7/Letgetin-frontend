"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileCheck,
  ShieldCheck,
  IdCard,
  Building,
  Upload,
  ChevronRight,
  X,
} from "lucide-react";

interface OnboardingStudent {
  id: string;
  name: string;
  enrollmentNo: string;
  program: string;
  progressPercent: number;
  documents: {
    marksCard: boolean;
    transferCert: boolean;
    antiRagging: boolean;
    medicalFitness: boolean;
    feeReceipt: boolean;
  };
  idCardIssued: boolean;
  hostelRoom: string;
  status: "Completed" | "Documents Pending" | "Verification Underway";
}

export default function InstitutionStudentOnboardingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedStudent, setSelectedStudent] = useState<OnboardingStudent | null>(null);

  const [students, setStudents] = useState<OnboardingStudent[]>([
    {
      id: "onb-1",
      name: "Divya Nair",
      enrollmentNo: "LGI-2027-CS-001",
      program: "B.Tech CSE (AI & ML)",
      progressPercent: 100,
      documents: {
        marksCard: true,
        transferCert: true,
        antiRagging: true,
        medicalFitness: true,
        feeReceipt: true,
      },
      idCardIssued: true,
      hostelRoom: "Block B · Room 304",
      status: "Completed",
    },
    {
      id: "onb-2",
      name: "Rohan Verma",
      enrollmentNo: "LGI-2027-CS-002",
      program: "B.Tech CSE (AI & ML)",
      progressPercent: 80,
      documents: {
        marksCard: true,
        transferCert: true,
        antiRagging: true,
        medicalFitness: false,
        feeReceipt: true,
      },
      idCardIssued: false,
      hostelRoom: "Block A · Room 112",
      status: "Verification Underway",
    },
    {
      id: "onb-3",
      name: "Sneha Mukherjee",
      enrollmentNo: "LGI-2027-VL-001",
      program: "B.Tech Electronics & VLSI",
      progressPercent: 60,
      documents: {
        marksCard: true,
        transferCert: false,
        antiRagging: true,
        medicalFitness: false,
        feeReceipt: true,
      },
      idCardIssued: false,
      hostelRoom: "Day Scholar (No Room)",
      status: "Documents Pending",
    },
    {
      id: "onb-4",
      name: "Vikram Malhotra",
      enrollmentNo: "LGI-2027-RO-001",
      program: "B.Tech Robotics & IoT",
      progressPercent: 100,
      documents: {
        marksCard: true,
        transferCert: true,
        antiRagging: true,
        medicalFitness: true,
        feeReceipt: true,
      },
      idCardIssued: true,
      hostelRoom: "Block C · Room 202",
      status: "Completed",
    },
    {
      id: "onb-5",
      name: "Pooja Hegde",
      enrollmentNo: "LGI-2027-MB-001",
      program: "MBA (FinTech & Analytics)",
      progressPercent: 80,
      documents: {
        marksCard: true,
        transferCert: true,
        antiRagging: true,
        medicalFitness: false,
        feeReceipt: true,
      },
      idCardIssued: false,
      hostelRoom: "Executive Hostel · Suite 12",
      status: "Verification Underway",
    },
  ]);

  const toggleDocument = (studentId: string, docKey: keyof OnboardingStudent["documents"]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const updatedDocs = { ...s.documents, [docKey]: !s.documents[docKey] };
        const total = Object.values(updatedDocs).filter(Boolean).length;
        const newPercent = Math.round((total / 5) * 100);
        const newStatus =
          newPercent === 100
            ? "Completed"
            : newPercent >= 60
            ? "Verification Underway"
            : "Documents Pending";

        return {
          ...s,
          documents: updatedDocs,
          progressPercent: newPercent,
          status: newStatus,
        };
      })
    );
  };

  const handleIssueID = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, idCardIssued: true } : s))
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Student Onboarding</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Student induction and document verification workflows, anti-ragging compliance, hostel room allotment, and ID card issuance.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Onboarding Queue</span>
          <p className="text-2xl font-black text-ink mt-1">218 Students</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Incoming Batch 2027</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Fully Verified</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">162 Students</p>
          <span className="text-[11px] text-ink-soft">74.3% onboarding complete</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Student IDs Issued</span>
          <p className="text-2xl font-black text-primary-glow mt-1">140 Badges</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Ready for campus access</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Pending Verification</span>
          <p className="text-2xl font-black text-amber-500 mt-1">56 Forms</p>
          <span className="text-[11px] text-ink-soft">Action required</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search by student name, enrollment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["All", "Completed", "Verification Underway", "Documents Pending"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Student Onboarding Cards List */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Student Verification & Induction Roster</h2>
          <span className="text-xs text-ink-soft">{filteredStudents.length} students</span>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-xl bg-surface-alt/40 border border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-primary/40 transition"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-ink">{student.name}</h3>
                  <span className="text-xs font-mono text-ink-soft">{student.enrollmentNo}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      student.status === "Completed"
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : student.status === "Verification Underway"
                        ? "text-primary-glow bg-primary/10 border-primary/20"
                        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-primary-glow font-medium">{student.program}</p>
                <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                  <span>Hostel: <strong className="text-ink">{student.hostelRoom}</strong></span>
                  <span>•</span>
                  <span>
                    ID Card:{" "}
                    <strong className={student.idCardIssued ? "text-emerald-500" : "text-amber-500"}>
                      {student.idCardIssued ? "Issued" : "Pending"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Document Checklist Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: "marksCard", label: "Marksheet" },
                  { key: "transferCert", label: "Transfer Cert" },
                  { key: "antiRagging", label: "Anti-Ragging" },
                  { key: "medicalFitness", label: "Medical" },
                  { key: "feeReceipt", label: "Fee Receipt" },
                ].map((doc) => {
                  const isChecked = student.documents[doc.key as keyof OnboardingStudent["documents"]];
                  return (
                    <button
                      key={doc.key}
                      type="button"
                      onClick={() =>
                        toggleDocument(student.id, doc.key as keyof OnboardingStudent["documents"])
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-surface-alt border-border text-ink-soft hover:text-ink"
                      }`}
                      title="Click to toggle verification status"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-3 self-end lg:self-center shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
                <div className="text-right">
                  <span className="text-[10px] text-ink-soft block">Progress</span>
                  <span className="text-xs font-black text-ink">{student.progressPercent}%</span>
                </div>
                {!student.idCardIssued ? (
                  <button
                    type="button"
                    onClick={() => handleIssueID(student.id)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                  >
                    Issue Student ID
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                    <IdCard className="w-3.5 h-3.5" /> ID Issued
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
