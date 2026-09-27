'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  Search,
  Check,
  Sparkles,
  ShieldCheck,
  LayoutTemplate,
  SlidersHorizontal
} from 'lucide-react';
import { ALL_RESUME_TEMPLATES, TEMPLATE_CATEGORIES, TemplateItem } from '../data/templateList';
import { getTemplateComponent } from '../registry';
import { INITIAL_RESUME_STATE } from '@/features/resume/constants/initialState';
import { IResume } from '@/features/resume/types';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  resumeData?: IResume;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  resumeData = INITIAL_RESUME_STATE,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tempSelectedId, setTempSelectedId] = useState<string>(selectedTemplateId || 'modern-sleek');

  // Sync temp selection when modal opens with new selection
  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedId(selectedTemplateId || 'modern-sleek');
    }
  }, [isOpen, selectedTemplateId]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return ALL_RESUME_TEMPLATES.filter((tpl) => {
      const matchesCategory =
        activeCategory === 'All' || tpl.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Find currently highlighted template object
  const currentSelectedTemplate = useMemo(() => {
    return (
      ALL_RESUME_TEMPLATES.find((t) => t.id === tempSelectedId) ||
      ALL_RESUME_TEMPLATES[0]
    );
  }, [tempSelectedId]);

  const handleConfirm = () => {
    onSelectTemplate(tempSelectedId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl h-[92vh] max-h-[900px] bg-surface border border-white/20 rounded-3xl shadow-elegant text-ink flex flex-col overflow-hidden"
        >
          {/* Top Bar / Header */}
          <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink bg-surface-alt hover:bg-surface-alt/80 border border-border rounded-xl transition-all hover:-translate-x-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Create Resume</span>
              </button>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-primary-glow" />
                  <h2 className="text-base font-bold text-ink">Resume Templates Gallery</h2>
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    {ALL_RESUME_TEMPLATES.length} Designs
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl transition-colors"
              title="Close template gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="px-6 py-3.5 bg-surface-alt/50 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const count =
                  cat === 'All'
                    ? ALL_RESUME_TEMPLATES.length
                    : ALL_RESUME_TEMPLATES.filter((t) => t.category === cat).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-brand text-primary-foreground shadow-elegant'
                        : 'bg-surface border border-border text-ink-soft hover:text-ink hover:border-primary-glow/40'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-alt text-ink-soft'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-surface border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary-glow focus:ring-1 focus:ring-primary-glow transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Template Cards Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-background/40 scrollbar-thin scrollbar-thumb-border">
            {filteredTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-14 h-14 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-ink-soft mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-ink">No templates found</h3>
                <p className="text-xs text-ink-soft mt-1 max-w-sm">
                  We couldn&apos;t find any templates matching &quot;{searchQuery}&quot;. Try selecting a different category or clearing your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-surface-alt border border-border text-ink hover:border-primary-glow rounded-xl transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((tpl) => {
                  const isSelected = tempSelectedId === tpl.id;
                  const TemplateComp = getTemplateComponent(tpl.id);

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setTempSelectedId(tpl.id)}
                      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-surface border-primary-glow ring-2 ring-primary-glow/40 shadow-glow'
                          : 'bg-surface border-border hover:border-primary-glow/40 hover:shadow-elegant'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-ink bg-surface-alt px-2 py-0.5 rounded-md border border-border">
                            {tpl.category}
                          </span>
                          {tpl.badge && (
                            <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {tpl.badge}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {tpl.atsScore}
                        </span>
                      </div>

                      {/* Scaled Live Rendered Thumbnail Preview */}
                      <div className="w-full h-64 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-border/80 mb-3 overflow-hidden relative group-hover:scale-[1.01] transition-transform select-none pointer-events-none flex items-start justify-center p-2">
                        {/* Selected overlay indicator */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 bg-gradient-brand text-primary-foreground text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-20 pointer-events-none">
                            <Check className="w-3 h-3" /> Selected
                          </div>
                        )}

                        {/* Scaled Resume Sheet */}
                        <div
                          className="origin-top transform scale-[0.27] shadow-md bg-white rounded-sm pointer-events-none"
                          style={{
                            width: '210mm',
                            minHeight: '297mm',
                          }}
                        >
                          <TemplateComp resume={resumeData} />
                        </div>
                      </div>

                      {/* Info & Selection Button */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-xs font-bold text-ink group-hover:text-primary-glow transition-colors">
                            {tpl.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-ink-soft leading-snug line-clamp-2 mb-3">
                          {tpl.description}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempSelectedId(tpl.id);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-brand text-primary-foreground shadow-elegant'
                              : 'bg-surface-alt hover:bg-surface text-ink border border-border hover:border-primary-glow/40'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Template Selected</span>
                            </>
                          ) : (
                            <span>Select Template</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="px-6 py-4 bg-surface border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xs text-ink-soft">
                Selected Template:{' '}
                <span className="font-bold text-ink text-sm ml-1">
                  {currentSelectedTemplate.name}
                </span>{' '}
                <span className="text-[10px] font-medium text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full ml-1.5">
                  {currentSelectedTemplate.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors rounded-xl border border-transparent hover:border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-gradient-brand text-primary-foreground rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
