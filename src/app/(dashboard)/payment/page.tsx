"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  ShieldAlert,
  ArrowLeft,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemParam = searchParams.get("item");
  const packParam = searchParams.get("pack");
  const creditsParam = searchParams.get("credits");
  const amountParam = searchParams.get("amount");
  const requiredParam = searchParams.get("required");
  const availableParam = searchParams.get("available");
  const shortfallParam = searchParams.get("shortfall");
  const returnUrlParam = searchParams.get("returnUrl");
  const billingCycleParam = searchParams.get("billingCycle");

  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : "/profile/identity?tab=payments";

  const credits = creditsParam
    ? parseInt(creditsParam, 10)
    : shortfallParam
    ? parseInt(shortfallParam, 10)
    : 50;

  const amountInr = amountParam
    ? parseInt(amountParam, 10)
    : credits * 10;

  const itemName =
    itemParam
      ? decodeURIComponent(itemParam)
      : packParam
      ? `${packParam.charAt(0).toUpperCase() + packParam.slice(1)} Credit Pack`
      : `${credits} Credits Top-Up`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(returnUrl)}
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-ink transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Previous Page</span>
        </button>
        <span className="text-[11px] font-semibold text-ink-soft bg-surface-alt px-3 py-1 rounded-full border border-border">
          Checkout & Payment Review
        </span>
      </div>

      {/* Main Payment Container */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center mx-auto mb-3 border border-primary/20 shadow-xs">
            <CreditCard className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Order Review & Payment
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft">
            Review your selected credit package and payment processing status.
          </p>
        </div>

        {/* Selected Package Details */}
        <div className="p-6 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Item Details</span>
            <span className="text-xs font-bold text-primary-glow">1 Credit = ₹10 INR</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Selected Item:</span>
              <strong className="text-ink text-sm font-bold">{itemName}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Credit Allocation:</span>
              <strong className="text-primary-glow font-bold text-sm">+{credits.toLocaleString()} Credits</strong>
            </div>

            {billingCycleParam && (
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Billing Cycle:</span>
                <span className="font-semibold text-ink capitalize">{billingCycleParam.replace("_", " ")}</span>
              </div>
            )}

            {requiredParam && availableParam && (
              <div className="pt-2 border-t border-border/60 space-y-1.5 text-[11.5px] text-ink-soft">
                <div className="flex justify-between">
                  <span>Feature Requirement:</span>
                  <span className="font-semibold text-ink">{requiredParam} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Available Balance:</span>
                  <span className="font-semibold text-ink">{availableParam} Credits</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border flex items-center justify-between text-base font-black text-ink">
              <span>Total Payable Amount:</span>
              <span className="text-emerald-600 text-lg">₹{amountInr.toLocaleString()} INR</span>
            </div>
          </div>
        </div>

        {/* Prominent Payment Inactive Warning */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Credit Purchasing & Online Payments Currently Inactive
              </h3>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-400/90 font-medium mt-0.5">
                Online payment functionality is temporarily inactive while gateway certifications are completed.
              </p>
            </div>
          </div>

          <div className="text-xs text-ink-soft leading-relaxed pl-12 space-y-2">
            <p>
              Direct wallet top-ups, instant credit card charges, and UPI checkouts are not available at this time.
              Credits will not be credited to your account and no money has been deducted from your bank.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Full self-service payment gateway activation will be announced shortly.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Disabled Payment Action */}
          <button
            type="button"
            disabled={true}
            className="w-full py-3.5 px-6 rounded-2xl bg-surface-alt border border-border text-ink-soft/60 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-75 shadow-none"
          >
            <Lock className="w-4 h-4" />
            <span>Pay ₹{amountInr.toLocaleString()} (Payment Gateway Inactive)</span>
          </button>

          {/* Return & Cancel Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.push(returnUrl)}
              className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer text-center"
            >
              Cancel & Return
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/identity?tab=payments")}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink hover:border-primary-glow/50 transition cursor-pointer text-center"
            >
              View Payments & Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 text-center text-xs text-ink-soft">
          Loading payment review...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
