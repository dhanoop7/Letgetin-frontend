"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, X, Zap, Shield, ArrowRight } from "lucide-react";

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
  currentPlanId?: string;
}

interface PlanTier {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceSixMonths: number;
  priceAnnual: number;
  description: string;
  creditsPerMonth: number;
  features: string[];
  popular?: boolean;
}

const TIERS: PlanTier[] = [
  {
    id: "job_posting",
    name: "Job Posting",
    priceMonthly: 500,
    priceSixMonths: 2500,
    priceAnnual: 5000,
    description: "Ideal for teams posting roles regularly with candidate shortlisting.",
    creditsPerMonth: 50,
    features: [
      "Active job postings included",
      "50 credits included per month",
      "Standard candidate resume shortlisting",
      "Direct applicant messaging & tracking",
    ],
  },
  {
    id: "hrms",
    name: "HRMS",
    priceMonthly: 1500,
    priceSixMonths: 7500,
    priceAnnual: 15000,
    description: "Complete employee onboarding, payroll, and workforce operations.",
    creditsPerMonth: 150,
    features: [
      "Full employee management & records",
      "150 credits included per month",
      "Payroll & statutory compliance automation",
      "Leave, attendance, and probation tracking",
    ],
  },
  {
    id: "recruitment_suite",
    name: "Recruitment Suite",
    badge: "Most Popular",
    priceMonthly: 2500,
    priceSixMonths: 12500,
    priceAnnual: 25000,
    popular: true,
    description: "Autonomous AI sourcing, multi-round screening, and proctored testing.",
    creditsPerMonth: 250,
    features: [
      "AI resume shortlisting & auto-ranking",
      "250 credits included per month",
      "Multi-round online tests & domain evaluations",
      "AI video interviews & candidate scoring",
    ],
  },
];

export function UpgradePlanModal({
  open,
  onClose,
  currentPlanId = "recruitment_suite",
}: UpgradePlanModalProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "six_months" | "yearly">("monthly");

  if (!open) return null;

  const handleSelectPlan = (tierId: string) => {
    onClose();
    router.push(`/recruiter/identity?tab=payments&subtab=plans&plan=${tierId}&cycle=${billingCycle}`);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-3">
            <Crown className="w-3.5 h-3.5" />
            Platform Subscription Plans
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Upgrade Your Hiring & HR Power
          </h2>
          <p className="text-sm text-ink-soft mt-2">
            Authoritative plans matching the official LetGetIn pricing structure with bundled credits.
          </p>

          <div className="inline-flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-2xl mt-5">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("six_months")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === "six_months" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              6 Months
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === "yearly" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === currentPlanId;
            const price =
              billingCycle === "monthly"
                ? tier.priceMonthly
                : billingCycle === "six_months"
                ? tier.priceSixMonths
                : tier.priceAnnual;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 border transition-all ${
                  tier.popular
                    ? "border-primary bg-gradient-to-b from-primary/5 via-surface to-surface shadow-elegant ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                        tier.popular ? "bg-gradient-brand text-white" : "bg-surface-alt border border-border text-ink"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-ink">{tier.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft min-h-[36px]">{tier.description}</p>

                  <div className="mt-4 mb-4 pb-4 border-b border-border/70">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-ink">₹{price.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-ink-soft">
                        / {billingCycle === "monthly" ? "mo" : billingCycle === "six_months" ? "6 mo" : "yr"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-primary-glow">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{tier.creditsPerMonth} credits included / mo</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
                      What&apos;s Included:
                    </span>
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-ink-soft">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-primary-glow" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(tier.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer ${
                      tier.popular
                        ? "bg-gradient-brand text-white hover:shadow-glow"
                        : "bg-surface text-ink border border-border hover:bg-surface-alt hover:border-primary/40"
                    }`}
                  >
                    <span>View Plan & Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-glow" />
            <span>Secure 256-bit encrypted checkout. Cancel or upgrade anytime.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/recruiter/identity?tab=payments&subtab=plans");
            }}
            className="font-bold text-primary-glow hover:underline cursor-pointer"
          >
            Explore all Institution & Startup plans →
          </button>
        </div>
      </div>
    </div>
  );
}
