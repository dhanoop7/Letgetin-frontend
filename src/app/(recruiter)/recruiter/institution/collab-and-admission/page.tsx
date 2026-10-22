"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Sparkles,
  Building2,
  Users,
  Plus,
  Search,
  Filter,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  School,
  Globe,
  FileCheck,
  X,
} from "lucide-react";

interface PartnerInstitution {
  id: string;
  name: string;
  type: "Feeder Junior College" | "International University" | "Education Consultant" | "School Board";
  location: string;
  mouDate: string;
  referredStudents: number;
  enrolledStudents: number;
  conversionRate: string;
  status: "Active MoU" | "In Review" | "Renewal Due";
  contactPerson: string;
  programsOffered: string;
}

export default function InstitutionCollabAndAdmissionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerInstitution | null>(null);

  const [partners, setPartners] = useState<PartnerInstitution[]>([
    {
      id: "part-1",
      name: "Delhi Public Schools Consortium (Northern Hub)",
      type: "School Board",
      location: "New Delhi & NCR",
      mouDate: "Aug 2026 - Aug 2029",
      referredStudents: 420,
      enrolledStudents: 142,
      conversionRate: "33.8%",
      status: "Active MoU",
      contactPerson: "Dr. Arvind Sharma (Academic Director)",
      programsOffered: "B.Tech CSE, AI & Integrated M.Sc",
    },
    {
      id: "part-2",
      name: "Chaitanya & Narayana Junior Science Colleges",
      type: "Feeder Junior College",
      location: "Hyderabad & Bangalore",
      mouDate: "Jul 2026 - Jul 2028",
      referredStudents: 680,
      enrolledStudents: 215,
      conversionRate: "31.6%",
      status: "Active MoU",
      contactPerson: "S. Rao (Zonal Placement & Admissions Lead)",
      programsOffered: "Engineering, Biotechnology & Data Science",
    },
    {
      id: "part-3",
      name: "Global EduPathway & StudyBridge Partners",
      type: "Education Consultant",
      location: "Mumbai, Pune & Dubai",
      mouDate: "Sep 2026 - Sep 2027",
      referredStudents: 190,
      enrolledStudents: 64,
      conversionRate: "33.6%",
      status: "Active MoU",
      contactPerson: "Meera Kapoor (Director Partnerships)",
      programsOffered: "MBA, PGDM & Executive Analytics",
    },
    {
      id: "part-4",
      name: "University of Melbourne 2+2 Dual Degree Pathway",
      type: "International University",
      location: "Melbourne, Australia",
      mouDate: "Pending Review",
      referredStudents: 45,
      enrolledStudents: 12,
      conversionRate: "26.6%",
      status: "In Review",
      contactPerson: "Prof. James Davies (Dean International)",
      programsOffered: "Dual B.Eng (Software & Robotics)",
    },
  ]);

  // Form State
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PartnerInstitution["type"]>("Feeder Junior College");
  const [newLocation, setNewLocation] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPrograms, setNewPrograms] = useState("");

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || p.type === typeFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: PartnerInstitution = {
      id: `part-${Date.now()}`,
      name: newName,
      type: newType,
      location: newLocation || "India",
      mouDate: "Oct 2026 - Oct 2029",
      referredStudents: 0,
      enrolledStudents: 0,
      conversionRate: "0%",
      status: "Active MoU",
      contactPerson: newContact || "Principal / Coordinator",
      programsOffered: newPrograms || "All Undergraduate Programs",
    };

    setPartners([created, ...partners]);
    setNewName("");
    setNewLocation("");
    setNewContact("");
    setNewPrograms("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Collab and Admission</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Establish, manage, and scale formal admission partnerships with feeder junior colleges, international universities, and educational consultants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs sm:text-sm font-bold shadow-glow hover:opacity-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admission Partner</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Active Partner Institutions</span>
          <p className="text-2xl font-black text-ink mt-1">34 Partners</p>
          <span className="text-[11px] text-emerald-500 font-semibold">+6 new MoUs signed</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Referred Applicants</span>
          <p className="text-2xl font-black text-primary-glow mt-1">1,335 Leads</p>
          <span className="text-[11px] text-ink-soft">From feeder network</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Confirmed Enrollments</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">433 Enrolled</p>
          <span className="text-[11px] text-emerald-500 font-semibold">32.4% avg conversion</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-ink-soft">Dual Degree Tracks</span>
          <p className="text-2xl font-black text-ink mt-1">8 Pathways</p>
          <span className="text-[11px] text-ink-soft">Global university tie-ups</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search partners, location, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-alt/60 border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["All", "Feeder Junior College", "School Board", "Education Consultant", "International University"].map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                typeFilter === tp
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-surface-alt/50 text-ink-soft hover:text-ink hover:bg-surface-alt"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Partners List */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Active Institutional MoUs & Feeder Partnerships</h2>
          <span className="text-xs text-ink-soft">{filteredPartners.length} institutions</span>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-xl">
            <School className="w-8 h-8 text-ink-soft mx-auto opacity-50" />
            <p className="text-xs text-ink-soft font-medium">No partner institutions match your current filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPartners.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-surface-alt/40 border border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-primary/40 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-ink">{p.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === "Active MoU"
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-[10px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft font-medium">Programs: {p.programsOffered}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                    <span>{p.location}</span>
                    <span>•</span>
                    <span>Contact: {p.contactPerson}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">MoU: {p.mouDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
                  <div>
                    <span className="text-ink-soft block text-[10px]">Referred</span>
                    <span className="font-bold text-ink">{p.referredStudents}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Enrolled</span>
                    <span className="font-bold text-emerald-500">{p.enrolledStudents}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[10px]">Conversion</span>
                    <span className="font-bold text-primary-glow">{p.conversionRate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPartner(p)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                  >
                    View MoU Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Partnership & MoU Summary</h3>
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-alt/60 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px]">Institution Name</span>
                <p className="font-bold text-ink text-sm">{selectedPartner.name}</p>
                <p className="text-primary-glow font-medium">{selectedPartner.type} · {selectedPartner.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Referred Applicants</span>
                  <p className="text-lg font-black text-ink">{selectedPartner.referredStudents}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Confirmed Enrollments</span>
                  <p className="text-lg font-black text-emerald-500">{selectedPartner.enrolledStudents}</p>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border col-span-2">
                  <span className="text-ink-soft text-[10px]">Key Point of Contact</span>
                  <p className="font-bold text-ink mt-0.5">{selectedPartner.contactPerson}</p>
                  <p className="text-ink-soft text-[11px] mt-1">Valid Agreement Period: {selectedPartner.mouDate}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-bold hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">Add Feeder School / Admission Partner</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePartner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Institution / Agency Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's Junior Science College"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Partner Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PartnerInstitution["type"])}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="Feeder Junior College">Feeder Junior College</option>
                    <option value="School Board">School Board</option>
                    <option value="Education Consultant">Education Consultant</option>
                    <option value="International University">International University</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Karnataka"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Point of Contact / Coordinator</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Ananya Sen (Head of Career Cell)"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-alt/60 border border-border rounded-xl text-ink focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Target Admission Programs</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science, Robotics & AI"
                  value={newPrograms}
                  onChange={(e) => setNewPrograms(e.target.value)}
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
                  Register Partner MoU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
