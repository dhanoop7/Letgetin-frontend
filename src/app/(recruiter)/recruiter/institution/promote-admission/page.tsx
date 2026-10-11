"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Megaphone,
  Users,
  Award,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Search,
  Filter,
  GraduationCap,
  X,
} from "lucide-react";

interface AdmissionCampaign {
  id: string;
  title: string;
  platform: string;
  degreeTrack: string;
  headline: string;
  leads: number;
  applications: number;
  reach: string;
  budget: string;
  status: "Active" | "Scheduled" | "Completed";
  scholarshipQuota: string;
}

export default function InstitutionPromoteAdmissionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdmissionCampaign | null>(null);

  const [campaigns, setCampaigns] = useState<AdmissionCampaign[]>([
    {
      id: "adm-1",
      title: "Undergraduate B.Tech Admissions 2027: Early Bird Applications",
      platform: "Meta & Google Display Network",
      degreeTrack: "B.Tech / B.E. Degrees",
      headline: "Study Engineering with 88% Placement Guarantee & Merit Scholarships",
      leads: 640,
      applications: 182,
      reach: "240k Impressions",
      budget: "₹85,000",
      status: "Active",
      scholarshipQuota: "Up to 50% Tuition Waiver",
    },
    {
      id: "adm-2",
      title: "MBA & PGDM Executive Management Admissions",
      platform: "LinkedIn Sponsored InMail & MBA Portals",
      degreeTrack: "Postgraduate & MBA",
      headline: "Accelerate Your Leadership Career with Tier-1 Industry Mentors",
      leads: 290,
      applications: 94,
      reach: "85k Impressions",
      budget: "₹60,000",
      status: "Active",
      scholarshipQuota: "Corporate Merit Seats",
    },
    {
      id: "adm-3",
      title: "Virtual Campus Tour & Open House Webinar Enrollment",
      platform: "YouTube & Instagram Live",
      degreeTrack: "All Programs",
      headline: "Interact with Deans, Lab Directors & Student Achievers at Global MNCs",
      leads: 410,
      applications: 140,
      reach: "110k Views",
      budget: "₹35,000",
      status: "Completed",
      scholarshipQuota: "Open Registration",
    },
    {
      id: "adm-4",
      title: "Artificial Intelligence & Data Engineering Specialization",
      platform: "Google Search & Education Portals",
      degreeTrack: "Emerging Tech B.Tech",
      headline: "Industry-aligned Curriculum with NVIDIA Compute & Robotics Labs",
      leads: 380,
      applications: 115,
      reach: "92k Impressions",
      budget: "₹50,000",
      status: "Scheduled",
      scholarshipQuota: "Top 100 JEE/Entrance Ranks",
    },
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTrack, setNewTrack] = useState("Undergraduate (B.Tech / B.Sc)");
  const [newHeadline, setNewHeadline] = useState("");
  const [newBudget, setNewBudget] = useState("65000");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.degreeTrack.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: AdmissionCampaign = {
      id: `adm-${Date.now()}`,
      title: newTitle,
      platform: "Meta, Google & Education Portals",
      degreeTrack: newTrack,
      headline: newHeadline || "Merit-based Admissions Open with Verified Industry Curriculum",
      leads: 0,
      applications: 0,
      reach: "0 Impressions",
      budget: `₹${Number(newBudget).toLocaleString("en-IN")}`,
      status: "Active",
      scholarshipQuota: "Merit Consideration",
    };

    setCampaigns([created, ...campaigns]);
    setNewTitle("");
    setNewHeadline("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Promote Admission</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Drive student admissions and enrollment campaigns by highlighting academic excellence, campus infrastructure, faculty prestige, and scholarship opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Admission Campaign</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Student Inquiries Generated</span>
          <p className="text-2xl font-black text-ink mt-1">1,720 Leads</p>
          <span className="text-[11px] text-emerald-500 font-semibold">+34% vs last admission cycle</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Verified Application Forms</span>
          <p className="text-2xl font-black text-primary-glow mt-1">531 Forms</p>
          <span className="text-[11px] text-ink-soft">30.8% application conversion</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Cost Per Qualified Lead (CAC)</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">₹128</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Optimized portal pacing</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Total Admission Reach</span>
          <p className="text-2xl font-black text-ink mt-1">527k</p>
          <span className="text-[11px] text-ink-soft">High school seniors & parents</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search admission promotions..."
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

      {/* Campaigns Grid */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Active Enrollment & Admission Campaigns</h2>
          <span className="text-xs text-ink-soft">{filteredCampaigns.length} campaigns active</span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-xl">
            <GraduationCap className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
            <p className="text-xs text-ink-soft font-medium">No admission campaigns match your filter criteria.</p>
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
                      {camp.degreeTrack}
                    </span>
                  </div>
                  <p className="text-xs text-primary-glow font-semibold">{camp.headline}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                    <span>{camp.platform}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">{camp.scholarshipQuota}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-ink-soft block text-[10px]">Inquiries</span>
                    <span className="font-bold text-ink">{camp.leads}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Applications</span>
                    <span className="font-bold text-emerald-500">{camp.applications}</span>
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
                    Analytics & Leads
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
              <h3 className="text-base font-extrabold text-ink">Admission Campaign Analytics</h3>
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
                <span className="text-ink-soft text-[10px]">Campaign Target</span>
                <p className="font-bold text-ink text-sm">{selectedCampaign.title}</p>
                <p className="text-primary-glow font-medium">{selectedCampaign.headline}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Student Reach</span>
                  <p className="text-lg font-black text-ink">{selectedCampaign.reach}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Qualified Leads</span>
                  <p className="text-lg font-black text-emerald-500">{selectedCampaign.leads}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Submitted Applications</span>
                  <p className="text-lg font-black text-primary-glow">{selectedCampaign.applications}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Budget Allocated</span>
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

      {/* Create Admission Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Launch Admission Campaign</h3>
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
                <label className="block font-semibold text-ink mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027 Engineering Merit Scholarship Drive"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Target Degree / Program</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                >
                  <option value="Undergraduate (B.Tech / B.Sc)">Undergraduate (B.Tech / B.Sc / B.Des)</option>
                  <option value="Postgraduate (MBA / M.Tech)">Postgraduate (MBA / M.Tech / MCA)</option>
                  <option value="Executive & Lateral Programs">Executive & Diploma Programs</option>
                  <option value="All Degree Programs">All Degree Tracks</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Promotion Headline & Hook</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100% Scholarship for top rankers + 10-acre green research campus with world-class faculty"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
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
