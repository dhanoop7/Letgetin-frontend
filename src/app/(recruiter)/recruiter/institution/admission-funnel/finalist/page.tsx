"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  FileText,
  DollarSign,
  X,
} from "lucide-react";
import { admissionService } from "@/features/institution/services/admissionService";
import { AdmissionApplication } from "@/features/institution/types/admission.types";
import { AdmissionApplicantModal } from "@/features/institution/components/AdmissionApplicantModal";

export default function InstitutionAdmissionFinalistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("All");
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<AdmissionApplication | null>(null);
  const [previewAllotmentApp, setPreviewAllotmentApp] = useState<AdmissionApplication | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await admissionService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load finalists data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Finalists are enrolled or admitted candidates
  const finalists = applications.filter((a) => a.stage === "enrolled");

  const filteredFinalists = finalists.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.enrollmentNo && f.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.applicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram =
      programFilter === "All" || f.program.toLowerCase().includes(programFilter.toLowerCase());
    return matchesSearch && matchesProgram;
  });

  const handleUpdateFeeStatus = async (
    id: string,
    newStatus: "Full Fee Paid" | "Token Paid (₹50k)" | "Scholarship 100%"
  ) => {
    try {
      await admissionService.updateApplication(id, { feeStatus: newStatus });
      setActionSuccess("Fee payment status updated successfully!");
      await loadData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to update fee status");
    }
  };

  const programsInFinalists = Array.from(new Set(finalists.map((f) => f.program)));
  const hostelCount = finalists.filter((f) => f.hostelOpted).length;
  const fullFeeCount = finalists.filter(
    (f) => f.feeStatus === "Full Fee Paid" || f.feeStatus === "Scholarship 100%"
  ).length;

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

        <div className="flex items-center gap-2.5">
          <Link
            href="/recruiter/institution/admission-funnel/student-onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Onboarding</span>
          </Link>
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
          <span className="text-xs text-ink-soft">Confirmed Seat Allotments</span>
          <p className="text-2xl font-black text-ink mt-1">{finalists.length} Seats</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Persisted in MongoDB</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Tuition Secured / Verified</span>
          <p className="text-2xl font-black text-primary-glow mt-1">{fullFeeCount} Verified</p>
          <span className="text-[11px] text-ink-soft">Token or full fee cleared</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Hostel Accommodations</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{hostelCount} Rooms</p>
          <span className="text-[11px] text-ink-soft">Hostel opted in cohort</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Orientation Start Date</span>
          <p className="text-2xl font-black text-ink mt-1">Jan 18, 2027</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Batch 2027 kick-off</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
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
          {["All", "CS", "VLSI", "Robotics", "MBA"].map((pr) => (
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
        {isLoading ? (
          <div className="text-center py-16 text-ink-soft text-xs">Loading finalist roster...</div>
        ) : filteredFinalists.length === 0 ? (
          <div className="text-center py-16 text-ink-soft text-xs">
            No confirmed finalists yet. Move applicants to &quot;Seat Confirmed&quot; in the Kanban board.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-alt/60 border-b border-border text-ink-soft text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Enrollment ID</th>
                  <th className="p-3.5">Admitted Student</th>
                  <th className="p-3.5">Program & Cohort</th>
                  <th className="p-3.5">Fee & Payment Status</th>
                  <th className="p-3.5">Scholarship Tier</th>
                  <th className="p-3.5">Campus Hostel</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFinalists.map((f) => (
                  <tr key={f._id} className="hover:bg-surface-alt/30 transition">
                    <td className="p-3.5 font-bold text-ink">
                      {f.enrollmentNo || `LGI-2027-${f.applicantId.split("-")[2]}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-ink">{f.name}</div>
                      <span className="text-[10px] text-ink-soft">Applied: {f.appliedDate}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-primary-glow font-semibold">{f.program}</div>
                      <span className="text-[10px] text-ink-soft">{f.category}</span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={f.feeStatus}
                        onChange={(e) =>
                          handleUpdateFeeStatus(
                            f._id,
                            e.target.value as "Full Fee Paid" | "Token Paid (₹50k)" | "Scholarship 100%"
                          )
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-surface cursor-pointer ${
                          f.feeStatus === "Full Fee Paid" || f.feeStatus === "Scholarship 100%"
                            ? "text-emerald-500 border-emerald-500/20"
                            : "text-amber-500 border-amber-500/20"
                        }`}
                      >
                        <option value="Token Paid (₹50k)">Token Paid (₹50k)</option>
                        <option value="Full Fee Paid">Full Fee Paid</option>
                        <option value="Scholarship 100%">Scholarship 100%</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-ink-soft font-medium">
                      {f.scholarshipTier && f.scholarshipTier !== "None"
                        ? f.scholarshipTier
                        : "General Admission"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold ${
                          f.hostelOpted ? "text-emerald-500" : "text-ink-soft"
                        }`}
                      >
                        {f.hostelOpted ? "Opted In" : "Day Scholar"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewAllotmentApp(f)}
                        className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink text-[11px] font-semibold transition cursor-pointer"
                      >
                        Allotment Letter
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedApplicant(f)}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-glow text-[11px] font-semibold transition cursor-pointer"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provisional Allotment Letter Modal (AdmitFlow Feature) */}
      {previewAllotmentApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-glow" />
                <h3 className="text-base font-extrabold text-ink">Provisional Allotment Letter</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAllotmentApp(null)}
                className="p-1 text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-surface-alt/40 border border-border rounded-xl space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-soft font-medium">Allotment ID:</span>
                <strong className="text-ink">
                  {previewAllotmentApp.enrollmentNo || previewAllotmentApp.applicantId}
                </strong>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-soft font-medium">Student Name:</span>
                <strong className="text-ink">{previewAllotmentApp.name}</strong>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-soft font-medium">Allocated Program:</span>
                <strong className="text-primary-glow">{previewAllotmentApp.program}</strong>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-soft font-medium">Fee Clearance Status:</span>
                <strong className="text-emerald-500">{previewAllotmentApp.feeStatus}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft font-medium">Hostel Accommodation:</span>
                <strong className="text-ink">
                  {previewAllotmentApp.hostelOpted ? "Reserved (Block A)" : "Day Scholar"}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-ink-soft">
              This letter serves as official confirmation of provisional admission into the Fall 2026/27 academic cohort.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPreviewAllotmentApp(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink font-semibold text-xs hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading PDF allotment certificate for ${previewAllotmentApp.name}`);
                  setPreviewAllotmentApp(null);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-glow hover:opacity-95 transition cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Dossier Modal */}
      {selectedApplicant && (
        <AdmissionApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStage={async (st, note) => {
            await admissionService.updateStage(selectedApplicant._id, st, note);
            await loadData();
            setSelectedApplicant(null);
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
