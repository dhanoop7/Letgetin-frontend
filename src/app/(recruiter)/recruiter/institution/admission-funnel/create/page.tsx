"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Plus,
  Search,
  Calendar,
  Layers,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
  Clock,
  X,
} from "lucide-react";

interface AdmissionIntake {
  id: string;
  program: string;
  school: string;
  seats: number;
  appliedCount: number;
  startDate: string;
  deadline: string;
  eligibility: string;
  applicationFee: string;
  status: "Open" | "Upcoming" | "Closed";
}

export default function InstitutionCreateAdmissionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [intakes, setIntakes] = useState<AdmissionIntake[]>([
    {
      id: "intake-1",
      program: "B.Tech Computer Science & AI (2027 Batch)",
      school: "School of Computing & Data Sciences",
      seats: 240,
      appliedCount: 840,
      startDate: "Oct 01, 2026",
      deadline: "Dec 15, 2026",
      eligibility: "Min 75% in 10+2 (PCM) or Top 50k JEE Main Rank",
      applicationFee: "₹1,200",
      status: "Open",
    },
    {
      id: "intake-2",
      program: "B.Tech Electronics & VLSI Systems",
      school: "Department of Electrical Engineering",
      seats: 120,
      appliedCount: 310,
      startDate: "Oct 15, 2026",
      deadline: "Dec 30, 2026",
      eligibility: "Min 70% in 10+2 (PCM) with Math mandatory",
      applicationFee: "₹1,000",
      status: "Open",
    },
    {
      id: "intake-3",
      program: "MBA & Executive Tech Management",
      school: "School of Business & Analytics",
      seats: 180,
      appliedCount: 520,
      startDate: "Nov 01, 2026",
      deadline: "Jan 15, 2027",
      eligibility: "Graduation (Min 60%) + CAT/GMAT/MAT Score",
      applicationFee: "₹1,500",
      status: "Upcoming",
    },
  ]);

  // Form State
  const [programName, setProgramName] = useState("");
  const [schoolName, setSchoolName] = useState("School of Computing & Data Sciences");
  const [totalSeats, setTotalSeats] = useState("120");
  const [deadlineDate, setDeadlineDate] = useState("2026-12-31");
  const [eligibilityText, setEligibilityText] = useState("");
  const [feeAmount, setFeeAmount] = useState("1200");

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim()) return;

    const newIntake: AdmissionIntake = {
      id: `intake-${Date.now()}`,
      program: programName,
      school: schoolName,
      seats: Number(totalSeats) || 60,
      appliedCount: 0,
      startDate: "Oct 2026",
      deadline: deadlineDate,
      eligibility: eligibilityText || "10+2 or Equivalent with relevant domain subjects",
      applicationFee: `₹${Number(feeAmount).toLocaleString("en-IN")}`,
      status: "Open",
    };

    setIntakes([newIntake, ...intakes]);
    setProgramName("");
    setEligibilityText("");
    setIsModalOpen(false);
  };

  const filteredIntakes = intakes.filter(
    (i) =>
      i.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Create Admission</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Configure new admission intakes, seat quotas, eligibility criteria, and application intake timelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission Track</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Active Admission Tracks</span>
          <p className="text-2xl font-black text-ink mt-1">6 Programs</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Intake 2026-27</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Approved Seats</span>
          <p className="text-2xl font-black text-primary-glow mt-1">540 Seats</p>
          <span className="text-[11px] text-ink-soft">Across 3 academic schools</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Applications Received</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">1,670</p>
          <span className="text-[11px] text-emerald-500 font-semibold">3.1x seat demand</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Application Fee Collected</span>
          <p className="text-2xl font-black text-ink mt-1">₹20.04L</p>
          <span className="text-[11px] text-ink-soft">Direct portal payments</span>
        </div>
      </div>

      {/* Quick Launch Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink">B.Tech Engineering Intake</h3>
          <p className="text-[11px] text-ink-soft">Standard 4-year engineering curriculum with AI, CSE & Robotics quotas.</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink">Postgraduate & MBA Special</h3>
          <p className="text-[11px] text-ink-soft">2-year management track with corporate sponsorship & GD/PI scheduling.</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink">International Dual Degree</h3>
          <p className="text-[11px] text-ink-soft">2+2 and 3+1 articulation pathways with foreign partner universities.</p>
        </div>
      </div>

      {/* Existing Intake Tracks Table */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-ink">Active Program Admission Tracks</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredIntakes.map((intake) => (
            <div
              key={intake.id}
              className="p-4 rounded-xl bg-surface-alt/40 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-ink">{intake.program}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      intake.status === "Open"
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {intake.status}
                  </span>
                  <span className="text-[10px] text-ink-soft">{intake.school}</span>
                </div>
                <p className="text-xs text-primary-glow font-medium">Eligibility: {intake.eligibility}</p>
                <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                  <span>Deadline: <strong className="text-ink">{intake.deadline}</strong></span>
                  <span>•</span>
                  <span>App Fee: <strong className="text-ink">{intake.applicationFee}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-xs shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                <div>
                  <span className="text-ink-soft block text-[10px]">Seats</span>
                  <span className="font-bold text-ink text-sm">{intake.seats}</span>
                </div>
                <div>
                  <span className="text-ink-soft block text-[10px]">Applied</span>
                  <span className="font-bold text-emerald-500 text-sm">{intake.appliedCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href="/recruiter/institution/admission-funnel/timeline"
                  className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                >
                  View Pipeline
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Creating Admission Track */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Create Admission Track</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateIntake} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Program / Degree Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Artificial Intelligence & Data Science"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Academic Department</label>
                  <select
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="School of Computing & Data Sciences">School of Computing</option>
                    <option value="Department of Electrical Engineering">Electrical & Electronics</option>
                    <option value="School of Business & Analytics">Business & Management</option>
                    <option value="School of Design & Media">Design & Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Approved Seat Capacity</label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Application Fee (₹)</label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Minimum Eligibility & Cutoff Criteria</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Min 70% in 10+2 with Physics, Chemistry & Math + Valid State/National Entrance Score"
                  value={eligibilityText}
                  onChange={(e) => setEligibilityText(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-semibold hover:bg-surface-alt/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                >
                  Launch Admission Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
