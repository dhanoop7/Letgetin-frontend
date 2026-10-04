"use client";

import React, { useState } from "react";
import {
  Languages,
  Sparkles,
  Mic,
  BookOpen,
  Volume2,
  FileCheck,
  Award,
  TrendingUp,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  ShieldCheck,
  Globe,
} from "lucide-react";

export default function LinguisticTestPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("English (CEFR Standard)");

  const modules = [
    {
      id: "reading",
      title: "Reading Comprehension",
      desc: "Syntax, vocabulary richness, technical context & contextual reasoning",
      duration: "15 mins",
      questions: "20 MCQs",
      icon: BookOpen,
      level: "C1 Advanced",
      score: "92/100",
    },
    {
      id: "listening",
      title: "Audio & Listening Comprehension",
      desc: "Accent adaptation, speaker intent, nuance & auditory retention",
      duration: "15 mins",
      questions: "15 Audio Tasks",
      icon: Volume2,
      level: "C1 Advanced",
      score: "88/100",
    },
    {
      id: "speaking",
      title: "AI Spoken Fluency & Pronunciation",
      desc: "Phonetics, prosody, pacing, pauses & conversational coherence",
      duration: "10 mins",
      questions: "5 Spoken Prompts",
      icon: Mic,
      level: "B2+ Upper Int.",
      score: "85/100",
    },
    {
      id: "writing",
      title: "Professional Writing & Grammar",
      desc: "Business communication, conciseness, grammar & email etiquette",
      duration: "20 mins",
      questions: "2 Prompts",
      icon: FileCheck,
      level: "C1 Advanced",
      score: "90/100",
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
              <Languages className="w-3.5 h-3.5" />
              <span>Linguistic Assessment Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Linguistic Test & Language Proficiency
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              Measure and certify your language communication skills across international standards (CEFR & IELTS benchmarked) for global career opportunities.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-glow" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs font-bold text-ink bg-surface-alt border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-glow/40 cursor-pointer"
              >
                <option value="English (CEFR Standard)">English (CEFR Standard)</option>
                <option value="German (Goethe Standard)">German (Goethe Standard)</option>
                <option value="French (DELF Standard)">French (DELF Standard)</option>
                <option value="Spanish (DELE Standard)">Spanish (DELE Standard)</option>
                <option value="Japanese (JLPT Standard)">Japanese (JLPT Standard)</option>
              </select>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Certified Assessment Engine
            </span>
          </div>
        </div>
      </div>

      {/* Overall Score Overview Card */}
      <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-glow bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Current CEFR Benchmark
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
            C1 Advanced Global Working Proficiency
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            Your linguistic fluency enables you to effectively handle complex technical discussions, cross-cultural stakeholder management, and executive business writing.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-surface-alt/60 rounded-3xl border border-border/60 shrink-0 w-full md:w-56 text-center">
          <span className="text-[10px] font-extrabold text-ink-soft uppercase tracking-widest">Composite Score</span>
          <div className="text-4xl sm:text-5xl font-black text-primary-glow my-1 tracking-tight">
            89<span className="text-xl font-bold text-ink-soft">/100</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Top 8% Global Candidate Rank
          </span>
        </div>
      </div>

      {/* Assessment Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink tracking-tight">
            Assessment Modules & Skill Dimensions
          </h3>
          <span className="text-xs text-ink-soft">4 Certified Dimensions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="bg-surface p-6 rounded-3xl border border-border/80 shadow-xs space-y-4 hover:border-primary-glow/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                      {mod.level}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-ink">{mod.title}</h4>
                    <p className="text-xs text-ink-soft mt-1 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-glow" /> {mod.duration}
                    </span>
                    <span>•</span>
                    <span>{mod.questions}</span>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
