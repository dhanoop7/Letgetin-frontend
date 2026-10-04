'use client';

import React, { useState } from 'react';
import { X, Sparkles, LayoutTemplate, Upload, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '../../resume/store/useResumeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { TemplateGalleryModal } from '@/features/templates/components/TemplateGalleryModal';
import { ResumeUploadModal } from '@/features/resume/components/onboarding/ResumeUploadModal';
import { ALL_RESUME_TEMPLATES } from '@/features/templates/data/templateList';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { updateTitle, updateTemplateId } = useResumeStore();
  const [title, setTitle] = useState('My Professional Resume');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-sleek');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  if (!isOpen) return null;

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

  // Check if current selection is one of the initial 4 or a custom one from gallery
  const isInitialTemplate = initialTemplates.some((t) => t.id === selectedTemplate);
  const customSelectedTemplate = !isInitialTemplate
    ? ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)
    : null;

  const handleCreate = () => {
    updateTitle(title.trim() || 'My Professional Resume');
    updateTemplateId(selectedTemplate);
    useAuthStore.getState().completeOnboarding().catch(() => {});
    onClose();
    router.push('/builder');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-surface border border-white/20 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-elegant space-y-6 text-ink">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-xs shadow-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-ink">Create New Resume</h2>
            </div>
            <button
              onClick={onClose}
              className="text-ink-soft hover:text-ink p-1 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer Resume"
              className="input-base"
            />
          </div>

          {/* Initial Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-ink">
                Select Initial Template
              </label>
              {customSelectedTemplate && (
                <span className="text-[11px] font-semibold text-primary-glow flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <Check className="w-3 h-3" /> Selected: {customSelectedTemplate.name}
                </span>
              )}
            </div>

            {/* If user picked a custom template from gallery that's not in the 4 cards */}
            {customSelectedTemplate && (
              <div className="p-3.5 rounded-2xl border bg-primary/10 border-primary-glow text-ink ring-2 ring-primary-glow/40 shadow-glow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl text-primary-glow">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{customSelectedTemplate.name}</span>
                      <span className="text-[10px] font-semibold text-primary-glow bg-primary/20 px-2 py-0.5 rounded-full">
                        {customSelectedTemplate.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft leading-tight mt-0.5">
                      {customSelectedTemplate.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-xs font-semibold text-primary-glow hover:underline shrink-0 ml-2"
                >
                  Change
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {initialTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-primary/10 border-primary-glow text-ink ring-2 ring-primary-glow/40 shadow-glow'
                      : 'bg-surface-alt border-border text-ink-soft hover:border-primary-glow/40'
                  }`}
                >
                  <div className="flex items-center p-0 gap-2 mb-1.5">
                    <LayoutTemplate
                      className={`w-4 h-4 ${
                        selectedTemplate === tpl.id ? 'text-primary-glow' : 'text-ink-soft'
                      }`}
                    />
                    <span className="text-xs font-bold text-ink">{tpl.name}</span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-tight">{tpl.desc}</p>
                </div>
              ))}
            </div>

            {/* View More Button positioned directly above Launch Builder */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="px-6 py-2.5 text-xs font-semibold bg-gradient-brand text-primary-foreground rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Actions Section */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Upload Existing Resume Action */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 text-xs font-semibold text-ink hover:text-primary-glow border border-border hover:border-primary-glow/40 rounded-xl bg-surface-alt hover:bg-primary/5 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4 text-primary-glow" />
              <span>Upload Existing Resume</span>
            </button>

            {/* Cancel / Launch Builder Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2.5 text-xs font-semibold bg-gradient-brand text-primary-foreground rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95"
              >
                Launch Builder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={(tplId) => setSelectedTemplate(tplId)}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
};
