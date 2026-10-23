"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Bot, UserCheck, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { creditService } from "@/features/credits/services/creditService";
import { checkFeatureCredits, notifyWalletBalanceUpdated } from "@/features/credits/utils/creditCheck";

export default function CareerGuidancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ai" | "personal">("ai");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (
    featureKey: "career_counselling_ai" | "career_counselling_manual",
    targetHref: string,
    actionLabel: string
  ) => {
    if (loadingAction) return;
    setLoadingAction(actionLabel);

    try {
      const cost = featureKey === "career_counselling_ai" ? 3 : 30;
      const check = await checkFeatureCredits(featureKey, cost);
      if (!check.allowed) {
        setLoadingAction(null);
        return;
      }

      await creditService.chargeFeature({
        featureKey,
        customCredits: cost,
      });

      notifyWalletBalanceUpdated();
      toast.success(`${actionLabel} unlocked!`);
      router.push(targetHref);
    } catch (err: any) {
      if (!creditService.isInsufficientCreditsError(err)) {
        toast.error(err?.message || `Failed to unlock ${actionLabel}.`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Career Guidance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Navigate Your Dream Career
        </h1>
        <p className="text-sm text-ink-soft max-w-2xl">
          Get hyper-personalized roadmaps, 1-on-1 industry mentoring, and AI-driven counseling.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-gradient-brand text-primary-foreground shadow-glow"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Guidance</span>
        </button>

        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "personal"
              ? "bg-gradient-brand text-primary-foreground shadow-glow"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Personal Mentoring</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "ai" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">AI Career Roadmap</h3>
                <span className="text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  3 Credits
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Adaptive role matching and step-by-step career milestones curated by AI based on your skill graph.
              </p>
            </div>
            <button
              type="button"
              disabled={loadingAction === "AI Career Roadmap"}
              onClick={() => handleAction("career_counselling_ai", "/ai-apply", "AI Career Roadmap")}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-glow hover:underline pt-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "AI Career Roadmap" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Explore AI Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">Smart Career Chatbot</h3>
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  3 Credits
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                24/7 instant guidance on resumes, interview preparation, salary negotiation, and course selection.
              </p>
            </div>
            <button
              type="button"
              disabled={loadingAction === "Smart Career Chatbot"}
              onClick={() => handleAction("career_counselling_ai", "/geniustest", "Smart Career Chatbot")}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 hover:underline pt-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "Smart Career Chatbot" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Start AI Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">1-on-1 Mentor Sessions</h3>
                <span className="text-[11px] font-bold text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  30 Credits
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Book private sessions with top industry professionals, hiring managers, and certified career coaches.
              </p>
            </div>
            <button
              type="button"
              disabled={loadingAction === "1-on-1 Mentor Sessions"}
              onClick={() => handleAction("career_counselling_manual", "/network", "1-on-1 Mentor Sessions")}
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-500 hover:underline pt-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "1-on-1 Mentor Sessions" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Find Mentors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">Mock Interviews & Review</h3>
                <span className="text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  30 Credits
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Practice real technical and behavioral interview scenarios with actionable, personalized feedback.
              </p>
            </div>
            <button
              type="button"
              disabled={loadingAction === "Mock Interviews & Review"}
              onClick={() => handleAction("career_counselling_manual", "/profile", "Mock Interviews & Review")}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-glow hover:underline pt-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "Mock Interviews & Review" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Schedule Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
