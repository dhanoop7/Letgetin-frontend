"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Users,
  Award,
  ChevronRight,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  X,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface CampusJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Hybrid" | "On-Campus" | "On-Site" | "Remote";
  status: "Active" | "Interviewing" | "Offer Release" | "Closed";
  totalApplicants: number;
  selectedCount: number;
  department: string;
  ctc: string;
  driveDate: string;
}

interface Applicant {
  id: string;
  jobId: string;
  name: string;
  rollNo: string;
  department: string;
  cgpa: number;
  company: string;
  role: string;
  stage: "Selected" | "Technical Round 2" | "Online Assessment" | "HR Round Scheduled" | "Technical Round 1";
  appliedOn: string;
  email: string;
  phone: string;
  skills: string[];
  notes: string;
}

const JOBS_DATA: CampusJob[] = [
  {
    id: "job-1",
    title: "SDE-1 (Graduate 2027)",
    company: "Google India",
    location: "Bangalore",
    workMode: "Hybrid",
    status: "Interviewing",
    totalApplicants: 142,
    selectedCount: 8,
    department: "CSE / IT / AI",
    ctc: "₹54.0 LPA",
    driveDate: "Oct 12 - Oct 14, 2026",
  },
  {
    id: "job-2",
    title: "VLSI Hardware Engineer",
    company: "Texas Instruments",
    location: "Bangalore",
    workMode: "On-Campus",
    status: "Active",
    totalApplicants: 88,
    selectedCount: 4,
    department: "ECE / EEE",
    ctc: "₹26.0 LPA",
    driveDate: "Oct 22, 2026",
  },
  {
    id: "job-3",
    title: "Cloud & DevOps Engineer",
    company: "Microsoft",
    location: "Hyderabad",
    workMode: "Hybrid",
    status: "Interviewing",
    totalApplicants: 165,
    selectedCount: 6,
    department: "CSE / IT",
    ctc: "₹48.0 LPA",
    driveDate: "Oct 18, 2026",
  },
  {
    id: "job-4",
    title: "Technology Analyst",
    company: "Deloitte USI",
    location: "Mumbai / Gurgaon",
    workMode: "Hybrid",
    status: "Active",
    totalApplicants: 210,
    selectedCount: 18,
    department: "All Engineering Branches",
    ctc: "₹14.5 LPA",
    driveDate: "Oct 02 - Oct 05, 2026",
  },
  {
    id: "job-5",
    title: "GET - Automotive & EV",
    company: "Tata Motors",
    location: "Pune",
    workMode: "On-Site",
    status: "Offer Release",
    totalApplicants: 95,
    selectedCount: 7,
    department: "Mechanical / Robotics",
    ctc: "₹11.5 LPA",
    driveDate: "Sep 28 - Oct 01, 2026",
  },
];

