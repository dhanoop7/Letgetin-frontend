import React from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { DriveFile } from "../services/driveService";

interface DriveFileDeleteModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DriveFileDeleteModal: React.FC<DriveFileDeleteModalProps> = ({
  file,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-ink text-sm">Delete File</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-lg transition disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-ink-soft leading-relaxed">
            Are you sure you want to delete this file from your drive? This action cannot be undone.
          </p>

          <div className="p-3 bg-surface-alt/70 rounded-xl border border-border/70 text-xs font-semibold text-ink truncate flex items-center gap-2">
            <span className="text-ink-soft font-normal shrink-0">File:</span>
            <span className="truncate">{file.originalName}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 font-bold text-xs text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
