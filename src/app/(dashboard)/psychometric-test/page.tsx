"use client";

import React from "react";
import {
  Brain,
  Sparkles,
  Compass,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Target,
  Play,
  Clock,
  CheckCircle2,
  Sliders,
  Layers,
} from "lucide-react";

export default function PsychometricTestPage() {
  const dimensions = [
    {
      id: "big5-openness",
      title: "Cognitive Agility & Problem Solving",
      desc: "Abstract pattern recognition, adaptability to new frameworks & analytical reasoning",
      traits: ["High Adaptability", "Systemic Thinker"],
      score: "94%",
      level: "High Alignment",
    },
    {
      id: "situational-judgment",
      title: "Situational Judgment & Workplace Ethics",
      desc: "Ethical decision making under ambiguity, prioritization & conflict resolution",
      traits: ["Principled", "Constructive Resolution"],
      score: "89%",
      level: "Strong Alignment",
    },
    {
      id: "collaboration-culture",
      title: "Team Dynamics & Cultural Compatibility",
      desc: "Cross-functional empathy, active listening, psychological safety & peer support",
      traits: ["Inclusive Leader", "High Empathy"],
      score: "91%",
      level: "High Alignment",
    },
    {
      id: "resilience-drive",
      title: "Emotional Resilience & Goal Orientation",
      desc: "Stress tolerance during critical milestones, intrinsic motivation & grit",
      traits: ["High Stress Tolerance", "Self-Driven"],
      score: "87%",
      level: "Strong Alignment",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
              <Brain className="w-3.5 h-3.5" />
              <span>Behavioral & Cognitive Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Psychometric Test & Personality Assessment
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              Discover your behavioral archetype, leadership tendencies, and cognitive strengths through bias-free psychometric evaluation tailored for top modern teams.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Big Five & SJT Framework
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Enterprise Psychometric Standard
            </span>
          </div>
        </div>
      </div>

      {/* Behavioral Profile Hero Card */}
      <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Primary Archetype Identified
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
            Strategic Innovator & Collaborative Driver
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            Exhibits high cognitive adaptability combined with exceptional emotional intelligence. Thrives in fast-paced product environments and cross-functional leadership roles.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-surface-alt/60 rounded-3xl border border-border/60 shrink-0 w-full md:w-56 text-center">
          <span className="text-[10px] font-extrabold text-ink-soft uppercase tracking-widest">Behavioral Index</span>
          <div className="text-4xl sm:text-5xl font-black text-primary-glow my-1 tracking-tight">
            91<span className="text-xl font-bold text-ink-soft">/100</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Culture Alignment
          </span>
        </div>
      </div>

      {/* Behavioral Dimensions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink tracking-tight">
            Psychometric Dimensions & Behavioral Matrix
          </h3>
          <span className="text-xs text-ink-soft">4 Key Pillars</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensions.map((dim) => (
            <div
              key={dim.id}
              className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4 hover:border-primary-glow/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {dim.score}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-ink">{dim.title}</h4>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">{dim.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {dim.traits.map((trait) => (
                    <span
                      key={trait}
                      className="text-[10.5px] font-semibold text-ink-soft bg-surface-alt border border-border px-2 py-0.5 rounded-lg"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <Clock className="w-3.5 h-3.5 text-primary-glow" />
                  <span>25 mins • 30 Situations</span>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Take Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
