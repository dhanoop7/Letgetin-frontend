"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CreditCard, ArrowRight, X, ShieldAlert, Sparkles } from "lucide-react";

export interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  requiredCredits: number;
  availableBalance: number;
  onProceedToPayment?: () => void;
  paymentUrl?: string;
  returnUrl?: string;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  serviceName = "Premium Service",
  requiredCredits,
  availableBalance,
  onProceedToPayment,
  paymentUrl,
  returnUrl,
}: InsufficientCreditsModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const shortfall = Math.max(0, requiredCredits - availableBalance);

  const handleProceed = () => {
    onClose();
    if (onProceedToPayment) {
      onProceedToPayment();
      return;
    }

    const currentPath = returnUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    const targetUrl =
      paymentUrl ||
      `/payment?required=${requiredCredits}&available=${availableBalance}&shortfall=${shortfall}&item=${encodeURIComponent(
        serviceName
      )}&credits=${shortfall}&amount=${shortfall * 10}&returnUrl=${encodeURIComponent(currentPath)}`;

    router.push(targetUrl);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="insufficient-credits-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="space-y-2 text-center pt-1">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 id="insufficient-credits-title" className="text-xl font-black text-ink tracking-tight">
            Insufficient Credits
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed px-2">
            This service requires <strong className="text-ink font-bold">{requiredCredits} credits</strong>, but your available
            balance is <strong className="text-ink font-bold">{availableBalance} credits</strong>.
          </p>
        </div>

        {/* Dynamic Detail Card */}
        <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Requested Feature:</span>
            <strong className="text-ink truncate max-w-[200px]">{serviceName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Required Credits:</span>
            <span className="text-ink font-bold">{requiredCredits} Credits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Your Current Balance:</span>
            <span className="text-ink font-bold">{availableBalance} Credits</span>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-black">
            <span className="text-amber-700 dark:text-amber-400">Shortfall to Continue:</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">+{shortfall} Credits</span>
          </div>
        </div>

        {/* Explanation notice */}
        <p className="text-[11.5px] text-ink-soft text-center leading-normal">
          Purchase additional credits to use this premium feature.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
