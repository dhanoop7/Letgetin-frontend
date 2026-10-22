"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Building2,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Layers,
  Users,
  CalendarCheck,
} from "lucide-react";
import {
  huremasoService,
  HuremasoStatusData,
  HuremasoAccessStatus,
} from "@/features/recruiter/services/huremasoService";

export default function HuremasoRecruiterHub() {
  const [data, setData] = useState<HuremasoStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [directLaunchUrl, setDirectLaunchUrl] = useState<string | null>(null);

  // Subscription checkout state
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Load authoritative server status
  const loadStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await huremasoService.getStatus();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load Huremaso status:", err);
      setError(err?.message || "Failed to load Huremaso subscription status. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Real-time countdown computation based on server expiry timestamp
  useEffect(() => {
    if (!data?.trial?.expiresAt || data.status !== "trial_active") return;

    const expiryMs = new Date(data.trial.expiresAt).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = expiryMs - now;

      if (diffMs <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Re-sync with server once trial runs out
        loadStatus();
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.trial?.expiresAt, data?.status, loadStatus]);

  // Start 7-Day Free Trial
  const handleStartTrial = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await huremasoService.startTrial();
      setData(updated);
      setSuccessMessage("Your 7-day free trial has been activated! Launching Huremaso...");

      // Automatically launch Huremaso in new tab
      const launchRes = await huremasoService.launch();
      if (launchRes?.launchUrl) {
        window.open(launchRes.launchUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error("Trial start error:", err);
      setError(err?.message || "Failed to start 7-day trial. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Launch Huremaso Application in New Tab
  const handleLaunch = async () => {
    setActionLoading(true);
    setError(null);
    setDirectLaunchUrl(null);
    try {
      const res = await huremasoService.launch();
      if (res?.launchUrl) {
        // Open actual Huremaso standalone application in new browser tab
        const win = window.open(res.launchUrl, "_blank", "noopener,noreferrer");
        if (!win || win.closed || typeof win.closed === "undefined") {
          setDirectLaunchUrl(res.launchUrl);
        }
      } else {
        throw new Error("Unable to generate launch session.");
      }
    } catch (err: any) {
      console.error("Launch error:", err);
      setError(
        err?.message ||
          "Failed to launch Huremaso. Please check your trial status or subscription."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Subscribe / Upgrade to Paid Plan
  const handleSubscribe = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await huremasoService.subscribe(selectedPlan, billingCycle);
      setData(updated);
      setSuccessMessage(
        `Successfully subscribed to ${
          selectedPlan === "pro" ? "Pro HRMS Plan" : "Starter Plan"
        } (${billingCycle}). Huremaso access has been unlocked!`
      );

      // Auto-launch after successful subscription
      const launchRes = await huremasoService.launch();
      if (launchRes?.launchUrl) {
        window.open(launchRes.launchUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(err?.message || "Failed to complete subscription. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0473b8] rounded-full animate-spin" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-800">Verifying Huremaso Access</h3>
          <p className="text-sm text-slate-500">
            Checking organization trial and enterprise subscription status...
          </p>
        </div>
      </div>
    );
  }

  const status = data?.status || "trial_not_started";
  const orgName = data?.org?.name || "Your Organization";
  const plans = data?.plans;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#061f3d] via-[#0473b8] to-[#00b4d8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Huremaso HRMS Suite
              </h1>
              {status === "subscription_active" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active Subscription
                </span>
              ) : status === "trial_active" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  7-Day Trial Active
                </span>
              ) : status === "trial_expired" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Trial Expired
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                  7-Day Trial Eligible
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{orgName}</span>
              <span className="text-slate-300">•</span>
              <span>Enterprise Workforce Operations & HR Lifecycle</span>
            </p>
          </div>
        </div>

        {/* TOP ACTION IF ACTIVE */}
        {data?.canLaunch && (
          <button
            onClick={handleLaunch}
            disabled={actionLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0473b8] to-[#0066cc] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-[#03629e] hover:to-[#0052a3] transition-all cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Launch Huremaso Application ↗
          </button>
        )}
      </div>

      {/* ERROR & SUCCESS NOTIFICATIONS */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {directLaunchUrl && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="text-sm">
            <span className="font-semibold block sm:inline">Launch tab ready:</span> If your browser blocked opening the tab automatically, click to open.
          </div>
          <a
            href={directLaunchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0473b8] hover:bg-[#035a91] text-white text-xs font-bold transition shadow-sm"
          >
            Open Huremaso Application ↗
          </a>
        </div>
      )}

      {/* STATE 1: TRIAL NOT STARTED */}
      {status === "trial_not_started" && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061f3d] via-[#092d59] to-[#0473b8] text-white p-8 md:p-12 shadow-xl">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                7-Day Unrestricted Free Trial Included
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Empower your workforce with Huremaso HRMS
              </h2>
              <p className="text-slate-200 text-base md:text-lg leading-relaxed">
                Connect recruitment pipeline hires directly into company onboarding, multi-department
                attendance, automated payroll disbursement, and AI-assisted employee performance reviews.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleStartTrial}
                  disabled={actionLoading}
                  className="px-8 py-4 rounded-2xl bg-white text-[#061f3d] font-bold text-base shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0473b8]" />
                  ) : (
                    <Zap className="w-5 h-5 text-[#0473b8]" />
                  )}
                  Start 7-Day Free Trial
                </button>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 px-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required • Instant access in new tab</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRIAL TERMS & HIGHLIGHTS */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0473b8] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">7-Day Free Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Starts the moment you click. Enforced securely by server timestamps. Your trial
                remains active across sessions, logouts, and browser restarts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Full HRMS Capabilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directory, attendance, leaves, statutory compliance, payroll calculations, documents,
                and recruitment pipelines with no artificial limitations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Seamless Continuation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When the 7 days conclude, your data is preserved. Simply choose the Starter or Pro
                plan to maintain continuous access for your organization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: TRIAL ACTIVE */}
      {status === "trial_active" && (
        <div className="space-y-8">
          {/* ACTIVE COUNTDOWN BANNER */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#061f3d] to-[#0473b8] text-white p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Trial Access Active
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Expires:{" "}
                  {data?.trial?.expiresAt
                    ? new Date(data.trial.expiresAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "7 days"}
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Huremaso HRMS is active for {orgName}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  You can launch and use the standalone Huremaso application at any time.
                </p>
              </div>

              {/* COUNTDOWN CLOCK BOXES */}
              <div className="grid grid-cols-4 gap-3 max-w-md pt-2">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-cyan-300">
                    {timeRemaining.days}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Days
                  </div>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-cyan-300">
                    {timeRemaining.hours}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Hours
                  </div>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-cyan-300">
                    {timeRemaining.minutes}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Mins
                  </div>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-cyan-300">
                    {timeRemaining.seconds}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Secs
                  </div>
                </div>
              </div>

              {/* PRIMARY LAUNCH ACTION */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleLaunch}
                  disabled={actionLoading}
                  className="px-8 py-4 rounded-2xl bg-white text-[#061f3d] font-bold text-base shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0473b8]" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-[#0473b8]" />
                  )}
                  Open Huremaso Application ↗
                </button>
                <div className="text-xs text-slate-300">
                  Opens in a new browser tab. Keeps your LetGetIn workspace open.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: TRIAL EXPIRED */}
      {status === "trial_expired" && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-amber-50 border-2 border-amber-300/80 p-8 md:p-10 text-slate-900 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">7-Day Free Trial Has Concluded</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  The evaluation period for <strong>{orgName}</strong> ended on{" "}
                  {data?.trial?.expiresAt
                    ? new Date(data.trial.expiresAt).toLocaleDateString(undefined, {
                        dateStyle: "full",
                      })
                    : "Day 7"}
                  .
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              Direct access to the standalone Huremaso application is currently paused until a
              subscription is activated. Your existing organization data, workforce configurations, and
              settings have been preserved. Select a plan below to immediately restore access.
            </p>
          </div>
        </div>
      )}

      {/* STATE 4: SUBSCRIPTION ACTIVE */}
      {status === "subscription_active" && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-[#063329] to-emerald-700 text-white p-8 md:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Active Enterprise Subscription</h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Plan: <strong>{data?.subscription?.planName || "Pro HRMS"}</strong> •{" "}
                  {data?.subscription?.billingCycle === "annual" ? "Annual Billing" : "Monthly Billing"}
                </p>
              </div>
            </div>
            {data?.subscription?.paymentId && (
              <div className="text-xs font-mono text-emerald-200 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                Txn: {data.subscription.paymentId}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={handleLaunch}
              disabled={actionLoading}
              className="px-8 py-4 rounded-2xl bg-white text-emerald-950 font-bold text-base shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              ) : (
                <ExternalLink className="w-5 h-5 text-emerald-600" />
              )}
              Launch Huremaso Application ↗
            </button>
            <div className="text-xs text-emerald-200">
              Valid until:{" "}
              {data?.subscription?.expiresAt
                ? new Date(data.subscription.expiresAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })
                : "Active"}
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION PLANS SECTION (Shown if expired or for upgrade) */}
      {(status === "trial_expired" || status === "trial_active") && plans && (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {status === "trial_expired" ? "Choose Your Subscription Plan" : "Available Plans"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Transparent enterprise pricing. Upgrade or switch plans anytime.
              </p>
            </div>

            {/* BILLING CYCLE TOGGLE */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-[#0473b8] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Annual
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                  Save 2 Mo
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* STARTER PLAN */}
            <div
              onClick={() => setSelectedPlan("starter")}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-5 ${
                selectedPlan === "starter"
                  ? "border-[#0473b8] bg-blue-50/30 ring-2 ring-[#0473b8]/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{plans.starter.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{plans.starter.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-slate-900">
                    ${billingCycle === "annual" ? plans.starter.annualPrice : plans.starter.monthlyPrice}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {billingCycle === "annual" ? "/year" : "/month"}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                {plans.starter.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0473b8] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan("starter");
                  handleSubscribe();
                }}
                disabled={actionLoading}
                className={`w-full py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  selectedPlan === "starter"
                    ? "bg-[#0473b8] hover:bg-[#03629e] text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {status === "trial_expired" ? "Subscribe with Starter" : "Select Starter Plan"}
              </button>
            </div>

            {/* PRO HRMS PLAN */}
            <div
              onClick={() => setSelectedPlan("pro")}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-5 ${
                selectedPlan === "pro"
                  ? "border-[#0473b8] bg-blue-50/40 ring-4 ring-[#0473b8]/20 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#0473b8] to-[#0066cc] text-white text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
                Recommended
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{plans.pro.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{plans.pro.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-slate-900">
                    ${billingCycle === "annual" ? plans.pro.annualPrice : plans.pro.monthlyPrice}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {billingCycle === "annual" ? "/year" : "/month"}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                {plans.pro.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan("pro");
                  handleSubscribe();
                }}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#0473b8] to-[#0066cc] hover:from-[#03629e] hover:to-[#0052a3] text-white shadow-md transition-all cursor-pointer"
              >
                {status === "trial_expired" ? "Restore Access with Pro" : "Upgrade to Pro HRMS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
