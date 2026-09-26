"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  HardDrive,
  ShieldCheck,
  Check,
  ArrowUpRight,
  GraduationCap,
  Wrench,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import {
  SectionType,
  VerificationDocument,
  VerificationService,
  VerificationStatus,
} from "@/features/profile/services/verificationService";
import { VerificationBadge } from "@/features/profile/components/VerificationBadge";
import { DocumentViewerModal } from "@/features/profile/components/DocumentViewerModal";
import { IResume } from "../../types";
import { toast } from "sonner";

export type ResumeVerificationCategory = "education" | "skills" | "experience";

export interface CategoryOption {
  id: ResumeVerificationCategory;
  label: string;
  icon: typeof GraduationCap;
  description: string;
}

export const VERIFICATION_CATEGORIES: CategoryOption[] = [
  {
    id: "education",
    label: "Education Credentials",
    icon: GraduationCap,
    description: "Degree, marksheet, and official academic transcripts",
  },
  {
    id: "skills",
    label: "Skill Verification",
    icon: Wrench,
    description: "Industry certificates and online course completion proofs",
  },
  {
    id: "experience",
    label: "Experience Proof",
    icon: Briefcase,
    description: "Offer letters, experience letters, payslips & relieving letters",
  },
];

export const RESUME_DOCUMENT_OPTIONS: Record<
  ResumeVerificationCategory,
  Array<{ value: string; label: string; hint: string }>
> = {
  education: [
    { value: "degree_certificate", label: "Degree Certificate", hint: "Official graduation degree or diploma" },
    { value: "marksheet", label: "Marksheet / Grade Card", hint: "Consolidated or semester marksheet" },
    { value: "transcript", label: "Official Transcript", hint: "University issued transcript PDF" },
  ],
  skills: [
    { value: "certification_pdf", label: "Certification PDF", hint: "AWS, GCP, Meta, Coursera certificate" },
    { value: "course_completion", label: "Course Certificate", hint: "Bootcamp, Udemy, edX completion proof" },
  ],
  experience: [
    { value: "experience_letter", label: "Experience Letter", hint: "Relieving or experience certificate" },
    { value: "offer_letter", label: "Offer Letter", hint: "Signed employment offer letter" },
    { value: "relieving_letter", label: "Relieving Letter", hint: "Formal exit clearance letter" },
    { value: "salary_slip", label: "Salary Slip / Payslip", hint: "Recent 3 months salary payslip" },
    { value: "appointment_letter", label: "Appointment Letter", hint: "Official appointment confirmation" },
  ],
};

interface ResumeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: IResume | null;
  onConfirmVerification: (resume: IResume) => Promise<void>;
}