const APPLICANTS_DATA: Applicant[] = [
  // Google India
  {
    id: "app-1",
    jobId: "job-1",
    name: "Rohan Verma",
    rollNo: "22CS104",
    department: "CSE",
    cgpa: 9.42,
    company: "Google India",
    role: "SDE-1 (Graduate 2027)",
    stage: "Selected",
    appliedOn: "Oct 01, 2026",
    email: "rohan.v22@institution.edu",
    phone: "+91 98451 23041",
    skills: ["Data Structures", "Algorithms", "Distributed Systems", "C++", "Go"],
    notes: "Flawless performance in algorithmic coding round and system design whiteboard.",
  },
  {
    id: "app-2",
    jobId: "job-1",
    name: "Divya Nair",
    rollNo: "22CS012",
    department: "CSE",
    cgpa: 9.76,
    company: "Google India",
    role: "SDE-1 (Graduate 2027)",
    stage: "Selected",
    appliedOn: "Oct 02, 2026",
    email: "divya.n22@institution.edu",
    phone: "+91 94471 88921",
    skills: ["Machine Learning", "Python", "C++", "Cloud Infrastructure"],
    notes: "Top coder in university hackathon, strong problem solving intuition.",
  },
  {
    id: "app-3",
    jobId: "job-1",
    name: "Karthik Subramanian",
    rollNo: "22IT045",
    department: "IT",
    cgpa: 8.85,
    company: "Google India",
    role: "SDE-1 (Graduate 2027)",
    stage: "Technical Round 2",
    appliedOn: "Oct 08, 2026",
    email: "karthik.s22@institution.edu",
    phone: "+91 91234 88765",
    skills: ["Java", "Microservices", "Spring Boot", "Kubernetes"],
    notes: "Cleared Online Assessment (98/100). Technical round 2 scheduled for Audi-1.",
  },
  {
    id: "app-4",
    jobId: "job-1",
    name: "Amit Patel",
    rollNo: "22CS088",
    department: "CSE",
    cgpa: 8.9,
    company: "Google India",
    role: "SDE-1 (Graduate 2027)",
    stage: "Online Assessment",
    appliedOn: "Oct 05, 2026",
    email: "amit.p22@institution.edu",
    phone: "+91 98765 43210",
    skills: ["React", "TypeScript", "Node.js", "SQL"],
    notes: "Code signal test in progress. Proctoring report pending.",
  },
  {
    id: "app-5",
    jobId: "job-1",
    name: "Shreya Rao",
    rollNo: "22IT019",
    department: "IT",
    cgpa: 8.75,
    company: "Google India",
    role: "SDE-1 (Graduate 2027)",
    stage: "HR Round Scheduled",
    appliedOn: "Oct 06, 2026",
    email: "shreya.r22@institution.edu",
    phone: "+91 99887 76655",
    skills: ["C++", "Java", "Agile", "REST APIs"],
    notes: "Passed Technical rounds 1 & 2. Behavioral round scheduled.",
  },

  // Texas Instruments
  {
    id: "app-6",
    jobId: "job-2",
    name: "Ananya Deshmukh",
    rollNo: "22EC089",
    department: "ECE",
    cgpa: 9.15,
    company: "Texas Instruments",
    role: "VLSI Hardware Engineer",
    stage: "Technical Round 2",
    appliedOn: "Oct 04, 2026",
    email: "ananya.d22@institution.edu",
    phone: "+91 97120 44521",
    skills: ["Verilog", "VHDL", "Digital System Design", "FPGA", "Cadence"],
    notes: "Exceptional mastery of ASIC verification testbenches.",
  },
  {
    id: "app-7",
    jobId: "job-2",
    name: "Sneha Mukherjee",
    rollNo: "22EC034",
    department: "ECE",
    cgpa: 9.18,
    company: "Texas Instruments",
    role: "VLSI Hardware Engineer",
    stage: "Selected",
    appliedOn: "Oct 05, 2026",
    email: "sneha.m22@institution.edu",
    phone: "+91 97654 32109",
    skills: ["Analog Circuits", "CMOS Design", "VLSI Layout", "Matlab"],
    notes: "Received offer letter from TI Analog Division with star sign-on bonus.",
  },
  {
    id: "app-8",
    jobId: "job-2",
    name: "Rahul Iyer",
    rollNo: "22EC052",
    department: "ECE",
    cgpa: 8.65,
    company: "Texas Instruments",
    role: "VLSI Hardware Engineer",
    stage: "Online Assessment",
    appliedOn: "Oct 07, 2026",
    email: "rahul.i22@institution.edu",
    phone: "+91 98112 33445",
    skills: ["Embedded C", "Microcontrollers", "Verilog"],
    notes: "Hardware aptitude evaluation completed.",
  },

  // Microsoft
  {
    id: "app-9",
    jobId: "job-3",
    name: "Siddharth Jain",
    rollNo: "22CS044",
    department: "CSE",
    cgpa: 9.05,
    company: "Microsoft",
    role: "Cloud & DevOps Engineer",
    stage: "Selected",
    appliedOn: "Oct 01, 2026",
    email: "siddharth.j22@institution.edu",
    phone: "+91 98450 67890",
    skills: ["Azure", "Docker", "Kubernetes", "C#", ".NET Core"],
    notes: "Offer confirmed for Cloud & AI Division Hyderabad.",
  },
  {
    id: "app-10",
    jobId: "job-3",
    name: "Neha Gupta",
    rollNo: "22CS110",
    department: "CSE",
    cgpa: 9.2,
    company: "Microsoft",
    role: "Cloud & DevOps Engineer",
    stage: "Technical Round 2",
    appliedOn: "Oct 03, 2026",
    email: "neha.g22@institution.edu",
    phone: "+91 99123 45678",
    skills: ["Distributed Computing", "Linux Internals", "Python", "Go"],
    notes: "Live coding on concurrency and fault-tolerant architecture cleared.",
  },
  {
    id: "app-11",
    jobId: "job-3",
    name: "Priya Nair",
    rollNo: "22IT067",
    department: "IT",
    cgpa: 8.5,
    company: "Microsoft",
    role: "Cloud & DevOps Engineer",
    stage: "Online Assessment",
    appliedOn: "Oct 06, 2026",
    email: "priya.n22@institution.edu",
    phone: "+91 97788 99001",
    skills: ["Cloud Security", "Terraform", "CI/CD Pipelines"],
    notes: "Round 1 assessment completed.",
  },

  // Deloitte USI
  {
    id: "app-12",
    jobId: "job-4",
    name: "Pooja Reddy",
    rollNo: "22CS077",
    department: "CSE",
    cgpa: 8.6,
    company: "Deloitte USI",
    role: "Technology Analyst",
    stage: "HR Round Scheduled",
    appliedOn: "Oct 02, 2026",
    email: "pooja.r22@institution.edu",
    phone: "+91 88412 99012",
    skills: ["SQL", "PowerBI", "Python", "Business Analytics"],
    notes: "Case interview cleared with partner distinction.",
  },
  {
    id: "app-13",
    jobId: "job-4",
    name: "Tanya Saxena",
    rollNo: "22EC098",
    department: "ECE",
    cgpa: 8.7,
    company: "Deloitte USI",
    role: "Technology Analyst",
    stage: "Selected",
    appliedOn: "Oct 01, 2026",
    email: "tanya.s22@institution.edu",
    phone: "+91 98877 66554",
    skills: ["Data Analytics", "Tableau", "Java", "Consulting"],
    notes: "Final offer released for Cyber & Tech Consulting practice.",
  },
  {
    id: "app-14",
    jobId: "job-4",
    name: "Varun Joshi",
    rollNo: "22CS155",
    department: "CSE",
    cgpa: 8.25,
    company: "Deloitte USI",
    role: "Technology Analyst",
    stage: "Technical Round 1",
    appliedOn: "Oct 05, 2026",
    email: "varun.j22@institution.edu",
    phone: "+91 97766 55443",
    skills: ["Oracle DB", "Python", "Cloud Fundamentals"],
    notes: "Technical evaluation slot assigned.",
  },

  // Tata Motors
  {
    id: "app-15",
    jobId: "job-5",
    name: "Vikram Malhotra",
    rollNo: "22ME051",
    department: "Mechanical",
    cgpa: 8.1,
    company: "Tata Motors",
    role: "GET - Automotive & EV",
    stage: "Selected",
    appliedOn: "Sep 28, 2026",
    email: "vikram.m22@institution.edu",
    phone: "+91 96540 11234",
    skills: ["SolidWorks", "ANSYS", "EV Powertrain", "Battery Thermal Management"],
    notes: "Offer issued for Tata Passenger Electric Mobility (TPEM) division.",
  },
  {
    id: "app-16",
    jobId: "job-5",
    name: "Kunal Sen",
    rollNo: "22RO008",
    department: "Robotics",
    cgpa: 8.8,
    company: "Tata Motors",
    role: "GET - Automotive & EV",
    stage: "Selected",
    appliedOn: "Oct 03, 2026",
    email: "kunal.s22@institution.edu",
    phone: "+91 98321 45678",
    skills: ["ROS2", "Autonomous Systems", "C++", "Sensor Fusion"],
    notes: "Selected for ADAS R&D engineering cohort.",
  },
];

