"use client";

import React, { useState } from "react";
import { Handshake, Search, Users, ExternalLink, CheckCircle2, DollarSign, Filter, Sparkles } from "lucide-react";

interface InvestorProfile {
  id: string;
  name: string;
  firm: string;
  type: "Seed VC" | "Angel Syndicate" | "Micro VC" | "Growth";
  typicalCheck: string;
  sectors: string[];
  portfolioExamples: string[];
  location: string;
  status: "Available for Intro" | "Reviewing Deck" | "Connected";
}

const INVESTORS: InvestorProfile[] = [
  {
    id: "inv-1",
    name: "Aman Gupta Syndicate",
    firm: "D2C & Tech Angels",
    type: "Angel Syndicate",
    typicalCheck: "$50k - $200k",
    sectors: ["Consumer Tech", "AI Apps", "Edtech"],
    portfolioExamples: ["Shiprocket", "Bummer", "Skippi"],
    location: "New Delhi, India",
    status: "Available for Intro",
  },
  {
    id: "inv-2",
    name: "Matrix Partners India",
    firm: "Early Stage Venture Fund",
    type: "Seed VC",
    typicalCheck: "$500k - $2M",
    sectors: ["SaaS", "Enterprise AI", "Fintech"],
    portfolioExamples: ["Razorpay", "Ola", "Dailyhunt"],
    location: "Bangalore & Mumbai",
    status: "Connected",
  },
  {
    id: "inv-3",
    name: "Kunal Shah",
    firm: "QED Innovation Labs",
    type: "Angel Syndicate",
    typicalCheck: "$100k - $500k",
    sectors: ["High-Acuity Talent", "Fintech", "Developer Tools"],
    portfolioExamples: ["CRED", "Razorpay", "Unacademy"],
    location: "Bangalore, India",
    status: "Available for Intro",
  },
  {
    id: "inv-4",
    name: "Elevation Capital",
    firm: "Multi-Stage VC",
    type: "Seed VC",
    typicalCheck: "$1M - $5M",
    sectors: ["B2B SaaS", "HR Tech", "Logistics"],
    portfolioExamples: ["Swiggy", "Urban Company", "Meesho"],
    location: "Gurugram, India",
    status: "Reviewing Deck",
  },
];

export default function StartupInvestorsConnectPage() {
  const [search, setSearch] = useState("");
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  const handleRequestIntro = (id: string) => {
    setRequestedIds((prev) => [...prev, id]);
    alert("Intro request forwarded to LetGetIn Founder Syndicate network!");
  };

  const filtered = INVESTORS.filter(
    (inv) =>
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.firm.toLowerCase().includes(search.toLowerCase()) ||
      inv.sectors.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Investors Connect
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> 250+ Verified VCs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Browse verified angel investors and venture funds matching your sector, ticket size, and growth stage.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search investors or sectors..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-3.5 hover:border-primary/40 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-ink">{inv.name}</h3>
                <p className="text-xs text-ink-soft">{inv.firm} • {inv.location}</p>
              </div>
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-md">
                {inv.type}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-alt/50 border border-border/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-soft">Typical Check:</span>
                <span className="font-bold text-emerald-600">{inv.typicalCheck}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Key Portfolio:</span>
                <span className="text-ink font-semibold truncate max-w-[200px]">
                  {inv.portfolioExamples.join(", ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {inv.sectors.map((sec, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-surface-alt border border-border px-2 py-0.5 rounded-md text-ink-soft"
                >
                  {sec}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <span className="text-[10px] font-bold text-ink-soft">{inv.status}</span>
              <button
                type="button"
                onClick={() => handleRequestIntro(inv.id)}
                disabled={requestedIds.includes(inv.id)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-xs hover:scale-105 disabled:opacity-50 transition cursor-pointer"
              >
                {requestedIds.includes(inv.id) ? "Intro Sent" : "Request Warm Intro"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