export const ResumeVerificationModal: React.FC<ResumeVerificationModalProps> = ({
  isOpen,
  onClose,
  resume,
  onConfirmVerification,
}) => {
  const [activeCategory, setActiveCategory] = useState<ResumeVerificationCategory>("education");
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>(
    RESUME_DOCUMENT_OPTIONS.education[0].value
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<VerificationDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch verified documents on modal open
  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const data = await VerificationService.getVerifications();
      if (data && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.warn("Failed to load verification documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  // Update default document type when category changes
  useEffect(() => {
    const opts = RESUME_DOCUMENT_OPTIONS[activeCategory];
    if (opts && opts[0]) {
      setSelectedDocType(opts[0].value);
    }
    setSelectedFile(null);
    setErrorMessage(null);
  }, [activeCategory]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (documentToDelete) {
          if (!isDeleting) setDocumentToDelete(null);
        } else if (previewDoc) {
          setPreviewDoc(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, previewDoc, documentToDelete, isDeleting]);

  // Filter documents by active category
  const categoryDocuments = documents.filter((doc) => {
    if (activeCategory === "education") return doc.section === "education";
    if (activeCategory === "skills") return doc.section === "skills";
    if (activeCategory === "experience") return doc.section === "experience";
    return false;
  });

  const categoryVerifiedCount = categoryDocuments.filter(
    (d) => d.verification.status === "verified"
  ).length;

  const totalVerifiedCount = documents.filter(
    (d) => d.verification.status === "verified"
  ).length;

  const handleFileSelect = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File size exceeds 15MB limit.");
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const section: SectionType =
        activeCategory === "education"
          ? "education"
          : activeCategory === "skills"
          ? "skills"
          : "experience";

      const uploadedDoc = await VerificationService.uploadDocument(
        selectedFile,
        section,
        selectedDocType,
        resume ? { resumeId: resume.id, resumeTitle: resume.title } : undefined
      );

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setDocuments((prev) => [uploadedDoc, ...prev.filter((d) => d._id !== uploadedDoc._id)]);
      toast.success("Document uploaded successfully! Verification in progress.");
      fetchDocuments();
    } catch (err: any) {
      const msg =
        err?.error?.message ||
        err?.message ||
        "Failed to upload document for verification.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    const docId = documentToDelete._id;
    setIsDeleting(true);
    try {
      await VerificationService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      toast.success("Document removed successfully");
      setDocumentToDelete(null);
    } catch (err: any) {
      const msg = err?.message || "Failed to remove document";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDone = async () => {
    if (!resume) {
      onClose();
      return;
    }

    const verifiedDocs = documents.filter(
      (d) => d.verification.status === "verified"
    );

    if (verifiedDocs.length === 0) {
      const hasPending = documents.some((d) => d.verification.status === "pending");
      const validationMsg = hasPending
        ? "Document verification is still in progress. Please wait for verification to complete before certifying your resume."
        : documents.length === 0
        ? "No documents uploaded. Please upload and verify at least one supporting credential before certifying your resume."
        : "No verified documents found. Please ensure at least one supporting document is verified before certifying your resume.";
      setErrorMessage(validationMsg);
      toast.error(validationMsg);
      return;
    }

    setIsSubmittingDone(true);
    try {
      await onConfirmVerification(resume);
      onClose();
    } catch (err: any) {
      console.error("Done verification error:", err);
      const msg = err?.message || "Failed to save verified resume.";
      setErrorMessage(msg);
    } finally {
      setIsSubmittingDone(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen || !mounted || !resume) return null;

  const currentDocOptions = RESUME_DOCUMENT_OPTIONS[activeCategory];

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-surface border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-scale-up">
        {/* 1. Header */}
        <div className="px-6 py-5 bg-surface border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shrink-0 shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-ink text-base sm:text-lg truncate">
                  Resume Verification
                </h3>
                <span className="text-xs font-semibold text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 truncate">
                  {resume.title}
                </span>
                {resume.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Certified
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-0.5 truncate">
                Authenticate your education, skills, and experience with supporting proofs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/drive?category=profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary-glow bg-secondary/60 hover:bg-secondary border border-border px-3 py-1.5 rounded-xl transition cursor-pointer"
              title="Open all documents in Cloud Drive"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink rounded-xl border border-border hover:bg-secondary transition cursor-pointer"
              title="Close Verification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Category Tabs */}
        <div className="px-6 pt-3 bg-surface-alt/30 border-b border-border flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
          {VERIFICATION_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const catDocs = documents.filter((d) => d.section === cat.id);
            const verifiedDocs = catDocs.filter((d) => d.verification.status === "verified");

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-primary-glow text-primary-glow bg-primary/5"
                    : "border-transparent text-ink-soft hover:text-ink hover:bg-secondary/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary-glow" : "text-ink-soft"}`} />
                <span>{cat.label}</span>
                {catDocs.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      verifiedDocs.length > 0
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : "bg-secondary text-ink-soft border border-border"
                    }`}
                  >
                    {catDocs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Banner / Guide */}
          <div className="bg-surface-alt/40 border border-border/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-ink">
                {activeCategory === "education" && "Education Credentials Verification"}
                {activeCategory === "skills" && "Skill & Certification Verification"}
                {activeCategory === "experience" && "Work Experience Proof"}
              </h4>
              <p className="text-xs text-ink-soft">
                {activeCategory === "education" &&
                  "Provide your degree certificate, marksheets, or official transcripts to verify educational history."}
                {activeCategory === "skills" &&
                  "Upload official certification PDFs or course completion certificates to validate claimed skills."}
                {activeCategory === "experience" &&
                  "Submit offer letters, experience certificates, payslips, or relieving letters for past employment."}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-ink-soft">Category Verified: </span>
              <strong className="text-xs text-emerald-500 font-bold">
                {categoryVerifiedCount} of {categoryDocuments.length} docs
              </strong>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs p-3.5 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Upload New Document Box */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary-glow" /> Upload New Document
              </h4>
              <span className="text-[11px] text-ink-soft">PDF, PNG, JPG, WEBP, DOCX (Max 15MB)</span>
            </div>

            {/* Document Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Select Document Type:
              </label>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentDocOptions.map((opt) => {
                  const isSelected = selectedDocType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDocType(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary/10 border-primary-glow text-primary-glow ring-1 ring-primary-glow"
                          : "bg-surface border-border text-ink hover:bg-secondary/70"
                      }`}
                    >
                      <span className="font-bold text-xs">{opt.label}</span>
                      {opt.hint && (
                        <span className="text-[10px] text-ink-soft mt-0.5 truncate">{opt.hint}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-primary-glow bg-primary/10 scale-[0.99]"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-primary-glow/50 bg-surface/60 hover:bg-surface"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />

              {selectedFile ? (
                <div className="flex items-center gap-3 text-left w-full max-w-md bg-surface p-3 rounded-xl border border-emerald-500/30 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-ink truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-ink-soft">{formatSize(selectedFile.size)} • Click to change</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 text-ink-soft hover:text-rose-500 rounded-lg hover:bg-secondary transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary-glow mb-1 shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-ink">
                    Click to browse or drag & drop file here
                  </p>
                  <p className="text-[11px] text-ink-soft">
                    Supports high-resolution images & multi-page PDF documents
                  </p>
                </>
              )}
            </div>

            {/* Upload Action Button */}
            <div className="flex justify-end gap-3">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-xl border border-border hover:bg-secondary transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-brand text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading & Verifying...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Verify Document</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-extrabold text-ink text-sm uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary-glow" /> Uploaded Documents ({categoryDocuments.length})
              </h4>
              <span className="text-xs text-ink-soft">
                {categoryVerifiedCount} verified in this section
              </span>
            </div>

            {isLoadingDocs ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-surface/50 border border-border rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : categoryDocuments.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-2 bg-surface/50">
                <FileText className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
                <p className="font-bold text-ink text-sm">No documents uploaded yet</p>
                <p className="text-xs text-ink-soft">
                  Upload your {activeCategory} proofs using the form above to verify your credentials.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {categoryDocuments.map((doc) => {
                  const isPending = doc.verification.status === "pending";
                  const isVerified = doc.verification.status === "verified";
                  const isRejected = doc.verification.status === "rejected";

                  return (
                    <div
                      key={doc._id}
                      className={`bg-surface border rounded-2xl p-4 space-y-3 text-xs shadow-xs transition-all ${
                        isPending
                          ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                          : isVerified
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isRejected
                          ? "border-rose-500/30 bg-rose-500/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                          title="Click to view document"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
                              isPending
                                ? "bg-amber-500/10 text-amber-500"
                                : isVerified
                                ? "bg-emerald-500/10 text-emerald-500"
                                : isRejected
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-secondary text-primary-glow"
                            }`}
                          >
                            {isPending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate group-hover:text-primary-glow transition text-sm">
                              {doc.cloudinary.originalName}
                            </p>
                            <p className="text-[11px] text-ink-soft mt-0.5">
                              <span className="capitalize">{doc.documentType.replace(/_/g, " ")}</span> •{" "}
                              {formatSize(doc.cloudinary.size)} •{" "}
                              {new Date(doc.cloudinary.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <VerificationBadge
                            status={doc.verification.status}
                            size="sm"
                          />

                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-primary/10 text-ink-soft hover:text-primary-glow text-xs font-semibold rounded-xl border border-border transition cursor-pointer"
                            title="View document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Open in Cloud Drive */}
                          <Link
                            href={`/drive?search=${encodeURIComponent(doc.cloudinary.originalName)}`}
                            className="p-2 text-ink-soft hover:text-primary-glow rounded-xl hover:bg-secondary border border-border transition"
                            title="View in Cloud Drive"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Document */}
                          <button
                            type="button"
                            onClick={() => setDocumentToDelete(doc)}
                            disabled={isDeleting || documentToDelete?._id === doc._id}
                            className="p-2 text-ink-soft hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-border transition disabled:opacity-30 cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* AI Verification Insight */}
                      {doc.ai?.summary && (
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-start gap-2 text-[11px] text-ink-soft">
                          <Sparkles className="w-3.5 h-3.5 text-primary-glow shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{doc.ai.summary}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 4. Bottom Footer */}
        <div className="px-6 py-4 bg-surface border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <ShieldCheck className="w-4 h-4 text-primary-glow" />
            <span>
              Total Verified: <strong className="text-ink">{totalVerifiedCount} document(s)</strong> across profile
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl border border-border transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={isSubmittingDone}
              className="inline-flex items-center justify-center gap-2 bg-gradient-brand text-white text-xs font-bold px-6 py-2 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer disabled:opacity-50"
            >
              {isSubmittingDone ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-ink text-sm">Delete Document</h3>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setDocumentToDelete(null)}
                disabled={isDeleting}
                className="p-1 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-lg transition disabled:opacity-50 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink-soft leading-relaxed">
                Are you sure you want to remove this verification document? This action cannot be undone.
              </p>

              <div className="p-3 bg-surface-alt/70 rounded-xl border border-border/70 text-xs font-semibold text-ink truncate flex items-center gap-2">
                <span className="text-ink-soft font-normal shrink-0">Document:</span>
                <span className="truncate">{documentToDelete.cloudinary?.originalName || "Document"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 font-bold text-xs text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>,
    document.body
  );
};
