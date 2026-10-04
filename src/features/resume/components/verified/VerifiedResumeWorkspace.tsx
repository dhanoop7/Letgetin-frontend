"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Edit,
  Download,
  Share2,
  MoreHorizontal,
  Plus,
  LayoutTemplate,
  Calendar,
  Layers,
  ArrowRight,
  BadgeCheck,
  Copy,
  ExternalLink,
  RotateCcw,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { IResume } from "../../types";
import { StorageProviderFactory } from "../../storage/factory";
import { calculateAtsHeuristics } from "../../utils/atsHeuristics";
import { LivePreviewCanvas } from "../preview/LivePreviewCanvas";
import { ResumeVerificationModal } from "./ResumeVerificationModal";
import { CreateResumeModal } from "@/features/dashboard/components/CreateResumeModal";
import { triggerPdfDownload } from "../../utils/downloadPdf";

const calculateResumeCompletion = (resume: IResume | null): number => {
  if (!resume?.content) return 0;
  const analysis = calculateAtsHeuristics(resume.content);
  return analysis.completenessScore || 0;
};

export const VerifiedResumeWorkspace: React.FC = () => {
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [resumeToVerify, setResumeToVerify] = useState<IResume | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch all user resumes
  useEffect(() => {
    let isMounted = true;

    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const provider = StorageProviderFactory.getProvider();
        const list = await provider.list();

        if (isMounted) {
          const loadedResumes = Array.isArray(list) ? list : [];
          setResumes(loadedResumes);

          if (loadedResumes.length > 0) {
            // Default selection: Prefer active or verified resume, otherwise first available
            const preferred =
              loadedResumes.find((r) => r.isActive) ||
              loadedResumes.find((r) => r.isVerified) ||
              loadedResumes[0];
            setSelectedResumeId(preferred.id);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch resumes for verified page:", err);
        if (isMounted) {
          setResumes([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResumes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Split into verified and unverified lists
  const verifiedResumes = useMemo(
    () => resumes.filter((r) => r.isVerified === true),
    [resumes]
  );

  const unverifiedResumes = useMemo(
    () => resumes.filter((r) => !r.isVerified),
    [resumes]
  );

  // Currently selected resume
  const selectedResume = useMemo(() => {
    if (!selectedResumeId) return resumes[0] || null;
    return resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;
  }, [resumes, selectedResumeId]);

  // Completion score of selected resume
  const completionPercentage = useMemo(() => {
    if (!selectedResume) return 0;
    return calculateResumeCompletion(selectedResume);
  }, [selectedResume]);

  // Open verification modal
  const handleOpenVerifyModal = (resume: IResume, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setResumeToVerify(resume);
    setIsVerifyingModalOpen(true);
  };

  // Confirm verification callback
  const handleConfirmVerification = async (targetResume: IResume) => {
    const updatedResume: IResume = {
      ...targetResume,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    try {
      const provider = StorageProviderFactory.getProvider();
      await provider.save(updatedResume);

      // Update local state
      setResumes((prev) =>
        prev.map((r) => (r.id === targetResume.id ? updatedResume : r))
      );
      setSelectedResumeId(targetResume.id);
      toast.success(`Resume "${targetResume.title}" verified successfully!`);
    } catch (error) {
      console.error("Failed to persist resume verification:", error);
      toast.error(
        `Failed to save verified status for "${targetResume.title}". Please try again.`
      );
      throw error;
    }
  };

  // Copy share / preview link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!selectedResume) return;
    setIsDownloading(true);
    try {
      triggerPdfDownload();
      toast.success("Resume print & PDF dialog ready!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to trigger PDF download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-elegant relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground shadow-glow shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Verified Resume
              </h1>
              <p className="text-xs text-ink-soft mt-0.5">
                Official verified resumes, credential certification & ATS compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Copy share link"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isCopied ? "Copied" : "Share"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-brand text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Resume</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Resume Completion & Actions */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <span>Resume completion:</span>
              <span className="text-primary-glow font-extrabold text-base">
                {completionPercentage}%
              </span>
            </div>

            {/* Visual mini progress bar */}
            <div className="w-28 sm:w-36 bg-surface-alt rounded-full h-2 overflow-hidden border border-border/60">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completionPercentage >= 80
                    ? "bg-emerald-500"
                    : completionPercentage >= 50
                    ? "bg-gradient-brand"
                    : "bg-amber-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-ink-soft">
            {selectedResume && (
              <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
                Active preview: <strong className="text-ink">{selectedResume.title}</strong>
              </span>
            )}
            {selectedResume?.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8 h-[600px] bg-surface/50 border border-border rounded-3xl animate-pulse" />
          <div className="lg:col-span-5 xl:col-span-4 h-[600px] bg-surface/50 border border-border rounded-3xl animate-pulse" />
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State: No resumes at all */
        <div className="text-center py-20 bg-surface/40 border border-dashed border-border rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground mx-auto shadow-glow">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-ink">No Resumes Found</h3>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            You haven&apos;t created any resumes yet. Create your first resume to verify it and preview it live.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-brand text-primary-foreground text-xs font-bold px-6 py-3 rounded-xl shadow-elegant hover:shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SECTION 1: Resume Preview (Left Column) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-elegant flex flex-col space-y-4 min-h-[750px]">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-ink">
                  Resume Preview
                </h2>
                {selectedResume?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Verified Document
                  </span>
                )}
              </div>

              {/* Preview action buttons */}
              {selectedResume && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Download</span>
                  </button>

                  <Link
                    href={`/builder?id=${selectedResume.id}`}
                    className="p-2 rounded-xl bg-gradient-brand text-primary-foreground hover:shadow-glow transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    title="Open in Editor"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden md:inline">Edit</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 w-full relative min-h-[620px] rounded-2xl overflow-hidden bg-surface-alt/20 border border-border/60 flex flex-col">
              {selectedResume ? (
                <LivePreviewCanvas
                  resume={selectedResume}
                  initialZoom={80}
                  headerActions={
                    <div className="text-[11px] font-semibold text-ink-soft bg-surface/90 backdrop-blur px-3 py-1 rounded-full border border-border shadow-xs">
                      {selectedResume.title} • Template:{" "}
                      <span className="capitalize text-primary-glow font-bold">
                        {selectedResume.templateId.replace("-", " ")}
                      </span>
                    </div>
                  }
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <FileText className="w-10 h-10 text-ink-soft/60" />
                  <p className="text-xs text-ink-soft">
                    Select a resume from the list to preview it here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Unverified Resumes (Right Column) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-elegant space-y-5">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-ink">
                  Unverified Resumes
                </h2>
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {unverifiedResumes.length}
                </span>
              </div>
            </div>

            {/* List of Unverified Resumes */}
            {unverifiedResumes.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-surface-alt/30 border border-dashed border-border space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-ink">All Resumes Verified!</h4>
                <p className="text-xs text-ink-soft max-w-xs mx-auto leading-relaxed">
                  You have no pending unverified resumes. Great job keeping your profile certified!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs font-bold text-primary-glow hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create another resume
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {unverifiedResumes.map((res) => {
                  const score = calculateResumeCompletion(res);
                  const isSelected = selectedResume?.id === res.id;

                  return (
                    <div
                      key={res.id}
                      onClick={() => setSelectedResumeId(res.id)}
                      className={`relative rounded-2xl p-5 border transition-all cursor-pointer select-none group ${
                        isSelected
                          ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-glow"
                          : "bg-surface-alt/40 border-border/80 hover:border-primary-glow/60 hover:bg-surface-alt/60"
                      }`}
                    >
                      {/* Selected Indicator Pill */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-extrabold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <span>Previewing</span>
                        </div>
                      )}

                      {/* Title & Headline */}
                      <div className="pr-16 mb-2">
                        <h3 className="text-sm font-bold text-ink group-hover:text-primary-glow transition-colors truncate">
                          {res.title}
                        </h3>
                        <p className="text-xs text-ink-soft truncate mt-0.5">
                          {res.content?.personalInfo?.headline || "Software Professional"}
                        </p>
                      </div>

                      {/* Completion info */}
                      <div className="space-y-1.5 my-3 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-soft font-medium">Completion:</span>
                          <span className="font-extrabold text-ink">{score}%</span>
                        </div>
                        <div className="w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              score >= 80
                                ? "bg-emerald-500"
                                : score >= 50
                                ? "bg-gradient-brand"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      {/* Basic Metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-ink-soft mb-4">
                        <div className="flex items-center gap-1">
                          <LayoutTemplate className="w-3.5 h-3.5 text-primary-glow" />
                          <span className="capitalize">
                            {res.templateId ? res.templateId.replace("-", " ") : "Modern"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {res.updatedAt
                              ? new Date(res.updatedAt).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      {/* Verify Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenVerifyModal(res, e)}
                        className="w-full bg-gradient-brand text-primary-foreground text-xs font-bold py-2.5 px-4 rounded-xl shadow-elegant hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Resume</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Verified Resumes Quick Switcher (if user has verified resumes) */}
            {verifiedResumes.length > 0 && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Verified Resumes ({verifiedResumes.length})</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {verifiedResumes.map((vRes) => {
                    const isSelected = selectedResume?.id === vRes.id;
                    const vScore = calculateResumeCompletion(vRes);

                    return (
                      <div
                        key={vRes.id}
                        onClick={() => setSelectedResumeId(vRes.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm"
                            : "bg-surface-alt/30 border-border/60 hover:bg-surface-alt/60 hover:border-border"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink truncate">
                            {vRes.title}
                          </div>
                          <div className="text-[10px] text-ink-soft">
                            Completion: <strong className="text-emerald-500">{vScore}%</strong>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full shrink-0">
                          <BadgeCheck className="w-3 h-3" /> Certified
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Action Modal */}
      <ResumeVerificationModal
        isOpen={isVerifyingModalOpen}
        onClose={() => {
          setIsVerifyingModalOpen(false);
          setResumeToVerify(null);
        }}
        resume={resumeToVerify}
        onConfirmVerification={handleConfirmVerification}
      />

      {/* Create Resume Modal */}
      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
