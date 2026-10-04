'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  FileText,
  LayoutTemplate,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Briefcase,
  GraduationCap,
  Wrench
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResumeImportService } from '../../services/ResumeImportService';
import { useResumeStore } from '../../store/useResumeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { TemplateGalleryModal } from '@/features/templates/components/TemplateGalleryModal';
import { ALL_RESUME_TEMPLATES } from '@/features/templates/data/templateList';
import { IResume } from '../../types';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'upload' | 'template'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-sleek');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [parsedResume, setParsedResume] = useState<IResume | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { updateTemplateId, saveResume } = useResumeStore();

  const initialTemplates = [
    {
      id: 'modern-sleek',
      name: 'Modern Sleek',
      category: 'Contemporary Accent',
      desc: 'Vibrant colors, dark mode accents',
    },
    {
      id: 'classic-ats',
      name: 'Classic ATS',
      category: 'High ATS Compatibility',
      desc: 'Traditional serif structure for scanners',
    },
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      category: 'Clean & Spacious',
      desc: 'Minimalist whitespace design',
    },
    {
      id: 'executive-pro',
      name: 'Executive Pro',
      category: 'Two-Column Layout',
      desc: 'Sidebar contact and core skills',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setError(null);
    }
  };

  const handleParse = async () => {
    setIsParsing(true);
    setError(null);

    try {
      let imported: IResume | null = null;
      if (inputMode === 'file') {
        if (!file) {
          setError('Please select a file to upload.');
          setIsParsing(false);
          return;
        }
        imported = await ResumeImportService.importFromFile(file);
      } else {
        if (!pasteText.trim()) {
          setError('Please paste your resume text.');
          setIsParsing(false);
          return;
        }
        imported = await ResumeImportService.importFromText(pasteText);
      }

      setIsParsing(false);
      setParsedResume(imported);
      // Advance to template selection step
      setStep('template');
    } catch (err: any) {
      console.error('Resume Import Error:', err);
      setError(err.message || 'Failed to import resume. Please verify your file or text content.');
      setIsParsing(false);
    }
  };

  const handleFinalizeAndLaunch = async () => {
    try {
      updateTemplateId(selectedTemplate);
      await saveResume(true).catch(() => {});
      useAuthStore.getState().completeOnboarding().catch(() => {});
      onClose();
      if (parsedResume?.id) {
        router.push(`/builder?id=${parsedResume.id}`);
      } else {
        router.push('/builder');
      }
    } catch (err) {
      onClose();
      router.push('/builder');
    }
  };

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setPasteText('');
    setError(null);
    setParsedResume(null);
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const isInitialTemplate = initialTemplates.some((t) => t.id === selectedTemplate);
  const customSelectedTemplate = !isInitialTemplate
    ? ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)
    : null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-surface border border-white/20 rounded-3xl p-6 sm:p-8 shadow-elegant text-ink overflow-hidden"
          >
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-glow/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-deep/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleModalClose}
              disabled={isParsing}
              className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink transition-colors rounded-xl hover:bg-surface-alt disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'upload' ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-brand text-primary-foreground rounded-2xl shadow-glow">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink">Upload Existing Resume</h2>
                    <p className="text-sm text-ink-soft">
                      Import your PDF, DOCX, DOC, or TXT file to extract and structure into your resume
                    </p>
                  </div>
                </div>

                {/* Mode Selection Tabs */}
                <div className="flex bg-surface-alt p-1 rounded-2xl border border-border mb-6">
                  <button
                    onClick={() => {
                      setInputMode('file');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      inputMode === 'file'
                        ? 'bg-gradient-brand text-primary-foreground shadow-elegant'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Upload File (PDF / DOCX / TXT)
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('text');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      inputMode === 'text'
                        ? 'bg-gradient-brand text-primary-foreground shadow-elegant'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Paste Raw Text
                  </button>
                </div>

                {/* Upload Zone / Text Area */}
                {inputMode === 'file' ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-primary-glow bg-primary/10'
                        : file
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border bg-surface-alt hover:border-primary-glow/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <>
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-semibold text-ink text-sm">{file.name}</p>
                          <p className="text-xs text-ink-soft mt-1">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <span className="text-xs text-primary-glow underline">
                          Click to choose a different file
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-gradient-brand text-primary-foreground rounded-2xl shadow-glow">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-medium text-ink text-sm">
                            Drag & drop your resume file here
                          </p>
                          <p className="text-xs text-ink-soft mt-1">
                            Supports PDF, DOCX, DOC, and TXT up to 15MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste your existing resume content, work experiences, skills, education, and summary here..."
                      rows={7}
                      className="input-base font-mono text-xs"
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={handleModalClose}
                    disabled={isParsing}
                    className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParse}
                    disabled={
                      isParsing ||
                      (inputMode === 'file' && !file) ||
                      (inputMode === 'text' && !pasteText.trim())
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl transition-all shadow-elegant hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Extracting & Normalizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Parse & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Extracted Summary & Template Selection */
              <>
                {/* Header with Back Button */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('upload')}
                      className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition-colors"
                      title="Back to upload"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-base font-bold text-ink flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Resume Extracted Successfully
                      </h2>
                      <p className="text-xs text-ink-soft">
                        Choose a LetGetIn template to render your imported resume
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parsed Resume Snapshot Card */}
                {parsedResume && (
                  <div className="mt-4 p-3.5 bg-surface-alt rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-xs shadow-glow">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink">
                          {parsedResume.content.personalInfo.fullName || 'Imported Resume'}
                        </h4>
                        <p className="text-[11px] text-ink-soft">
                          {parsedResume.content.personalInfo.headline || 'Professional Profile'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-ink-soft font-semibold">
                      <span className="bg-surface px-2 py-1 rounded-lg border border-border flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-primary-glow" />
                        {parsedResume.content.experiences.length} Exp
                      </span>
                      <span className="bg-surface px-2 py-1 rounded-lg border border-border flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-primary-glow" />
                        {parsedResume.content.skills.length} Skills
                      </span>
                    </div>
                  </div>
                )}

                {/* Template Selection */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-semibold text-ink">
                      Select Template for Imported Content
                    </label>
                    {customSelectedTemplate && (
                      <span className="text-[11px] font-semibold text-primary-glow flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        <Check className="w-3 h-3" /> {customSelectedTemplate.name}
                      </span>
                    )}
                  </div>

                  {/* Custom Template Card if chosen from gallery */}
                  {customSelectedTemplate && (
                    <div className="mb-2.5 p-3 rounded-2xl border bg-primary/10 border-primary-glow text-ink ring-2 ring-primary-glow/40 shadow-glow flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary/20 rounded-xl text-primary-glow">
                          <LayoutTemplate className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-ink">
                            {customSelectedTemplate.name}
                          </span>
                          <span className="text-[10px] font-semibold text-primary-glow bg-primary/20 px-2 py-0.2 rounded-full ml-2">
                            {customSelectedTemplate.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGalleryOpen(true)}
                        className="text-xs font-semibold text-primary-glow hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    {initialTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedTemplate === tpl.id
                            ? 'bg-primary/10 border-primary-glow text-ink ring-2 ring-primary-glow/40 shadow-glow'
                            : 'bg-surface-alt border-border text-ink-soft hover:border-primary-glow/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <LayoutTemplate
                            className={`w-3.5 h-3.5 ${
                              selectedTemplate === tpl.id ? 'text-primary-glow' : 'text-ink-soft'
                            }`}
                          />
                          <span className="text-xs font-bold text-ink">{tpl.name}</span>
                        </div>
                        <p className="text-[10px] text-ink-soft leading-tight">{tpl.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* View All 40+ Templates Button */}
                  <div className="flex justify-center pt-2.5">
                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className="text-xs font-semibold text-primary-glow hover:text-primary-deep flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-primary/10 transition-all group"
                    >
                      <span>Browse All Templates ({ALL_RESUME_TEMPLATES.length}+)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink transition-colors rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizeAndLaunch}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl transition-all shadow-elegant hover:shadow-glow hover:scale-[1.02] active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch in Resume Builder</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Template Gallery Modal for Upload flow */}
      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={(tplId) => setSelectedTemplate(tplId)}
        resumeData={parsedResume || undefined}
      />
    </>
  );
};
