"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Sparkles,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Play,
  Pause,
  Layers,
  X,
  CheckCircle2,
} from "lucide-react";

interface AdCampaign {
  id: string;
  name: string;
  channel: "Google Search" | "Meta / Instagram" | "YouTube Video" | "LinkedIn Ads";
  targetProgram: string;
  spent: string;
  budget: string;
  impressions: string;
  clicks: number;
  ctr: string;
  conversions: number;
  costPerConversion: string;
  status: "Active" | "Paused" | "In Review" | "Completed";
}

export default function InstitutionAdManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<AdCampaign | null>(null);

  const [ads, setAds] = useState<AdCampaign[]>([
    {
      id: "ad-1",
      name: "B.Tech AI & Robotics Search Keyword Intent",
      channel: "Google Search",
      targetProgram: "B.Tech Computer Science / AI",
      spent: "₹42,500",
      budget: "₹60,000",
      impressions: "148,000",
      clicks: 6420,
      ctr: "4.33%",
      conversions: 312,
      costPerConversion: "₹136",
      status: "Active",
    },
    {
      id: "ad-2",
      name: "Campus Life & Tech Fest Reels Sponsored Push",
      channel: "Meta / Instagram",
      targetProgram: "Undergraduate High School Seniors",
      spent: "₹28,000",
      budget: "₹40,000",
      impressions: "310,000",
      clicks: 8910,
      ctr: "2.87%",
      conversions: 425,
      costPerConversion: "₹65",
      status: "Active",
    },
    {
      id: "ad-3",
      name: "Executive MBA & Fintech Leadership InMail",
      channel: "LinkedIn Ads",
      targetProgram: "Postgraduate & Working Professionals",
      spent: "₹55,000",
      budget: "₹80,000",
      impressions: "45,000",
      clicks: 2150,
      ctr: "4.77%",
      conversions: 184,
      costPerConversion: "₹298",
      status: "Active",
    },
    {
      id: "ad-4",
      name: "Virtual 3D Campus Tour YouTube In-Stream Ad",
      channel: "YouTube Video",
      targetProgram: "All Prospective Applicants",
      spent: "₹18,500",
      budget: "₹25,000",
      impressions: "185,000",
      clicks: 3400,
      ctr: "1.84%",
      conversions: 96,
      costPerConversion: "₹192",
      status: "Paused",
    },
  ]);

  // Form State
  const [newName, setNewName] = useState("");
  const [newChannel, setNewChannel] = useState<AdCampaign["channel"]>("Google Search");
  const [newProgram, setNewProgram] = useState("B.Tech Computer Science");
  const [newBudget, setNewBudget] = useState("35000");

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.targetProgram.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "All" || ad.channel === channelFilter;
    const matchesStatus = statusFilter === "All" || ad.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id === id) {
          return {
            ...ad,
            status: ad.status === "Active" ? "Paused" : "Active",
          };
        }
        return ad;
      })
    );
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: AdCampaign = {
      id: `ad-${Date.now()}`,
      name: newName,
      channel: newChannel,
      targetProgram: newProgram,
      spent: "₹0",
      budget: `₹${Number(newBudget).toLocaleString("en-IN")}`,
      impressions: "0",
      clicks: 0,
      ctr: "0.0%",
      conversions: 0,
      costPerConversion: "₹0",
      status: "Active",
    };

    setAds([created, ...ads]);
    setNewName("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Ad Management</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Create, monitor, and optimize multi-channel paid ad campaigns for prospective student admissions across search, video, and social channels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ad Campaign</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Ad Spend</span>
          <p className="text-2xl font-black text-ink mt-1">₹1.44 Lakh</p>
          <span className="text-[11px] text-ink-soft">Budget Cap: ₹2.05L</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Impressions</span>
          <p className="text-2xl font-black text-primary-glow mt-1">688k</p>
          <span className="text-[11px] text-emerald-500 font-semibold">+18% CTR efficiency</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Direct Form Inquiries</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">1,017 Leads</p>
          <span className="text-[11px] text-ink-soft">Avg CAC ₹141</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Avg Click-Through Rate</span>
          <p className="text-2xl font-black text-ink mt-1">3.45%</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Above industry 2.1%</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search ad campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["All", "Google Search", "Meta / Instagram", "YouTube Video", "LinkedIn Ads"].map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                channelFilter === ch
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Ads Table / Cards List */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Active Admission Ad Campaigns</h2>
          <span className="text-xs text-ink-soft">{filteredAds.length} running</span>
        </div>

        {filteredAds.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-xl">
            <Megaphone className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
            <p className="text-xs text-ink-soft font-medium">No ad campaigns match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-xl bg-surface-alt/40 border border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-primary/40 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-ink">{ad.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ad.status === "Active"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : ad.status === "Paused"
                          ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                          : "text-ink-soft bg-surface-alt border-border"
                      }`}
                    >
                      {ad.status}
                    </span>
                    <span className="text-[10px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {ad.channel}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft font-medium">Target: {ad.targetProgram}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                    <span>Spent: <strong className="text-ink">{ad.spent}</strong> / {ad.budget}</span>
                    <span>•</span>
                    <span>CTR: <strong className="text-emerald-500">{ad.ctr}</strong></span>
                    <span>•</span>
                    <span>CPI: <strong className="text-primary-glow">{ad.costPerConversion}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
                  <div>
                    <span className="text-ink-soft block text-[10px]">Impressions</span>
                    <span className="font-bold text-ink">{ad.impressions}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Clicks</span>
                    <span className="font-bold text-ink">{ad.clicks}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Inquiries</span>
                    <span className="font-bold text-emerald-500">{ad.conversions}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(ad.id)}
                    className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                    title={ad.status === "Active" ? "Pause Ad" : "Resume Ad"}
                  >
                    {ad.status === "Active" ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAd(ad)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                  >
                    Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Ad Campaign Details</h3>
              <button
                type="button"
                onClick={() => setSelectedAd(null)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-alt/60 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px]">Ad Name</span>
                <p className="font-bold text-ink text-sm">{selectedAd.name}</p>
                <p className="text-primary-glow font-medium">{selectedAd.channel} · {selectedAd.targetProgram}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Total Impressions</span>
                  <p className="text-lg font-black text-ink">{selectedAd.impressions}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Clicks (CTR)</span>
                  <p className="text-lg font-black text-emerald-500">{selectedAd.clicks} ({selectedAd.ctr})</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Inquiry Forms</span>
                  <p className="text-lg font-black text-primary-glow">{selectedAd.conversions}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Cost Per Lead (CPI)</span>
                  <p className="text-lg font-black text-ink">{selectedAd.costPerConversion}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAd(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-bold hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ad Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Create Paid Ad Campaign</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Ad Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027 Engineering High School Search Ads"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as AdCampaign["channel"])}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="Google Search">Google Search</option>
                    <option value="Meta / Instagram">Meta / Instagram</option>
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Target Program</label>
                  <input
                    type="text"
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Campaign Budget (₹)</label>
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
                  Launch Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
