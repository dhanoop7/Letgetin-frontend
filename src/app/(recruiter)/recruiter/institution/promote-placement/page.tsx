"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Building2,
  Users,
  Award,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Search,
  Filter,
  Eye,
  Share2,
  Briefcase,
  X,
} from "lucide-react";

interface PlacementCampaign {
  id: string;
  title: string;
  platform: string;
  targetAudience: string;
  headline: string;
  recruiterLeads: number;
  interviewsScheduled: number;
  reach: string;
  budget: string;
  status: "Active" | "Scheduled" | "Completed";
  highestCTC: string;
  avgCTC: string;
  featuredBranch: string;
}

export default function InstitutionPromotePlacementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<PlacementCampaign | null>(null);

  const [campaigns, setCampaigns] = useState<PlacementCampaign[]>([
    {
      id: "place-1",
      title: "Global Tech Recruiters Drive 2026-27",
      platform: "LinkedIn Sponsored & Direct Recruiter Outreach",
      targetAudience: "FAANG & Tier-1 Tech Product Companies",
      headline: "850+ CS, AI & Data Science Engineering Graduates Ready for Day-1 Enterprise Deployment",
      recruiterLeads: 48,
      interviewsScheduled: 112,
      reach: "65k HR Leaders",
      budget: "₹1,20,000",
      status: "Active",
      highestCTC: "₹54 LPA",
      avgCTC: "₹14.2 LPA",
      featuredBranch: "CSE / AI & ML",
    },
    {
      id: "place-2",
      title: "FinTech & Banking Shared Campus Placement Showcase",
      platform: "Corporate HR Portals & Email Syndicates",
      targetAudience: "Investment Banks, NBFCs & Fintech Unicorns",
      headline: "Top Tier Financial Analysts, Quant Modellers & Core Java Developers",
      recruiterLeads: 32,
      interviewsScheduled: 68,
      reach: "38k Recruiter Views",
      budget: "₹75,000",
      status: "Active",
      highestCTC: "₹28 LPA",
      avgCTC: "₹11.8 LPA",
      featuredBranch: "FinTech / ECE",
    },
    {
      id: "place-3",
      title: "Core Engineering & Automotive Talent Pipeline",
      platform: "Industry Associations & Manufacturing Forums",
      targetAudience: "EV Manufacturers & Heavy Automation Giants",
      headline: "Industry 4.0 Certified Mechanical, Mechatronics & IoT Engineers",
      recruiterLeads: 22,
      interviewsScheduled: 45,
      reach: "24k Impressions",
      budget: "₹45,000",
      status: "Completed",
      highestCTC: "₹19 LPA",
      avgCTC: "₹8.5 LPA",
      featuredBranch: "Mechanical / Robotics",
    },
  ]);

  // Form State for Launch Campaign
  const [newTitle, setNewTitle] = useState("");
  const [newBranch, setNewBranch] = useState("CSE / Data Science");
  const [newHeadline, setNewHeadline] = useState("");
  const [newBudget, setNewBudget] = useState("50000");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.featuredBranch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: PlacementCampaign = {
      id: `place-${Date.now()}`,
      title: newTitle,
      platform: "LinkedIn & Recruiter Network",
      targetAudience: "Tier-1 Corporate Recruiters",
      headline: newHeadline || "Graduating Batch Talent Showcase with Verified Skill Rubrics",
      recruiterLeads: 0,
      interviewsScheduled: 0,
      reach: "0 Impressions",
      budget: `₹${Number(newBudget).toLocaleString("en-IN")}`,
      status: "Active",
      highestCTC: "₹42 LPA",
      avgCTC: "₹12.5 LPA",
      featuredBranch: newBranch,
    };

    setCampaigns([created, ...campaigns]);
    setNewTitle("");
    setNewHeadline("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Promote Placement</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Placement Marketing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Showcase verified batch placement statistics, highest CTC packages, star alumni, and recruiter tie-ups to attract premier hiring partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Placement Campaign</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Corporate Recruiter Leads</span>
          <p className="text-2xl font-black text-ink mt-1">102 Leads</p>
          <span className="text-[11px] text-emerald-500 font-semibold">+28% vs last drive season</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Campus Interviews Scheduled</span>
          <p className="text-2xl font-black text-primary-glow mt-1">225 Rounds</p>
          <span className="text-[11px] text-ink-soft">42 Tier-1 Companies</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Highest CTC Highlighted</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">₹54 LPA</p>
          <span className="text-[11px] text-ink-soft">Avg CTC ₹14.2 LPA</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Corporate HR Reach</span>
          <p className="text-2xl font-black text-ink mt-1">127k</p>
          <span className="text-[11px] text-ink-soft">Targeting Tech & Core HR Leads</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search placement campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {["All", "Active", "Scheduled", "Completed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Placement Campaigns List */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Active Corporate Placement Campaigns</h2>
          <span className="text-xs text-ink-soft">{filteredCampaigns.length} campaigns found</span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-xl">
            <Building2 className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
            <p className="text-xs text-ink-soft font-medium">No placement campaigns match your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-xl bg-surface-alt/40 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-ink">{camp.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        camp.status === "Active"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : camp.status === "Scheduled"
                          ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                          : "text-ink-soft bg-surface-alt border-border"
                      }`}
                    >
                      {camp.status}
                    </span>
                    <span className="text-[10px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {camp.featuredBranch}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft font-medium">{camp.headline}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-soft/80">
                    <span>{camp.platform}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-500">Max CTC: {camp.highestCTC}</span>
                    <span>•</span>
                    <span>Avg: {camp.avgCTC}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-ink-soft block text-[10px]">Recruiter Leads</span>
                    <span className="font-bold text-ink">{camp.recruiterLeads}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Interviews</span>
                    <span className="font-bold text-primary-glow">{camp.interviewsScheduled}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Budget</span>
                    <span className="font-medium text-ink">{camp.budget}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(camp)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Campaign Performance Analytics</h3>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-alt/60 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px]">Campaign Title</span>
                <p className="font-bold text-ink text-sm">{selectedCampaign.title}</p>
                <p className="text-ink-soft">{selectedCampaign.headline}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Total Impressions</span>
                  <p className="text-lg font-black text-ink">{selectedCampaign.reach}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Recruiter Inquiries</span>
                  <p className="text-lg font-black text-emerald-500">{selectedCampaign.recruiterLeads}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Campus Drive Slots</span>
                  <p className="text-lg font-black text-primary-glow">{selectedCampaign.interviewsScheduled}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Spend Allocated</span>
                  <p className="text-lg font-black text-ink">{selectedCampaign.budget}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-bold hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Launch Placement Campaign</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027 Engineering & AI Mega Drive Showcase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Featured Department / Batch</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                >
                  <option value="CSE / Data Science">Computer Science & Data Science</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Electronics & VLSI">Electronics & VLSI Design</option>
                  <option value="Management & Analytics">Management & Analytics</option>
                  <option value="Full Batch All-Streams">All Graduating Batches</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Recruiter Pitch Headline</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pre-screened candidates with 100% verified GitHub projects & algorithmic problem solving badges"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Target Budget (₹)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-semibold hover:bg-surface-alt/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
