'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { DocTypeConfig, UploadedDoc } from '../types';

export interface FileDropzoneProps {
  config: DocTypeConfig;
  uploadedDoc?: UploadedDoc;
  onUploadSuccess: (doc: UploadedDoc) => void;
  onRemove: (docId: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  config,
  uploadedDoc,
  onUploadSuccess,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = (file: File) => {
    setErrorMessage(null);

    // Format validation
    const fileType = file.type || '';
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidFormat =
      config.acceptedFormats.some((fmt) => fmt === fileType) ||
      (fileType.startsWith('image/') && config.acceptedFormats.includes('image/jpeg')) ||
      (fileExt === '.pdf' && config.acceptedFormats.includes('application/pdf')) ||
      (fileExt === '.docx' && config.acceptedFormats.includes('application/pdf'));

    if (!isValidFormat && config.acceptedFormats.length > 0) {
      setErrorMessage(`Invalid format. Accepted: ${config.acceptedFormats.join(', ')}`);
      return;
    }

    // Size validation
    const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File exceeds ${config.maxSizeMB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    // Simulate upload progress
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            const previewUrl = file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined;

            const newDoc: UploadedDoc = {
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              type: config.id,
              name: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              uploadedAt: new Date().toISOString(),
              previewUrl,
              status: 'verified',
            };

            onUploadSuccess(newDoc);
            setUploadProgress(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  };

  const handleDownload = () => {
    if (!uploadedDoc) return;
    if (uploadedDoc.previewUrl) {
      const a = document.createElement('a');
      a.href = uploadedDoc.previewUrl;
      a.download = uploadedDoc.name;
      a.click();
    } else {
      const blob = new Blob([`Document Content for ${uploadedDoc.name}`], {
        type: uploadedDoc.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedDoc.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-3 text-left transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-ink">{config.title}</h4>
            {config.required ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Required
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-surface-alt text-ink-soft">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{config.description}</p>
        </div>

        {uploadedDoc && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Uploaded</span>
          </span>
        )}
      </div>

      {/* Uploaded File Card */}
      {uploadedDoc ? (
        <div className="p-3.5 rounded-xl bg-surface-alt/60 border border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-ink truncate">{uploadedDoc.name}</h5>
              <div className="flex items-center gap-2 text-[11px] text-ink-soft">
                <span>{(uploadedDoc.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span>{new Date(uploadedDoc.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-surface text-ink-soft hover:text-primary transition cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(uploadedDoc.id)}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-ink-soft hover:text-rose-600 transition cursor-pointer"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-5 rounded-xl border-2 border-dashed text-center space-y-2 transition-all cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border/80 hover:border-primary/50 bg-surface-alt/30 hover:bg-surface-alt/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={config.acceptedFormats.join(',')}
            onChange={handleInputChange}
          />

          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <UploadCloud className="w-5 h-5" />
          </div>

          {uploadProgress !== null ? (
            <div className="space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between text-[11px] font-bold text-ink">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-ink">
                Drag & drop or <span className="text-primary hover:underline">browse files</span>
              </p>
              <p className="text-[11px] text-ink-soft">
                PDF, JPG, PNG up to {config.maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
