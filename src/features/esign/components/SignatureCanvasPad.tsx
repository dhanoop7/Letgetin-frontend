'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  PenLine,
  RotateCcw,
  Calendar,
  User,
  Check,
  UploadCloud,
  FileImage,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ESignService } from '../services/eSignService';
import { SignatureType } from '../types';

interface SignatureCanvasPadProps {
  fullName: string;
  onFullNameChange: (name: string) => void;
  signatureDataUrl: string;
  signatureType: SignatureType;
  signatureFileName?: string;
  signatureFileSize?: number;
  onSignatureChange: (
    dataUrl: string,
    type: SignatureType,
    fileInfo?: { name: string; size: number }
  ) => void;
  disabled?: boolean;
}

export const SignatureCanvasPad: React.FC<SignatureCanvasPadProps> = ({
  fullName,
  onFullNameChange,
  signatureDataUrl,
  signatureType,
  signatureFileName,
  signatureFileSize,
  onSignatureChange,
  disabled = false,
}) => {
  const [activeMethod, setActiveMethod] = useState<'draw' | 'upload'>(
    signatureType === 'uploaded' ? 'upload' : 'draw'
  );

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(
    signatureType === 'drawn' && !!signatureDataUrl
  );

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidatingUpload, setIsValidatingUpload] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Setup canvas high-DPI scaling
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0066cc'; // professional blue accent
      ctx.lineWidth = 2.5;
    }
  }, []);

  useEffect(() => {
    if (activeMethod === 'draw') {
      setupCanvas();
    }

    const handleResize = () => {
      if (activeMethod === 'draw' && !signatureDataUrl) {
        setupCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas, signatureDataUrl, activeMethod]);

  // Method switcher with conflict-free state clearing
  const handleMethodSwitch = (method: 'draw' | 'upload') => {
    if (disabled || method === activeMethod) return;

    setActiveMethod(method);
    setUploadError(null);

    if (method === 'draw') {
      // Switching to Draw: clear any uploaded image
      onSignatureChange('', 'drawn');
      setHasDrawn(false);
      setTimeout(() => {
        setupCanvas();
      }, 50);
    } else {
      // Switching to Upload: clear canvas drawing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasDrawn(false);
      onSignatureChange('', 'uploaded');
    }
  };

  // Canvas Drawing Handlers
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (disabled) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || disabled) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureChange(dataUrl, 'drawn');
      } catch (err) {
        console.warn('Canvas export failed:', err);
      }
    }
  };

  const handleClearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onSignatureChange('', 'drawn');
  };

  // Upload Handlers
  const processSignatureFile = async (file: File) => {
    setUploadError(null);
    setIsValidatingUpload(true);

    try {
      const validation = await ESignService.validateSignatureImage(file);
      if (!validation.isValid) {
        setUploadError(
          validation.error || 'Please upload a PNG, JPG, or JPEG signature image.'
        );
        onSignatureChange('', 'uploaded');
        return;
      }

      const dataUrl = await ESignService.fileToDataUrl(file);
      onSignatureChange(dataUrl, 'uploaded', {
        name: file.name,
        size: file.size,
      });
      setUploadError(null);
    } catch {
      setUploadError('Failed to process the signature image.');
      onSignatureChange('', 'uploaded');
    } finally {
      setIsValidatingUpload(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSignatureFile(e.target.files[0]);
    }
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
      processSignatureFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveUploaded = () => {
    onSignatureChange('', 'uploaded');
    setUploadError(null);
  };

  const hasValidSignature = !!signatureDataUrl && signatureDataUrl.trim().length > 0;

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <PenLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Electronic Signature
            </h3>
            <p className="text-xs text-ink-soft">
              Provide your active digital signature and confirm your identity.
            </p>
          </div>
        </div>
        {hasValidSignature ? (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" /> Signature Provided
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Action Required
          </span>
        )}
      </div>

      {/* Name and Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Legal Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary-glow" />
            Full Legal Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Johnathan Doe"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-alt/70 border border-border text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary-glow/40 focus:border-primary-glow transition-all"
          />
        </div>

        {/* Date Auto-populated */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-glow" />
            Date (Auto-populated)
          </label>
          <div className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-alt/40 border border-border text-xs font-medium text-ink-soft flex items-center justify-between">
            <span>{currentDate}</span>
            <span className="text-[10px] text-primary-glow bg-primary/10 px-2 py-0.5 rounded-md font-mono">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Signature Method Selector Tabs */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">
            Signature Method
          </span>
          <span className="text-[11px] text-ink-soft">
            Choose either method
          </span>
        </div>

        <div className="inline-flex p-1 rounded-2xl bg-surface-alt border border-border gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleMethodSwitch('draw')}
            disabled={disabled}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMethod === 'draw'
                ? 'bg-gradient-brand text-primary-foreground shadow-glow'
                : 'text-ink-soft hover:text-ink hover:bg-surface'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSwitch('upload')}
            disabled={disabled}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMethod === 'upload'
                ? 'bg-gradient-brand text-primary-foreground shadow-glow'
                : 'text-ink-soft hover:text-ink hover:bg-surface'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Signature</span>
          </button>
        </div>
      </div>

      {/* METHOD 1: DRAW SIGNATURE */}
      {activeMethod === 'draw' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">
              Draw Signature <span className="text-rose-500">*</span>
            </span>
            <button
              type="button"
              onClick={handleClearDrawing}
              disabled={disabled || (!hasDrawn && !signatureDataUrl)}
              className="px-2.5 py-1 rounded-xl border border-border text-xs font-medium text-ink-soft hover:text-ink hover:bg-surface-alt transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Signature
            </button>
          </div>

          <div
            className={`relative border-2 rounded-2xl bg-surface-alt/20 transition-all overflow-hidden ${
              hasDrawn || signatureDataUrl
                ? 'border-emerald-500/40 shadow-xs'
                : 'border-dashed border-border hover:border-primary-glow/60'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 sm:h-40 cursor-crosshair touch-none block"
              style={{ width: '100%', height: '150px' }}
            />

            {!hasDrawn && !signatureDataUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-ink-soft/60 space-y-1">
                <PenLine className="w-5 h-5 text-ink-soft/40" />
                <p className="text-xs font-medium">
                  Sign here with mouse, trackpad, or finger
                </p>
                <div className="w-3/4 border-b border-border/70 mt-2" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* METHOD 2: UPLOAD SIGNATURE */}
      {activeMethod === 'upload' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">
              Upload Signature <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] text-ink-soft">
              PNG, JPG, JPEG • Max 5 MB
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled}
          />

          {!signatureDataUrl || signatureType !== 'uploaded' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragOver
                  ? 'border-primary-glow bg-primary/5 scale-[1.005]'
                  : 'border-border/80 hover:border-primary-glow/60 hover:bg-surface-alt/60 bg-surface-alt/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-0.5 max-w-sm">
                <h4 className="text-xs sm:text-sm font-bold text-ink">
                  Upload your signature image
                </h4>
                <p className="text-[11px] text-ink-soft">
                  PNG, JPG or JPEG • Max 5 MB
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) fileInputRef.current?.click();
                }}
                disabled={disabled}
                className="mt-1 px-4 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all cursor-pointer"
              >
                Choose File
              </button>

              <p className="text-[10.5px] text-ink-soft/70">
                or drag and drop your image
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
              {/* Small Preview Box preserving aspect ratio */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                  Uploaded Signature Preview
                </span>
                <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-center max-h-36 overflow-hidden">
                  <img
                    src={signatureDataUrl}
                    alt="Uploaded Electronic Signature"
                    className="max-h-28 max-w-full object-contain filter contrast-125"
                  />
                </div>
              </div>

              {/* File Info Bar */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-emerald-500/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink truncate">
                        {signatureFileName || 'signature.png'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    {signatureFileSize ? (
                      <div className="text-[11px] text-ink-soft">
                        {formatFileSize(signatureFileSize)} • Signature Image
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    disabled={disabled}
                    className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink hover:bg-surface transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Replace Signature"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-ink-soft" />
                    <span className="hidden sm:inline">Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveUploaded}
                    disabled={disabled}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Remove Signature"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isValidatingUpload && (
            <div className="text-xs text-primary-glow flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Validating signature image...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
