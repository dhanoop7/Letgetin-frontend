'use client';

import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { ESignService } from '../services/eSignService';

interface ConsentPdfUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const ConsentPdfUploader: React.FC<ConsentPdfUploaderProps> = ({
  selectedFile,
  onFileSelect,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsValidating(true);

    try {
      const result = await ESignService.validatePdfDocument(file);
      if (!result.isValid) {
        setError(result.error || 'Invalid PDF file. Please select a valid PDF.');
        onFileSelect(null);
      } else {
        setError(null);
        onFileSelect(file);
      }
    } catch {
      setError('Failed to validate the selected file.');
      onFileSelect(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // reset input value so re-uploading same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChooseClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setError(null);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Upload Consent Form
            </h3>
            <p className="text-xs text-ink-soft">
              Attach your signed or filled PDF consent document.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-ink-soft bg-surface-alt border border-border px-2.5 py-1 rounded-full">
          PDF only • Max 10 MB
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseClick}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-primary-glow bg-primary/5 scale-[1.005]'
              : 'border-border/80 hover:border-primary-glow/60 hover:bg-surface-alt/60 bg-surface-alt/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-ink">
              Upload your consent form
            </h4>
            <p className="text-xs text-ink-soft">
              PDF files only • Maximum 10 MB
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleChooseClick();
            }}
            disabled={disabled}
            className="mt-1 px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all cursor-pointer"
          >
            Choose PDF
          </button>

          <p className="text-[11px] text-ink-soft/70">
            or drag and drop your file here
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-ink truncate">
                    {selectedFile.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>
                <div className="text-[11px] text-ink-soft">
                  {formatFileSize(selectedFile.size)} • PDF Document
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleChooseClick}
                disabled={disabled}
                className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink hover:bg-surface transition-all flex items-center gap-1.5 cursor-pointer"
                title="Replace PDF"
              >
                <RefreshCw className="w-3.5 h-3.5 text-ink-soft" />
                <span className="hidden sm:inline">Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Remove PDF"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isValidating && (
        <div className="text-xs text-primary-glow flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Validating PDF structure & integrity...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
