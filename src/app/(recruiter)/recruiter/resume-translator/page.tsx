"use client";

import React, { useState } from "react";
import {
  Languages,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Download,
  Globe,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { aiWritingService } from "@/features/aiWriting/services/aiWritingService";
import { AIWritingAction } from "@/features/aiWriting/types";

interface LanguageOption {
  action: AIWritingAction;
  label: string;
  nativeLabel: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { action: "translate-es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { action: "translate-fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { action: "translate-de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { action: "translate-hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { action: "translate-zh", label: "Simplified Chinese", nativeLabel: "中文", flag: "🇨🇳" },
  { action: "translate-ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
];

const SAMPLE_RESUME_TEXT = `Full Stack Engineer with 5+ years of experience designing and scaling distributed web applications.
- Architected high-throughput microservices using Node.js, TypeScript, and MongoDB handling 15,000+ RPS.
- Built responsive client portals with React, Next.js, and Tailwind CSS.
- Optimized CI/CD deployment pipelines on AWS and Docker, reducing build times by 40%.
- Led cross-functional agile teams of 8 developers and collaborated with product stakeholders.`;

export default function RecruiterResumeTranslatorPage() {
  const [sourceText, setSourceText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError("Please enter or paste resume text to translate.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const result = await aiWritingService.generate({
        action: selectedLanguage.action,
        context: "resume-summary",
        text: sourceText.trim(),
      });
      setTranslatedText(result || "");
    } catch (err: unknown) {
      console.error("Translation failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Translation could not be completed. Please check your network and try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setSourceText(SAMPLE_RESUME_TEXT);
    setError(null);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard?.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_resume_${selectedLanguage.label.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary/10 text-primary-glow border border-primary/20">
              <Languages className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Startup Global Talent
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Resume Translator
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Translate and localize candidate credentials, CV summaries, and experience into multiple global languages with AI precision.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface hover:bg-surface-alt transition-colors cursor-pointer text-ink-soft hover:text-ink self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-primary-glow" />
          <span>Load Sample Resume</span>
        </button>
      </div>

      {/* Target Language Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
        <label className="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-primary-glow" />
          <span>Select Target Language</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage.action === lang.action;
            return (
              <button
                key={lang.action}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                    : "bg-surface-alt/50 border-border text-ink hover:bg-surface-alt hover:border-border/80"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div className="truncate">
                  <div className="truncate">{lang.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isSelected ? "text-primary-foreground/80" : "text-ink-soft"
                    }`}
                  >
                    {lang.nativeLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Translation Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Panel */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs min-h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary-glow" />
                <span>Original Resume (English)</span>
              </span>
              <span className="text-[11px] text-ink-soft">
                {sourceText.length} characters
              </span>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => {
                setSourceText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste candidate resume text, executive summary, technical skills, or work experience bullet points here..."
              rows={14}
              className="w-full bg-surface-alt/40 border border-border rounded-xl p-3.5 text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary-glow/50 transition resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={!sourceText && !translatedText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:text-ink hover:bg-surface-alt transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-xs shadow-glow hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate to {selectedLanguage.label}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translated Result Panel */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs min-h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <span>{selectedLanguage.flag}</span>
                <span>Translated Resume ({selectedLanguage.label})</span>
              </span>
              {translatedText && (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Translated
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-[320px] rounded-xl bg-surface-alt/30 border border-border/60 flex flex-col items-center justify-center text-ink-soft gap-2.5">
                <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
                <p className="text-xs font-semibold text-ink">
                  Generating high-fidelity localization...
                </p>
                <p className="text-[11px] text-ink-soft">
                  Adapting technical terminology for {selectedLanguage.label} recruiters
                </p>
              </div>
            ) : translatedText ? (
              <textarea
                readOnly
                value={translatedText}
                rows={14}
                className="w-full bg-surface-alt/20 border border-border/80 rounded-xl p-3.5 text-xs text-ink focus:outline-none resize-none leading-relaxed select-text"
              />
            ) : (
              <div className="h-[320px] rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-6 text-ink-soft">
                <Languages className="w-8 h-8 text-ink-soft/40 mb-2" />
                <p className="text-xs font-semibold text-ink">
                  No translation generated yet
                </p>
                <p className="text-[11px] text-ink-soft max-w-xs mt-1">
                  Enter resume content on the left, pick your desired language, and click &quot;Translate to {selectedLanguage.label}&quot;.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-surface hover:bg-surface-alt transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-soft hover:text-ink"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!translatedText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-surface hover:bg-surface-alt transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-soft hover:text-ink"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
