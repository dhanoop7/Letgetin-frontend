"use client";

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Award,
  Layers,
  ArrowRight,
  Send,
  Plus,
  BookOpen,
} from "lucide-react";
import {
  AdmissionApplication,
  AdmissionStage,
} from "../types/admission.types";

interface AdmissionApplicantModalProps {
  applicant: AdmissionApplication;
  onClose: () => void;
  onUpdateStage?: (stage: AdmissionStage, note?: string) => Promise<void>;
  onAddNote?: (note: string) => Promise<void>;
}

export function AdmissionApplicantModal({
  applicant,
  onClose,
  onUpdateStage,
  onAddNote,
}: AdmissionApplicantModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "docs" | "checks" | "assess" | "timeline" | "notes"
  >("overview");

  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [targetStage, setTargetStage] = useState<AdmissionStage>("submitted");
  const [advanceReason, setAdvanceReason] = useState("");
  const [isAdvancing, setIsAdvancing] = useState(false);

  const stageLabels: Record<AdmissionStage, string> = {
    inquiry: "Inquiry / Lead",
    submitted: "Form Submitted",
    shortlisted: "Merit Shortlist",
    counseling: "Counseling Slot",
    enrolled: "Seat Confirmed",
    rejected: "Rejected",
  };

  const STAGE_ORDER: AdmissionStage[] = [
    "inquiry",
    "submitted",
    "shortlisted",
    "counseling",
    "enrolled",
  ];

  const currentIdx = STAGE_ORDER.indexOf(applicant.stage as AdmissionStage);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !onAddNote) return;
    try {
      setIsSubmittingNote(true);
      await onAddNote(noteText.trim());
      setNoteText("");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAdvance = async () => {
    if (!onUpdateStage) return;
    try {
      setIsAdvancing(true);
      await onUpdateStage(targetStage, advanceReason.trim());
      setShowAdvanceModal(false);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fade">
      <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-surface-alt/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-brand text-primary-foreground font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {applicant.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-ink truncate">{applicant.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary-glow">
                  {applicant.applicantId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    applicant.stage === "enrolled"
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : applicant.stage === "counseling"
                      ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                      : applicant.stage === "shortlisted"
                      ? "text-purple-500 bg-purple-500/10 border-purple-500/20"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  {stageLabels[applicant.stage]}
                </span>
              </div>
              <p className="text-xs text-ink-soft truncate mt-0.5 font-medium">
                {applicant.program} · Quota: {applicant.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onUpdateStage && applicant.stage !== "enrolled" && applicant.stage !== "rejected" && (
              <button
                type="button"
                onClick={() => {
                  const nextIdx = Math.min(currentIdx + 1, STAGE_ORDER.length - 1);
                  setTargetStage(STAGE_ORDER[nextIdx]);
                  setShowAdvanceModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Advance Stage</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-border bg-surface text-xs font-semibold overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "docs", label: `Documents (${applicant.documents?.length || 0})` },
            { id: "checks", label: "Verification" },
            { id: "assess", label: "Assessments" },
            { id: "timeline", label: `Timeline (${applicant.timeline?.length || 0})` },
            { id: "notes", label: `Notes (${applicant.notes?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary-glow font-bold"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Stepper */}
              <div className="p-4 rounded-xl bg-surface-alt/40 border border-border">
                <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block mb-3">
                  Admission Pipeline Progression
                </span>
                <div className="flex items-center justify-between gap-1 relative overflow-x-auto pb-1">
                  {STAGE_ORDER.map((st, idx) => {
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={st} className="flex-1 min-w-[90px] flex flex-col items-center text-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] mb-1.5 ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-surface-alt border border-border text-ink-soft"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10.5px] truncate max-w-[85px] ${
                            isCurrent
                              ? "font-extrabold text-primary-glow"
                              : isDone
                              ? "font-semibold text-ink"
                              : "text-ink-soft"
                          }`}
                        >
                          {stageLabels[st]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-alt/30 border border-border space-y-2">
                  <span className="text-[10.5px] font-bold text-ink-soft uppercase tracking-wider">
                    Contact & Demographics
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-ink">
                      <Mail className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                      <span className="font-semibold">{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink">
                      <Phone className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                      <span>{applicant.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink">
                      <MapPin className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                      <span>{applicant.city || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-ink-soft text-[11px]">
                      <span>Source: <strong className="text-ink">{applicant.source}</strong></span>
                      <span>Officer: <strong className="text-ink">{applicant.counselor}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-alt/30 border border-border space-y-2">
                  <span className="text-[10.5px] font-bold text-ink-soft uppercase tracking-wider">
                    Academic Scores & Quota
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-soft">Entrance Score:</span>
                      <strong className="text-primary-glow font-bold">{applicant.score || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-soft">Prior 12th GPA:</span>
                      <strong className="text-ink font-semibold">{applicant.gpa || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-soft">Merit Index:</span>
                      <strong className="text-emerald-500 font-bold">
                        {applicant.meritIndex ? `${applicant.meritIndex} / 100` : "Pending"}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border/60 text-[11px]">
                      <span className="text-ink-soft">Fee Status:</span>
                      <span className="font-bold text-ink">{applicant.feeStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === "docs" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-alt/60 text-ink-soft text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Document Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {applicant.documents?.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-surface-alt/30">
                        <td className="p-3 font-semibold text-ink flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="p-3 text-ink-soft">{doc.type}</td>
                        <td className="p-3 text-ink-soft">{doc.size}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              doc.status === "verified"
                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                : doc.status === "flagged"
                                ? "text-red-500 bg-red-500/10 border-red-500/20"
                                : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BACKGROUND CHECKS TAB */}
          {activeTab === "checks" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-alt/30 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-ink">Verification Integrity</h4>
                  <p className="text-[11px] text-ink-soft">
                    Government ID, academic credentials, and previous disciplinary clearance
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                  {applicant.bgChecks?.overall || "Verified"}
                </span>
              </div>

              <div className="space-y-2">
                {applicant.bgChecks?.checks?.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-ink text-xs">{chk.label}</h5>
                      <span className="text-[11px] text-ink-soft">
                        {chk.desc} · Vendor: {chk.vendor}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        chk.status === "verified"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSESSMENTS TAB */}
          {activeTab === "assess" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {applicant.assessments?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-alt/40 border border-border space-y-1">
                    <span className="text-[10px] text-ink-soft font-semibold block truncate">
                      {item.name}
                    </span>
                    <p className="text-base font-black text-ink">
                      {item.score !== null ? `${item.score} / ${item.max}` : "Pending"}
                    </p>
                    <span className="text-[10px] text-primary-glow font-bold">Weight: {item.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="space-y-3">
              <div className="space-y-3 pl-2 border-l-2 border-border ml-2">
                {applicant.timeline?.map((evt, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1" />
                    <h5 className="font-bold text-ink text-xs">{evt.title}</h5>
                    <p className="text-[11px] text-ink-soft">{evt.meta}</p>
                    <span className="text-[10px] text-ink-soft/70 block">
                      {new Date(evt.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record an internal counselor note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs hover:opacity-95 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              <div className="space-y-2">
                {applicant.notes?.length === 0 ? (
                  <p className="text-center py-6 text-ink-soft text-xs">No notes recorded yet.</p>
                ) : (
                  applicant.notes?.map((n, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-alt/30 border border-border space-y-1">
                      <p className="text-ink font-medium text-xs">{n.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-ink-soft pt-1 border-t border-border/50">
                        <span>{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2 bg-surface-alt/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-ink font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* ADVANCE STAGE MODAL */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-60">
          <div className="bg-surface border border-border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-ink">Advance Admission Stage</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Select Destination Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as AdmissionStage)}
                  className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-ink font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="submitted">Form Submitted</option>
                  <option value="shortlisted">Merit Shortlist</option>
                  <option value="counseling">Counseling Slot</option>
                  <option value="enrolled">Seat Confirmed</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Transition Reason (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared 1st round cut-off or attended counseling"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-ink focus:outline-none focus:border-primary placeholder:text-ink-soft"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAdvanceModal(false)}
                className="px-3 py-1.5 rounded-xl bg-surface-alt text-ink font-semibold text-xs hover:bg-surface-alt/80 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdvance}
                disabled={isAdvancing}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs hover:opacity-95 transition disabled:opacity-50"
              >
                {isAdvancing ? "Updating..." : "Confirm Move"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
