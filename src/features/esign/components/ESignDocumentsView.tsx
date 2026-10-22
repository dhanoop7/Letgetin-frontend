'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileSignature,
  Building2,
  Calendar,
  X,
  ShieldCheck,
  Check,
  Move,
  PenLine,
  RotateCcw,
  Sparkles,
  ArrowRight,
  User,
  Layers,
  UploadCloud,
  Printer,
} from 'lucide-react';
import { ESignDocumentItem, ESignDocumentStatus } from '../types/documents';
import { DEMO_ESIGN_DOCUMENTS } from '../data/mockESignData';
import { ESignService } from '../services/eSignService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'sonner';

interface SavedSignatureOption {
  id: string;
  dataUrl: string;
  type: 'drawn' | 'uploaded';
  signedBy: string;
  date: string;
  fileName?: string;
}

interface ESignDocumentsViewProps {
  onNavigateToConsent?: () => void;
  onNavigateToMyESign?: () => void;
}

export const ESignDocumentsView: React.FC<ESignDocumentsViewProps> = ({
  onNavigateToConsent,
  onNavigateToMyESign,
}) => {
  const { user } = useAuthStore();
  const candidateId = user?._id || user?.id || 'default_candidate';
  const candidateName = user?.fullName || user?.username || 'Authorized Candidate';

  const [documents, setDocuments] = useState<ESignDocumentItem[]>(DEMO_ESIGN_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>(DEMO_ESIGN_DOCUMENTS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Signature Selection & Placement State
  const [isSelectSignatureModalOpen, setIsSelectSignatureModalOpen] = useState(false);
  const [savedSignatures, setSavedSignatures] = useState<SavedSignatureOption[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>('');
  const [isLoadingSignatures, setIsLoadingSignatures] = useState(false);

  // Placement Mode State
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [placingSignature, setPlacingSignature] = useState<SavedSignatureOption | null>(null);
  const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number }>({ x: 55, y: 72 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const documentViewerRef = useRef<HTMLDivElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  // Map of placed signatures per document ID
  const [documentSignatures, setDocumentSignatures] = useState<
    Record<string, { dataUrl: string; signedBy: string; signedAt: string; position: { x: number; y: number } }>
  >({});

  // Status Counts
  const totalCount = documents.length;
  const pendingCount = documents.filter((d) => d.status === 'PENDING_SIGNATURE').length;
  const signedCount = documents.filter((d) => d.status === 'SIGNED').length;
  const awaitingCount = documents.filter((d) => d.status === 'AWAITING_VERIFICATION').length;
  const expiredCount = documents.filter((d) => d.status === 'EXPIRED').length;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.requestedBy.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  // Ensure a valid selected document
  const selectedDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || filteredDocs[0] || documents[0] || null;
  }, [documents, selectedDocId, filteredDocs]);

  // Load saved signatures from ESignService / profile
  const fetchSignatures = async () => {
    setIsLoadingSignatures(true);
    try {
      const consent = await ESignService.getConsentStatus(candidateId);
      const list: SavedSignatureOption[] = [];

      if (consent && consent.signatureDataUrl) {
        list.push({
          id: 'sig-active',
          dataUrl: consent.signatureDataUrl,
          type: (consent.signatureType as 'drawn' | 'uploaded') || 'drawn',
          signedBy: consent.signedBy || candidateName,
          date: consent.signedAt ? new Date(consent.signedAt).toLocaleDateString() : 'Active Profile Signature',
          fileName: consent.signatureFileName,
        });
      }

      // Default mock signature fallback if user hasn't created one yet
      if (list.length === 0) {
        // Fallback default sample signature for testing
        list.push({
          id: 'sig-sample-default',
          dataUrl:
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M 20 45 Q 40 15 70 30 T 130 35 T 180 25 T 205 40" fill="none" stroke="%230066cc" stroke-width="3" stroke-linecap="round"/><text x="25" y="62" font-family="cursive" font-size="16" fill="%23004499">' +
            encodeURIComponent(candidateName) +
            '</text></svg>',
          type: 'drawn',
          signedBy: candidateName,
          date: 'Default Digital Signature',
        });
      }

      setSavedSignatures(list);
      if (list.length > 0) {
        setSelectedSignatureId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load saved signatures:', err);
    } finally {
      setIsLoadingSignatures(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, [candidateId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit.');
      return;
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const newDocId = `doc-upload-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newDocItem: ESignDocumentItem = {
      id: newDocId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Uploaded Document',
      requestedBy: {
        name: candidateName,
        company: selectedDoc?.requestedBy.company || 'LetGetIn Compliance',
      },
      fileSize: formatFileSize(file.size),
      fileFormat: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      status: 'PENDING_SIGNATURE',
      dateUploaded: today,
      lastUpdated: today,
      description: `Candidate uploaded verification file: ${file.name}.`,
      requiresAction: true,
      pagesCount: 1,
    };

    setDocuments((prev) => [newDocItem, ...prev]);
    setSelectedDocId(newDocId);

    toast.success('Document uploaded successfully', {
      description: `"${file.name}" has been added to your E-Sign documents workspace.`,
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handlePrintDocument = (doc: ESignDocumentItem) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const isSigned = doc.status === 'SIGNED' || !!documentSignatures[doc.id];
    const signatureImg = documentSignatures[doc.id]?.dataUrl || savedSignatures[0]?.dataUrl || '';
    const signerName = documentSignatures[doc.id]?.signedBy || candidateName;
    const signedDate = documentSignatures[doc.id]?.signedAt || doc.dateSigned || new Date().toLocaleDateString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - ${doc.requestedBy.company}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Times New Roman', serif; color: #111827; line-height: 1.6; font-size: 12pt; padding: 20px; }
            .header { border-bottom: 2px solid #0066cc; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .company { font-size: 16pt; font-weight: bold; color: #0066cc; text-transform: uppercase; }
            .doc-ref { font-size: 9pt; color: #6b7280; text-align: right; }
            .title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 24px 0 16px; }
            .clause { margin-bottom: 14px; text-align: justify; font-size: 11pt; }
            .clause strong { font-family: Arial, sans-serif; }
            .sig-section { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .sig-box { border: 1px solid #d1d5db; padding: 14px; border-radius: 8px; }
            .sig-label { font-size: 9pt; font-weight: bold; color: #4b5563; text-transform: uppercase; margin-bottom: 8px; }
            .sig-img { max-height: 50px; display: block; margin: 8px 0; }
            .verified { color: #059669; font-size: 9pt; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${doc.requestedBy.company}</div>
              <div style="font-size: 10pt; color: #4b5563;">Human Capital & Legal Operations Division</div>
            </div>
            <div class="doc-ref">
              <div>DOC ID: ${doc.id.toUpperCase()}</div>
              <div>STATUS: ${doc.status}</div>
              <div>DATE: ${new Date(doc.dateUploaded).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="title">${doc.title}</div>
          <p style="text-align: center; font-size: 10pt; font-style: italic; color: #4b5563; margin-bottom: 24px;">
            Executed under statutory compliance & global e-signature governance
          </p>

          <div class="clause">
            <strong>1. PURPOSE & SCOPE OF AGREEMENT:</strong> This binding contract is entered between <strong>${doc.requestedBy.company}</strong> and candidate <strong>${signerName}</strong>. The candidate acknowledges and confirms all qualifications, representations, and statutory declarations submitted throughout the evaluation and hiring workflow.
          </div>

          <div class="clause">
            <strong>2. CONFIDENTIALITY & PROPRIETARY RIGHTS:</strong> All proprietary architectures, intellectual property, source repositories, algorithmic assets, and business operations disclosed hereunder shall remain strictly confidential and protected in accordance with international digital rights and security standards.
          </div>

          <div class="clause">
            <strong>3. VERIFICATION OF CREDENTIALS:</strong> The candidate explicitly grants permission to <strong>LetGetIn</strong> and designated audit agencies to verify identity credentials, educational degrees, and professional track records.
          </div>

          <div class="clause">
            <strong>4. ELECTRONIC EXECUTION:</strong> Both parties agree that electronic signatures applied through this platform constitute legally binding endorsements under the Electronic Signatures in Global and National Commerce (E-SIGN) framework.
          </div>

          <div class="sig-section">
            <div class="sig-box">
              <div class="sig-label">Authorized Company Signatory</div>
              <div style="font-family: 'Brush Script MT', cursive; font-size: 16pt; color: #0066cc; margin: 12px 0;">${doc.requestedBy.name}</div>
              <div style="font-size: 9pt; color: #4b5563;">${doc.requestedBy.company} • Verified Official</div>
            </div>

            <div class="sig-box">
              <div class="sig-label">Candidate Signature & Seal</div>
              ${
                isSigned && signatureImg
                  ? `<img src="${signatureImg}" class="sig-img" alt="Candidate Signature" />
                     <div class="verified">✓ Digitally signed by ${signerName} (${signedDate})</div>`
                  : `<div style="height: 40px; border-bottom: 1px dashed #9ca3af; margin: 10px 0;"></div>
                     <div style="font-size: 9pt; color: #6b7280;">Pending Electronic Signature</div>`
              }
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownload = (doc: ESignDocumentItem) => {
    const blob = new Blob([`Official electronic copy of ${doc.title} for ${doc.requestedBy.company}. Signed securely under LetGetIn E-Sign verification.`], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded', {
      description: `${doc.title} (.pdf) has been downloaded.`,
    });
  };

  const handleOpenSignSelectModal = () => {
    if (!selectedDoc) return;
    if (selectedDoc.status !== 'PENDING_SIGNATURE') {
      toast.info('This document is not eligible for signing.');
      return;
    }
    fetchSignatures();
    setIsSelectSignatureModalOpen(true);
  };

  const handleConfirmSignatureSelection = () => {
    const chosen = savedSignatures.find((s) => s.id === selectedSignatureId);
    if (!chosen) {
      toast.error('Please select a signature to proceed.');
      return;
    }

    setPlacingSignature(chosen);
    setIsPlacementMode(true);
    setSignaturePosition({ x: 55, y: 72 });
    setIsSelectSignatureModalOpen(false);

    toast.info('Signature selected for placement', {
      description: 'Drag the signature to your preferred position on the document and click "Confirm Placement".',
    });
  };

  const handleCancelPlacement = () => {
    setIsPlacementMode(false);
    setPlacingSignature(null);
  };

  const handleConfirmPlacement = () => {
    if (!selectedDoc || !placingSignature) return;

    const now = new Date().toISOString().split('T')[0];

    // Record placed signature
    setDocumentSignatures((prev) => ({
      ...prev,
      [selectedDoc.id]: {
        dataUrl: placingSignature.dataUrl,
        signedBy: placingSignature.signedBy,
        signedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        position: signaturePosition,
      },
    }));

    // Update document status to SIGNED
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === selectedDoc.id
          ? {
              ...d,
              status: 'SIGNED',
              dateSigned: now,
              lastUpdated: now,
              requiresAction: false,
            }
          : d
      )
    );

    setIsPlacementMode(false);
    setPlacingSignature(null);

    toast.success('Document Signed Successfully!', {
      description: `You have placed your electronic signature and signed "${selectedDoc.title}".`,
    });
  };

  // Dragging handlers for signature overlay on document
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlacementMode) return;
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (documentViewerRef.current) {
      const rect = documentViewerRef.current.getBoundingClientRect();
      const currentX = (signaturePosition.x / 100) * rect.width;
      const currentY = (signaturePosition.y / 100) * rect.height;
      setDragOffset({
        x: clientX - (rect.left + currentX),
        y: clientY - (rect.top + currentY),
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !isPlacementMode || !documentViewerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = documentViewerRef.current.getBoundingClientRect();

    let newX = ((clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let newY = ((clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Constrain within document bounds
    newX = Math.max(5, Math.min(newX, 75));
    newY = Math.max(10, Math.min(newY, 88));

    setSignaturePosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getStatusBadge = (status: ESignDocumentStatus) => {
    switch (status) {
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Signed</span>
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Pending Signature</span>
          </span>
        );
      case 'AWAITING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Awaiting Verification</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Expired</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Top Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-xl font-black text-ink uppercase tracking-tight">
              My E-Sign Documents
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {pendingCount} Action Required
            </span>
          </div>
          <p className="text-xs text-ink-soft">
            Manage, review, digitally sign, and download your contracts, NDAs, and compliance files.
          </p>
        </div>

        {onNavigateToConsent && (
          <button
            type="button"
            onClick={onNavigateToConsent}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer self-start sm:self-auto"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Consent & Authorization Suite</span>
          </button>
        )}
      </div>

      {/* 2. Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Total Documents</span>
          <p className="text-xl sm:text-2xl font-black text-ink">{totalCount}</p>
          <p className="text-[11px] text-ink-soft">Across all employers</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Signature</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-ink-soft">Action required</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Signed & Active</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{signedCount}</p>
          <p className="text-[11px] text-ink-soft">Encrypted with timestamp</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">In Verification</span>
          <p className="text-xl sm:text-2xl font-black text-primary">{awaitingCount + expiredCount}</p>
          <p className="text-[11px] text-ink-soft">{awaitingCount} screening • {expiredCount} expired</p>
        </div>
      </div>

      {/* 3. TWO-PANEL E-SIGN DOCUMENT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT PANEL: DOCUMENT LIST (35-40% desktop) */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-border/70">
            {['ALL', 'PENDING_SIGNATURE', 'SIGNED', 'AWAITING_VERIFICATION'].map((st) => {
              const label =
                st === 'ALL'
                  ? 'All'
                  : st === 'PENDING_SIGNATURE'
                  ? 'Pending'
                  : st === 'SIGNED'
                  ? 'Signed'
                  : 'Verify';
              const isActive = statusFilter === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Document Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-soft space-y-2 border border-dashed border-border rounded-2xl p-4">
                <FileText className="w-8 h-8 text-ink-soft/40 mx-auto" />
                <p>No documents match your filter.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsPlacementMode(false);
                      setPlacingSignature(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-elegant ring-1 ring-primary/30'
                        : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-alt/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            doc.status === 'PENDING_SIGNATURE'
                              ? 'bg-amber-500/10 text-amber-600'
                              : doc.status === 'SIGNED'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-alt text-ink-soft border border-border truncate">
                          {doc.category}
                        </span>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {doc.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-ink-soft font-medium pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-ink truncate">
                        <Building2 className="w-3 h-3 text-primary shrink-0" />
                        {doc.requestedBy.company}
                      </span>
                      <span className="shrink-0 text-[10px]">
                        {new Date(doc.dateUploaded).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: DOCUMENT VIEWER & SIGN SELECT (60-65% desktop) */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 flex flex-col min-h-[640px]">
          {selectedDoc ? (
            <>
              {/* Document Header in Viewer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {selectedDoc.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-ink truncate">
                      {selectedDoc.title}
                    </h3>
                    {getStatusBadge(selectedDoc.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft font-medium pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-ink">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      {selectedDoc.requestedBy.company}
                    </span>
                    <span>•</span>
                    <span>{selectedDoc.fileSize} ({selectedDoc.pagesCount} pages)</span>
                    <span>•</span>
                    <span>Uploaded {new Date(selectedDoc.dateUploaded).toLocaleDateString()}</span>
                    {selectedDoc.expiresAt && selectedDoc.status === 'PENDING_SIGNATURE' && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-semibold">
                          Expires {new Date(selectedDoc.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                  {/* Hidden file input for Upload */}
                  <input
                    ref={uploadFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* 1. Upload Button */}
                  <button
                    type="button"
                    onClick={() => uploadFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
                    title="Upload Document"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                    <span>Upload</span>
                  </button>

                  {/* 2. Print Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintDocument(selectedDoc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
                    title="Print Selected Document"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    <span>Print</span>
                  </button>

                  {/* 3. Download PDF Button */}
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedDoc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
                    title="Download Official Document PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Placement Mode Notification Banner */}
              {isPlacementMode && (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in text-xs">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Move className="w-4 h-4 animate-bounce shrink-0" />
                    <span>Position your signature by dragging it to the desired spot on the document.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleCancelPlacement}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-ink hover:bg-surface-alt transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPlacement}
                      className="px-4 py-1.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Placement</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Document Canvas / Paper Preview Area */}
              <div
                ref={documentViewerRef}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="relative bg-slate-50 dark:bg-slate-900/60 border border-border/80 rounded-2xl p-6 sm:p-8 max-h-[460px] overflow-y-auto font-serif text-ink text-xs leading-relaxed shadow-inner space-y-6 select-none"
              >
                {/* Official Paper Top Header */}
                <div className="border-b-2 border-border/80 pb-4 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="font-sans font-black text-sm uppercase tracking-widest text-primary">
                      {selectedDoc.requestedBy.company.toUpperCase()}
                    </div>
                    <div className="text-[11px] font-sans text-ink-soft">
                      Human Capital & Legal Operations Division
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-ink-soft">
                    <div>DOC REF: {selectedDoc.id.toUpperCase()}</div>
                    <div>STATUS: {selectedDoc.status}</div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-1 py-2">
                  <h2 className="font-sans font-black text-sm sm:text-base text-ink tracking-tight uppercase">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-[11px] italic text-ink-soft font-sans">
                    Executed under statutory compliance & global e-signature governance
                  </p>
                </div>

                {/* Document Paragraphs */}
                <div className="space-y-3 font-sans text-[11.5px] text-ink/90 leading-normal">
                  <p>
                    <strong>1. PURPOSE & SCOPE OF AGREEMENT:</strong> This binding contract is entered between{' '}
                    <strong>{selectedDoc.requestedBy.company}</strong> and candidate <strong>{candidateName}</strong>.
                    The candidate acknowledges and confirms all qualifications, representations, and statutory
                    declarations submitted throughout the evaluation and hiring workflow.
                  </p>

                  <p>
                    <strong>2. CONFIDENTIALITY & PROPRIETARY RIGHTS:</strong> All proprietary architectures,
                    intellectual property, source repositories, algorithmic assets, and business operations disclosed
                    hereunder shall remain strictly confidential and protected in accordance with international digital
                    rights and security standards.
                  </p>

                  <p>
                    <strong>3. VERIFICATION OF CREDENTIALS:</strong> The candidate explicitly grants permission to{' '}
                    <strong>LetGetIn</strong> and designated audit agencies to verify identity credentials, educational
                    degrees, and professional track records.
                  </p>

                  <p>
                    <strong>4. ELECTRONIC EXECUTION:</strong> Both parties agree that electronic signatures applied
                    through this platform constitute legally binding endorsements under the Electronic Signatures in
                    Global and National Commerce (E-SIGN) framework.
                  </p>
                </div>

                {/* Document Signature Zone */}
                <div className="pt-6 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                  {/* Employer Signatory */}
                  <div className="space-y-2 p-3 rounded-xl bg-surface/50 border border-border/60">
                    <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                      Authorized Company Signatory
                    </span>
                    <div className="h-14 border-b border-border flex items-end pb-1 font-serif italic text-primary font-bold text-sm">
                      {selectedDoc.requestedBy.name}
                    </div>
                    <div className="text-[10.5px] text-ink-soft">
                      {selectedDoc.requestedBy.company} • Verified Official
                    </div>
                  </div>

                  {/* Candidate Signatory Area */}
                  <div className="space-y-2 p-3 rounded-xl bg-surface/50 border border-border/60 relative min-h-[90px]">
                    <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                      Candidate Signature & Seal
                    </span>

                    {/* Show already placed signature */}
                    {(selectedDoc.status === 'SIGNED' || documentSignatures[selectedDoc.id]) ? (
                      <div className="space-y-1">
                        <div className="h-12 flex items-center">
                          <img
                            src={
                              documentSignatures[selectedDoc.id]?.dataUrl ||
                              savedSignatures[0]?.dataUrl
                            }
                            alt="Candidate Signature"
                            className="max-h-10 object-contain filter contrast-125"
                          />
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 border-t border-emerald-500/20 pt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>
                            Digitally signed by {candidateName} (
                            {documentSignatures[selectedDoc.id]?.signedAt ||
                              selectedDoc.dateSigned ||
                              'Verified'}
                            )
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 border-b border-dashed border-border flex items-center justify-center text-[11px] text-ink-soft/60">
                        {isPlacementMode ? (
                          <span className="text-primary font-semibold animate-pulse">
                            Drop signature here
                          </span>
                        ) : (
                          <span>Click "Sign & Select" below to sign</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* DRAGGABLE SIGNATURE OVERLAY (Active during Placement Mode) */}
                {isPlacementMode && placingSignature && (
                  <div
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    style={{
                      position: 'absolute',
                      left: `${signaturePosition.x}%`,
                      top: `${signaturePosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 30,
                    }}
                    className={`cursor-grab active:cursor-grabbing p-2.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-dashed border-primary shadow-2xl backdrop-blur-xs flex flex-col items-center gap-1 select-none transition-shadow ${
                      isDragging ? 'scale-105 shadow-glow ring-2 ring-primary/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                      <Move className="w-3 h-3" /> Drag to position
                    </div>
                    <img
                      src={placingSignature.dataUrl}
                      alt="Signature Overlay"
                      className="max-h-12 max-w-[140px] object-contain pointer-events-none"
                    />
                    <div className="text-[9px] font-mono text-ink-soft border-t border-border/60 pt-0.5">
                      {placingSignature.signedBy}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Area: SIGN & SELECT BUTTON (Aligned Bottom-Right) */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <div className="text-xs text-ink-soft">
                  {selectedDoc.status === 'PENDING_SIGNATURE' ? (
                    <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> Action required: Signature needed to complete compliance.
                    </span>
                  ) : selectedDoc.status === 'SIGNED' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> This document has been officially signed and recorded.
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Document is currently undergoing background verification.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end">
                  {selectedDoc.status === 'PENDING_SIGNATURE' && !isPlacementMode && (
                    <button
                      type="button"
                      onClick={handleOpenSignSelectModal}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileSignature className="w-4 h-4" />
                      <span>Sign & Select</span>
                    </button>
                  )}

                  {selectedDoc.status === 'SIGNED' && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Signature Completed
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-ink-soft space-y-3">
              <FileText className="w-12 h-12 text-ink-soft/40" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-ink">No document selected</h4>
                <p className="text-xs">Please select a document from the left list to view and sign.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. SIGNATURE SELECTION MODAL */}
      {/* ============================================================ */}
      {isSelectSignatureModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PenLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Select Signature</h3>
                  <p className="text-xs text-ink-soft">
                    Choose a signature to place on this document.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectSignatureModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Signature Options */}
            <div className="space-y-3">
              {isLoadingSignatures ? (
                <div className="py-8 text-center text-xs text-ink-soft space-y-2">
                  <Clock className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p>Loading your saved signatures...</p>
                </div>
              ) : savedSignatures.length === 0 ? (
                <div className="py-8 text-center space-y-3 p-4 rounded-2xl bg-surface-alt/40 border border-border">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-ink">No saved signature found</h4>
                    <p className="text-[11px] text-ink-soft">
                      Please add your signature in My E-Sign before signing a document.
                    </p>
                  </div>
                  {onNavigateToMyESign && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectSignatureModalOpen(false);
                        onNavigateToMyESign();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Go to My E-Sign</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {savedSignatures.map((sig) => {
                    const isSelected = selectedSignatureId === sig.id;

                    return (
                      <div
                        key={sig.id}
                        onClick={() => setSelectedSignatureId(sig.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40'
                            : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-alt/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedSignatureId(sig.id)}
                            className="h-4 w-4 text-primary focus:ring-primary/20 border-border cursor-pointer"
                          />
                          <div className="p-2 rounded-xl bg-surface border border-border flex items-center justify-center max-w-[120px] max-h-12 overflow-hidden">
                            <img
                              src={sig.dataUrl}
                              alt="Signature Preview"
                              className="max-h-8 object-contain filter contrast-125"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-ink truncate">{sig.signedBy}</h5>
                            <span className="text-[10px] text-ink-soft">
                              {sig.type === 'uploaded' ? 'Uploaded Image' : 'Digitally Drawn'} • {sig.date}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsSelectSignatureModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSignatureSelection}
                disabled={!selectedSignatureId || savedSignatures.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Place Signature</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