const STAGE_BADGES: Record<Applicant["stage"], string> = {
  Selected: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "Technical Round 2": "text-primary-glow bg-primary/10 border-primary/20",
  "Technical Round 1": "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  "Online Assessment": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "HR Round Scheduled": "text-amber-500 bg-amber-500/10 border-amber-500/20",
};

export default function InstitutionTrackApplicantPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>("job-1");
  const [jobSearch, setJobSearch] = useState("");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Filtered jobs in Left Panel
  const filteredJobs = useMemo(() => {
    return JOBS_DATA.filter(
      (j) =>
        j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.department.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.location.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [jobSearch]);

  // Currently Selected Job
  const selectedJob = useMemo(() => {
    return JOBS_DATA.find((j) => j.id === selectedJobId) || JOBS_DATA[0];
  }, [selectedJobId]);

  // Applicants for the Selected Job in Right Panel
  const applicantsForSelectedJob = useMemo(() => {
    if (!selectedJobId) return [];
    return APPLICANTS_DATA.filter((a) => a.jobId === selectedJobId);
  }, [selectedJobId]);

  // Filtered applicants by stage & search query
  const filteredApplicants = useMemo(() => {
    return applicantsForSelectedJob.filter((a) => {
      const matchQuery =
        a.name.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        a.rollNo.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        a.department.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        a.skills.some((s) => s.toLowerCase().includes(applicantSearch.toLowerCase()));

      const matchStage =
        filterStage === "all" ||
        a.stage.toLowerCase().includes(filterStage.toLowerCase());

      return matchQuery && matchStage;
    });
  }, [applicantsForSelectedJob, applicantSearch, filterStage]);

  // CSV Export
  const handleExportCSV = () => {
    const dataToExport = filteredApplicants.length > 0 ? filteredApplicants : APPLICANTS_DATA;
    const headers = ["Student Name", "Roll No", "Department", "CGPA", "Company", "Role", "Stage", "Applied Date", "Email", "Phone"];
    const rows = dataToExport.map((a) => [
      `"${a.name}"`,
      `"${a.rollNo}"`,
      `"${a.department}"`,
      a.cgpa,
      `"${a.company}"`,
      `"${a.role}"`,
      `"${a.stage}"`,
      `"${a.appliedOn}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Applicant_Tracking_${selectedJob?.company || "All"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Track Applicant</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Live Candidate Tracking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Select a campus drive from the left panel to monitor student progression, test scores, and interview stage dossiers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface border border-border text-ink hover:text-primary-glow hover:border-primary/40 text-xs sm:text-sm font-bold transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Download className="w-4 h-4 text-primary-glow" />
          <span>Export All Tracking (CSV)</span>
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: Jobs Listed */}
        <div className="lg:col-span-4 xl:col-span-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col overflow-hidden">
          {/* Left Header & Search */}
          <div className="p-4 border-b border-border space-y-3 bg-surface-alt/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-glow" />
                <h2 className="text-sm font-extrabold text-ink">Campus Recruitment Drives</h2>
              </div>
              <span className="text-xs font-bold text-ink-soft bg-surface-alt px-2 py-0.5 rounded-full">
                {filteredJobs.length} listed
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                placeholder="Search jobs, companies, branch..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Jobs List (Scrollable Area) */}
          <div className="divide-y divide-border/60 max-h-[720px] overflow-y-auto scrollbar-thin p-2 space-y-1.5">
            {filteredJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-soft space-y-2">
                <Building2 className="w-7 h-7 mx-auto text-ink-soft/50" />
                <p>No recruitment drives found matching your search.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJobId === job.id;

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setFilterStage("all");
                      setApplicantSearch("");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-primary/10 border border-primary/40 shadow-xs ring-1 ring-primary/20"
                        : "bg-surface hover:bg-surface-alt/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold text-ink-soft uppercase tracking-wider block truncate">
                          {job.company}
                        </span>
                        <h3 className={`text-xs font-bold truncate ${isSelected ? "text-primary-glow font-black" : "text-ink"}`}>
                          {job.title}
                        </h3>
                      </div>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          job.status === "Interviewing"
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                            : job.status === "Active"
                            ? "text-primary-glow bg-primary/10 border-primary/20"
                            : "text-ink-soft bg-surface-alt border-border"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-ink-soft">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location} ({job.workMode})
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-emerald-500">{job.ctc}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                      <span className="text-ink-soft">
                        Applicants: <strong className="text-ink">{job.totalApplicants}</strong>
                      </span>
                      <span className="text-emerald-500 font-bold">
                        {job.selectedCount} Selected
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Selected Job Applicant Tracking */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {selectedJob ? (
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden flex flex-col">
              {/* Selected Job Banner */}
              <div className="p-4 sm:p-5 border-b border-border bg-surface-alt/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-ink">{selectedJob.title}</h2>
                      <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {selectedJob.company}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Targeting: {selectedJob.department} &bull; Drive Period: {selectedJob.driveDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-ink-soft block">Package</span>
                      <span className="font-extrabold text-emerald-500">{selectedJob.ctc}</span>
                    </div>
                    <div className="text-right pl-3 border-l border-border">
                      <span className="text-[10px] text-ink-soft block">Applicants</span>
                      <span className="font-extrabold text-ink">{applicantsForSelectedJob.length} candidates</span>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="text"
                      placeholder="Search students, roll no, skills..."
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {["all", "selected", "technical", "assessment", "hr"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStage(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                          filterStage === st
                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                            : "bg-surface-alt/60 text-ink-soft hover:text-ink hover:bg-surface-alt border border-border/60"
                        }`}
                      >
                        {st === "all" ? "All Stages" : st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applicants List / Table */}
              <div className="divide-y divide-border/60 min-h-[480px]">
                {filteredApplicants.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <Users className="w-8 h-8 mx-auto text-ink-soft/40" />
                    <p className="text-xs font-medium text-ink-soft">
                      No candidates match your current search and stage filters for this drive.
                    </p>
                  </div>
                ) : (
                  filteredApplicants.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-alt/40 transition"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-ink">{item.name}</span>
                          <span className="text-xs font-mono text-ink-soft">({item.rollNo})</span>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {item.cgpa} CGPA
                          </span>
                          <span className="text-[10px] text-ink-soft font-medium">
                            {item.department} &bull; Applied: {item.appliedOn}
                          </span>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {item.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[9.5px] px-2 py-0.5 bg-surface-alt rounded-md text-ink-soft border border-border/50"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            STAGE_BADGES[item.stage] || "text-ink bg-surface border-border"
                          }`}
                        >
                          {item.stage}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(item)}
                          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-alt border border-border text-ink hover:text-primary-glow text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary-glow" />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Empty State if no job is selected */
            <div className="bg-surface rounded-2xl border border-dashed border-border p-16 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-ink-soft mx-auto opacity-50" />
              <h3 className="text-base font-bold text-ink">No Recruitment Drive Selected</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Please select a listed campus recruitment job from the left panel to view candidates, test percentiles, and stage status.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Dossier Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold text-xs shadow-glow">
                  {selectedApplicant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">{selectedApplicant.name}</h3>
                  <span className="text-[10px] text-ink-soft font-mono">Roll: {selectedApplicant.rollNo}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-1 text-ink-soft hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-alt/60 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px]">Applied Position</span>
                <p className="font-bold text-ink text-sm">{selectedApplicant.role}</p>
                <p className="text-primary-glow font-medium">{selectedApplicant.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Academic CGPA</span>
                  <p className="text-lg font-black text-emerald-500">{selectedApplicant.cgpa} / 10.0</p>
                  <span className="text-[10px] text-ink-soft">{selectedApplicant.department} Department</span>
                </div>
                <div className="p-3 bg-surface-alt/40 rounded-xl border border-border">
                  <span className="text-ink-soft text-[10px]">Current Funnel Stage</span>
                  <p className="text-sm font-black text-primary-glow mt-0.5">{selectedApplicant.stage}</p>
                  <span className="text-[10px] text-ink-soft">Applied on {selectedApplicant.appliedOn}</span>
                </div>
              </div>

              {/* Skills Dossier */}
              <div>
                <span className="text-ink-soft text-[10px] block font-semibold mb-1">Verified Technical Skills</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedApplicant.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary-glow border border-primary/20 rounded-md text-[10.5px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluator Notes */}
              <div className="p-3 bg-surface-alt/30 rounded-xl border border-border space-y-1">
                <span className="text-ink-soft text-[10px] font-semibold block">Panel Assessment Notes</span>
                <p className="text-ink leading-relaxed text-[11px]">{selectedApplicant.notes}</p>
              </div>

              {/* Contact Credentials */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-soft pt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                  <span className="truncate">{selectedApplicant.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                  <span className="truncate">{selectedApplicant.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt text-ink text-xs font-bold hover:bg-surface-alt/80 transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
