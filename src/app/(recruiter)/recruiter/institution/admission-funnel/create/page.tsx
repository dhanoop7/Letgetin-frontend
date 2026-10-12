"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  X,
  UserPlus,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { admissionService } from "@/features/institution/services/admissionService";
import {
  AdmissionTrack,
  CreateAdmissionTrackInput,
  CreateAdmissionApplicationInput,
  AdmissionStage,
} from "@/features/institution/types/admission.types";

export default function InstitutionCreateAdmissionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [tracks, setTracks] = useState<AdmissionTrack[]>([]);

  // Track Form State
  const [programName, setProgramName] = useState("");
  const [schoolName, setSchoolName] = useState("School of Computing & Data Sciences");
  const [totalSeats, setTotalSeats] = useState("120");
  const [deadlineDate, setDeadlineDate] = useState("2026-12-31");
  const [eligibilityText, setEligibilityText] = useState("");
  const [feeAmount, setFeeAmount] = useState("1200");
  const [isSubmittingTrack, setIsSubmittingTrack] = useState(false);

  // Applicant Registration Form State
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candCity, setCandCity] = useState("Bengaluru, India");
  const [candProgram, setCandProgram] = useState("");
  const [candStage, setCandStage] = useState<AdmissionStage>("inquiry");
  const [candScore, setCandScore] = useState("");
  const [candGpa, setCandGpa] = useState("");
  const [candCategory, setCandCategory] = useState("General Merit");
  const [candSource, setCandSource] = useState("Website");
  const [candCounselor, setCandCounselor] = useState("Priya Nair");
  const [candHostel, setCandHostel] = useState(false);
  const [isSubmittingApplicant, setIsSubmittingApplicant] = useState(false);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const data = await admissionService.getTracks();
      setTracks(data);
      if (data.length > 0 && !candProgram) {
        setCandProgram(data[0].program);
      }
    } catch (err) {
      console.error("Failed to load tracks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim()) return;

    try {
      setIsSubmittingTrack(true);
      const newTrack = await admissionService.createTrack({
        program: programName.trim(),
        school: schoolName.trim(),
        seats: Number(totalSeats) || 60,
        deadline: deadlineDate,
        eligibility: eligibilityText || "10+2 with required domain cutoff",
        applicationFee: `₹${Number(feeAmount).toLocaleString("en-IN")}`,
        status: "Open",
      });

      setTracks([newTrack, ...tracks]);
      setProgramName("");
      setEligibilityText("");
      setIsIntakeModalOpen(false);
      setActionSuccess(`Admission track "${newTrack.program}" launched successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to create track");
    } finally {
      setIsSubmittingTrack(false);
    }
  };

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candEmail.trim()) return;

    try {
      setIsSubmittingApplicant(true);
      const newApp = await admissionService.createApplication({
        name: candName.trim(),
        email: candEmail.trim(),
        phone: candPhone.trim(),
        city: candCity.trim(),
        program: candProgram || (tracks[0]?.program ?? "General B.Tech"),
        stage: candStage,
        score: candScore.trim(),
        gpa: candGpa.trim(),
        category: candCategory,
        source: candSource,
        counselor: candCounselor,
        hostelOpted: candHostel,
      });

      // Update local track applied count
      setTracks((prev) =>
        prev.map((t) =>
          t.program === newApp.program ? { ...t, appliedCount: t.appliedCount + 1 } : t
        )
      );

      setCandName("");
      setCandEmail("");
      setCandPhone("");
      setCandScore("");
      setCandGpa("");
      setIsApplicantModalOpen(false);
      setActionSuccess(
        `Application ${newApp.applicantId} created for ${newApp.name} in stage "${candStage}"!`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to create application");
    } finally {
      setIsSubmittingApplicant(false);
    }
  };

  const filteredTracks = tracks.filter(
    (i) =>
      i.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalApprovedSeats = tracks.reduce((acc, t) => acc + (t.seats || 0), 0);
  const totalAppsReceived = tracks.reduce((acc, t) => acc + (t.appliedCount || 0), 0);

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
            Configure new admission tracks, quotas, and register prospective student applications into the pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsApplicantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface border border-border text-ink text-xs sm:text-sm font-bold hover:bg-surface-alt transition cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-primary-glow" />
            <span>New Application</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIntakeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Admission Track</span>
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
          <span className="text-xs text-ink-soft">Active Admission Tracks</span>
          <p className="text-2xl font-black text-ink mt-1">{tracks.length} Programs</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Intake 2026-27</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Approved Seats</span>
          <p className="text-2xl font-black text-primary-glow mt-1">{totalApprovedSeats} Seats</p>
          <span className="text-[11px] text-ink-soft">Across all academic schools</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Applications Received</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{totalAppsReceived}</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Persisted in MongoDB</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Application Fee Collected</span>
          <p className="text-2xl font-black text-ink mt-1">₹{(totalAppsReceived * 1200 / 100000).toFixed(2)}L</p>
          <span className="text-[11px] text-ink-soft">Direct portal payments</span>
        </div>
      </div>

      {/* Quick Links Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/recruiter/institution/admission-funnel/kanban"
          className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink group-hover:text-primary-glow transition">Kanban Pipeline Board</h3>
          <p className="text-[11px] text-ink-soft">Move candidates visually from inquiry through counseling to enrollment.</p>
        </Link>
        <Link
          href="/recruiter/institution/admission-funnel/shortlist"
          className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink group-hover:text-primary-glow transition">Merit Shortlist</h3>
          <p className="text-[11px] text-ink-soft">Review entrance percentiles and issue bulk counseling call letters.</p>
        </Link>
        <Link
          href="/recruiter/institution/admission-funnel/finalist"
          className="p-4 rounded-2xl bg-surface border border-border space-y-2 hover:border-primary/40 transition group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-ink group-hover:text-primary-glow transition">Admission Finalists</h3>
          <p className="text-[11px] text-ink-soft">Manage confirmed seat allocations, fee verification, and onboarding.</p>
        </Link>
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

        {isLoading ? (
          <div className="text-center py-10 text-ink-soft text-xs">Loading admission tracks...</div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-10 text-ink-soft text-xs border border-dashed border-border rounded-xl">
            No admission tracks found. Launch a new track above.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTracks.map((intake) => (
              <div
                key={intake._id}
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
                    href={`/recruiter/institution/admission-funnel/kanban?program=${encodeURIComponent(intake.program)}`}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                  >
                    View Pipeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Creating Admission Track */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Launch Admission Track</h3>
              <button
                type="button"
                onClick={() => setIsIntakeModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTrack} className="space-y-3.5 text-xs">
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
                  placeholder="e.g. Min 70% in 10+2 with Physics, Chemistry & Math + Valid Entrance Score"
                  value={eligibilityText}
                  onChange={(e) => setEligibilityText(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-semibold hover:bg-surface-alt/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrack}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTrack ? "Launching..." : "Launch Admission Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Creating New Student Application (AdmitFlow Integration) */}
      {isApplicantModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-ink">Register New Application</h3>
                <p className="text-[11px] text-ink-soft">Enter applicant details to enroll directly into the funnel</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplicantModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya Kapoor"
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={candCity}
                    onChange={(e) => setCandCity(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Target Admission Track *</label>
                <select
                  value={candProgram}
                  onChange={(e) => setCandProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary font-semibold"
                >
                  {tracks.map((t) => (
                    <option key={t._id} value={t.program}>
                      {t.program}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Initial Pipeline Stage</label>
                  <select
                    value={candStage}
                    onChange={(e) => setCandStage(e.target.value as AdmissionStage)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="inquiry">Inquiry / Lead</option>
                    <option value="submitted">Form Submitted</option>
                    <option value="shortlisted">Merit Shortlist</option>
                    <option value="counseling">Counseling Slot</option>
                    <option value="enrolled">Seat Confirmed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Quota / Category</label>
                  <select
                    value={candCategory}
                    onChange={(e) => setCandCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="General Merit">General Merit</option>
                    <option value="Merit Scholar">Merit Scholar</option>
                    <option value="State Domicile">State Domicile</option>
                    <option value="International / NRI">International / NRI</option>
                    <option value="Corporate Sponsored">Corporate Sponsored</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Entrance Score</label>
                  <input
                    type="text"
                    placeholder="e.g. JEE 97.4%ile or CAT 92%"
                    value={candScore}
                    onChange={(e) => setCandScore(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Prior 12th GPA / Board</label>
                  <input
                    type="text"
                    placeholder="e.g. 91.5% (CBSE)"
                    value={candGpa}
                    onChange={(e) => setCandGpa(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Lead Source</label>
                  <select
                    value={candSource}
                    onChange={(e) => setCandSource(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="Website">Website</option>
                    <option value="Education Fair">Education Fair</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Assigned Counselor</label>
                  <select
                    value={candCounselor}
                    onChange={(e) => setCandCounselor(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="Priya Nair">Priya Nair</option>
                    <option value="Rahul Verma">Rahul Verma</option>
                    <option value="Ananya Bose">Ananya Bose</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="candHostel"
                  checked={candHostel}
                  onChange={(e) => setCandHostel(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="candHostel" className="font-semibold text-ink cursor-pointer">
                  Require campus hostel accommodation
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsApplicantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-semibold hover:bg-surface-alt/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApplicant}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingApplicant ? "Enrolling..." : "Enroll Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
