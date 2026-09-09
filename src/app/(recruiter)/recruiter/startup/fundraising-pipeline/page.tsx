"use client";

import React, { useState } from "react";
import { DollarSign, Plus, ChevronRight, CheckCircle2, Clock, Users, ArrowRight, X, Sparkles } from "lucide-react";

interface InvestorDeal {
  id: string;
  fundName: string;
  leadPartner: string;
  stage: "prospect" | "pitched" | "meeting" | "diligence" | "termsheet";
  checkSize: string;
  roundType: string;
  lastTouch: string;
  notes: string;
}

const STAGES: { id: InvestorDeal["stage"]; label: string; color: string }[] = [
  { id: "prospect", label: "Prospects & Research", color: "bg-slate-500" },
  { id: "pitched", label: "Pitched / Intro Made", color: "bg-blue-500" },
  { id: "meeting", label: "Partner Meeting", color: "bg-purple-500" },
  { id: "diligence", label: "Due Diligence & Data Room", color: "bg-amber-500" },
  { id: "termsheet", label: "Term Sheet / Closed", color: "bg-emerald-500" },
];

const INITIAL_DEALS: InvestorDeal[] = [
  {
    id: "deal-1",
    fundName: "Blume Ventures",
    leadPartner: "Sajith Pai",
    stage: "meeting",
    checkSize: "$750,000",
    roundType: "Seed Round",
    lastTouch: "Yesterday",
    notes: "Very receptive to B2B recruitment AI metrics; requested unit economics sheet.",
  },
  {
    id: "deal-2",
    fundName: "Peak XV Surge",
    leadPartner: "Rajan Anandan",
    stage: "diligence",
    checkSize: "$1,500,000",
    roundType: "Seed Round",
    lastTouch: "3 days ago",
    notes: "Data room shared. Technical IP architecture audit currently underway.",
  },
  {
    id: "deal-3",
    fundName: "Kalaari Capital",
    leadPartner: "Vani Kola",
    stage: "pitched",
    checkSize: "$500,000",
    roundType: "Seed Round",
    lastTouch: "Today",
    notes: "Sent updated deck v3.1 with latest MoM ARR numbers.",
  },
  {
    id: "deal-4",
    fundName: "Titan Capital",
    leadPartner: "Kunal Bahl",
    stage: "termsheet",
    checkSize: "$250,000",
    roundType: "Angel Syndicate",
    lastTouch: "2 days ago",
    notes: "Signed SAFE note. Awaiting final wire transfer.",
  },
];

export default function StartupFundraisingPipelinePage() {
  const [deals, setDeals] = useState<InvestorDeal[]>(INITIAL_DEALS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formFundName, setFormFundName] = useState("");
  const [formPartner, setFormPartner] = useState("");
  const [formCheckSize, setFormCheckSize] = useState("$500,000");
  const [formStage, setFormStage] = useState<InvestorDeal["stage"]>("prospect");
  const [formNotes, setFormNotes] = useState("");

  const moveStage = (id: string, newStage: InvestorDeal["stage"]) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: newStage } : d)));
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFundName.trim()) return;

    const newDeal: InvestorDeal = {
      id: `deal-${Date.now()}`,
      fundName: formFundName.trim(),
      leadPartner: formPartner.trim() || "Managing Director",
      stage: formStage,
      checkSize: formCheckSize,
      roundType: "Seed Round",
      lastTouch: "Just now",
      notes: formNotes.trim() || "Initial contact established.",
    };

    setDeals((prev) => [newDeal, ...prev]);
    setIsAddModalOpen(false);
    setFormFundName("");
    setFormPartner("");
    setFormNotes("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Fund Raising Pipeline
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Target: $2.0M Seed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Track active VC conversations, pitch presentations, due diligence requests, and term sheet execution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-105 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Investor</span>
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((st) => {
          const colDeals = deals.filter((d) => d.stage === st.id);
          return (
            <div
              key={st.id}
              className="bg-surface rounded-2xl border border-border flex flex-col min-h-[480px] shadow-xs"
            >
              <div className="p-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                  <h3 className="text-xs font-bold text-ink truncate">{st.label}</h3>
                </div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-surface-alt text-ink-soft">
                  {colDeals.length}
                </span>
              </div>

              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin">
                {colDeals.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-center p-3 border border-dashed border-border rounded-xl text-ink-soft text-xs">
                    No funds in this stage
                  </div>
                ) : (
                  colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-xl border border-border bg-surface-alt/40 hover:bg-surface-alt hover:border-primary/40 transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-ink">{deal.fundName}</h4>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          {deal.checkSize}
                        </span>
                      </div>

                      <div className="text-[11px] text-ink-soft flex items-center gap-1">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{deal.leadPartner}</span>
                      </div>

                      <p className="text-[10.5px] text-ink-soft line-clamp-2 italic">
                        "{deal.notes}"
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-border/60">
                        <span className="text-ink-soft">{deal.lastTouch}</span>
                        <div className="flex items-center gap-1">
                          {st.id !== "termsheet" && (
                            <button
                              type="button"
                              onClick={() => {
                                const order: InvestorDeal["stage"][] = [
                                  "prospect",
                                  "pitched",
                                  "meeting",
                                  "diligence",
                                  "termsheet",
                                ];
                                const idx = order.indexOf(st.id);
                                if (idx < order.length - 1) moveStage(deal.id, order[idx + 1]);
                              }}
                              className="px-1.5 py-0.5 rounded bg-primary/10 text-primary-glow font-bold hover:bg-primary/20 cursor-pointer"
                              title="Advance Stage"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Investor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-ink">Add Investor Deal</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-ink">VC Fund / Angel Name *</label>
                <input
                  type="text"
                  required
                  value={formFundName}
                  onChange={(e) => setFormFundName(e.target.value)}
                  placeholder="e.g. Peak XV Partners"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Lead Partner</label>
                  <input
                    type="text"
                    value={formPartner}
                    onChange={(e) => setFormPartner(e.target.value)}
                    placeholder="e.g. Partner Name"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">Target Check Size</label>
                  <input
                    type="text"
                    value={formCheckSize}
                    onChange={(e) => setFormCheckSize(e.target.value)}
                    placeholder="e.g. $500,000"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Pipeline Stage</label>
                <select
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value as InvestorDeal["stage"])}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Discussion Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Key feedback, requested numbers, next steps..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-soft hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:scale-105 cursor-pointer"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
