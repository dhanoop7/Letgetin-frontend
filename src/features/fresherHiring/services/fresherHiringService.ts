import {
  Candidate,
  CampusEvent,
  Drive,
  Interview,
  Job,
  JuniorRole,
  Kpi,
  PipelineStage,
  Program,
  ProgressItem,
  Tile,
  CreateFormData,
} from "../types";
import {
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  ShieldCheck,
  Brain,
  Code2,
  MessageSquareCode,
  Compass,
} from "lucide-react";

export const OVERVIEW_KPIS: Kpi[] = [
  {
    id: "kpi-active",
    label: "Active Freshers",
    icon: Users,
    value: "2,846",
    trend: "↑ 18.4% this month",
    trendDirection: "up",
    description: "Verified pre-screened graduates in talent pool",
  },
  {
    id: "kpi-jobs",
    label: "Open Opportunities",
    icon: Briefcase,
    value: "128",
    trend: "↑ 12 new this week",
    trendDirection: "up",
    description: "Active fresher, intern & junior job listings",
  },
  {
    id: "kpi-partners",
    label: "Campus Partners",
    icon: Building2,
    value: "142",
    trend: "↑ 6 added",
    trendDirection: "up",
    description: "Partner colleges across IITs, NITs & autonomous institutes",
  },
  {
    id: "kpi-shortlisted",
    label: "Shortlisted",
    icon: CheckCircle2,
    value: "416",
    trend: "↑ 9.7%",
    trendDirection: "up",
    description: "Candidates in active interview rounds",
  },
  {
    id: "kpi-joining",
    label: "Offer Joining Rate",
    icon: TrendingUp,
    value: "81.6%",
    trend: "↑ 4.2%",
    trendDirection: "up",
    description: "Accepted offers converted to on-schedule joiners",
  },
];

export const INTERNSHIP_KPIS: Kpi[] = [
  {
    id: "ikpi-1",
    label: "Active Interns",
    icon: Users,
    value: "184",
    trend: "↑ 22 this month",
    trendDirection: "up",
    description: "Interns undergoing structured tracks",
  },
  {
    id: "ikpi-2",
    label: "Open Programs",
    icon: Briefcase,
    value: "31",
    trend: "8 urgent",
    trendDirection: "up",
    description: "Active internship batches open for applications",
  },
  {
    id: "ikpi-3",
    label: "PPO Conversion Rate",
    icon: Award,
    value: "64%",
    trend: "↑ 8.1%",
    trendDirection: "up",
    description: "Interns offered full-time pre-placement offers",
  },
];

export const ANALYTICS_KPIS: Kpi[] = [
  {
    id: "akpi-1",
    label: "Avg. Time to Hire",
    icon: Clock,
    value: "14.2 Days",
    trend: "↓ 2.8 days faster",
    trendDirection: "up",
    description: "From application to offer letter rollout",
  },
  {
    id: "akpi-2",
    label: "Cost per Fresher Hire",
    icon: TrendingUp,
    value: "₹8,420",
    trend: "↓ 11.4% cost saving",
    trendDirection: "up",
    description: "Estimated total recruitment spend per hire",
  },
  {
    id: "akpi-3",
    label: "Offer Acceptance Rate",
    icon: ShieldCheck,
    value: "87.6%",
    trend: "↑ 3.9% vs last year",
    trendDirection: "up",
    description: "Percentage of candidates accepting offers",
  },
  {
    id: "akpi-4",
    label: "90-Day Retention Rate",
    icon: Award,
    value: "94.1%",
    trend: "↑ 2.2% retention",
    trendDirection: "up",
    description: "New hires retaining post probationary review",
  },
];

export const HIRING_PIPELINE: PipelineStage[] = [
  { id: "pipe-1", label: "Applications", value: "2,846", percent: 100, subtext: "Total campus applications" },
  { id: "pipe-2", label: "AI & ATS Screened", value: "1,732", percent: 72, subtext: "Passed resume matching & criteria" },
  { id: "pipe-3", label: "Assessment Test", value: "916", percent: 51, subtext: "Aptitude & domain coding cleared" },
  { id: "pipe-4", label: "Interview Rounds", value: "548", percent: 38, subtext: "Tech & HR panel interviews" },
  { id: "pipe-5", label: "Offer & Joined", value: "226", percent: 25, subtext: "Final hires on track" },
];

export const HIRING_MIX: ProgressItem[] = [
  { id: "mix-1", label: "Campus Recruitment Drives", value: "42%", percent: 42, color: "bg-primary" },
  { id: "mix-2", label: "Internships with PPO", value: "23%", percent: 23, color: "bg-purple-500" },
  { id: "mix-3", label: "Govt / NATS Apprenticeships", value: "17%", percent: 17, color: "bg-amber-500" },
  { id: "mix-4", label: "Junior Employee (0-2 Yrs)", value: "18%", percent: 18, color: "bg-emerald-500" },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    initials: "RS",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    education: "B.Tech Computer Science",
    stream: "Engineering & Tech",
    college: "IIT Madras",
    skills: "React, Node.js, TypeScript, PostgreSQL, Docker",
    score: "94%",
    assessmentScore: 94,
    target: "Junior Full Stack Engineer",
    stage: "Assessment",
    location: "Chennai, Tamil Nadu",
    graduationYear: 2026,
    cgpa: "9.2 / 10",
    verified: true,
    actionLabel: "View Dossier",
    actionMessage: "Candidate profile dossier opened for Rahul Sharma",
  },
  {
    id: "c2",
    initials: "AN",
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    education: "B.Tech AI & Data Science",
    stream: "Data & AI",
    college: "BITS Pilani",
    skills: "Python, PyTorch, Pandas, Scikit-Learn, FastAPI",
    score: "91%",
    assessmentScore: 91,
    target: "AI / Data Science Associate",
    stage: "Interview",
    location: "Hyderabad, Telangana",
    graduationYear: 2026,
    cgpa: "8.9 / 10",
    verified: true,
    actionLabel: "Schedule Panel",
    actionMessage: "Interview scheduler opened for Ananya Iyer",
  },
  {
    id: "c3",
    initials: "FM",
    name: "Fathima Maryam",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    education: "B.Com / MBA (Finance)",
    stream: "Business & Operations",
    college: "St. Teresa's College",
    skills: "Corporate Finance, Tally ERP, Financial Modeling, SQL",
    score: "88%",
    assessmentScore: 88,
    target: "Finance Associate Trainee",
    stage: "Offer",
    location: "Kochi, Kerala",
    graduationYear: 2026,
    cgpa: "8.8 / 10",
    verified: true,
    actionLabel: "Release Offer",
    actionMessage: "Offer letter creation workflow opened for Fathima Maryam",
  },
  {
    id: "c4",
    initials: "VK",
    name: "Vishnu Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    education: "BCA / MCA",
    stream: "Engineering & Tech",
    college: "MES College of Engineering",
    skills: "Java, Spring Boot, Selenium, REST APIs, MySQL",
    score: "85%",
    assessmentScore: 85,
    target: "Associate QA / Backend Engineer",
    stage: "Screening",
    location: "Kochi, Kerala",
    graduationYear: 2026,
    cgpa: "8.4 / 10",
    verified: true,
    actionLabel: "Shortlist",
    actionMessage: "Vishnu Kumar shortlisted for assessment round",
  },
  {
    id: "c5",
    initials: "RK",
    name: "Rohan Kulkarni",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    education: "B.Des Interaction Design",
    stream: "Design & UX",
    college: "NID Ahmedabad",
    skills: "Figma, Design Systems, UX Research, Micro-interactions",
    score: "89%",
    assessmentScore: 89,
    target: "Associate Product Designer",
    stage: "Interview",
    location: "Bengaluru, Karnataka",
    graduationYear: 2026,
    cgpa: "8.9 / 10",
    verified: true,
    actionLabel: "Schedule Panel",
    actionMessage: "Design portfolio review panel opened for Rohan Kulkarni",
  },
  {
    id: "c6",
    initials: "PN",
    name: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    education: "B.Tech Information Tech",
    stream: "Engineering & Tech",
    college: "NIT Trichy",
    skills: "AWS, Linux, Terraform, Kubernetes, CI/CD, Go",
    score: "92%",
    assessmentScore: 92,
    target: "Cloud & DevOps Intern / Trainee",
    stage: "Assessment",
    location: "Bengaluru, Karnataka",
    graduationYear: 2026,
    cgpa: "8.7 / 10",
    verified: true,
    actionLabel: "View Scorecard",
    actionMessage: "Technical assessment scorecard opened for Priya Nair",
  },
];

export const EVENTS: CampusEvent[] = [
  {
    id: "ev-1",
    day: "12",
    month: "OCT",
    title: "Campus Drive — Rajagiri School of Engineering",
    detail: "Kochi, Kerala • 10:00 AM • 18 Open Positions • B.Tech CSE & ECE",
    type: "In-Person",
    location: "Kochi",
    openings: 18,
  },
  {
    id: "ev-2",
    day: "17",
    month: "OCT",
    title: "National Virtual Graduate Hiring Day 2026",
    detail: "Online / Remote • 25 Open Positions • Full Stack & Data Analysts",
    type: "Virtual",
    location: "Online",
    openings: 25,
  },
  {
    id: "ev-3",
    day: "22",
    month: "OCT",
    title: "Design & Product Internship Hack & Screen",
    detail: "Bengaluru / Online • 12 Open Positions • UI/UX & Product Associates",
    type: "Hybrid",
    location: "Bengaluru",
    openings: 12,
  },
];

export const INITIAL_DRIVES: Drive[] = [
  {
    id: "d1",
    title: "Rajagiri College of Engineering & Technology — On-Campus Drive",
    detail: "12 Oct 2026 • Kochi, Kerala • Pre-placement talk + Assessment + Technical Interviews",
    college: "Rajagiri School of Engineering",
    date: "12 Oct 2026",
    location: "Kochi, Kerala",
    metrics: [
      { label: "Registered Students", value: "248" },
      { label: "Open Positions", value: "18" },
      { label: "Shortlisted", value: "36" },
      { label: "Target Stream", value: "B.Tech CSE/IT" },
    ],
    status: { label: "Upcoming", tone: "blue" },
  },
  {
    id: "d2",
    title: "National Virtual Graduate Hiring Day 2026",
    detail: "17 Oct 2026 • Pan-India Virtual • Multi-university Engineering & Tech Trainee Intake",
    college: "Tier 1 & Autonomous Consortium",
    date: "17 Oct 2026",
    location: "Pan-India / Virtual",
    metrics: [
      { label: "Registered Students", value: "514" },
      { label: "Open Positions", value: "25" },
      { label: "Shortlisted", value: "71" },
      { label: "Target Stream", value: "CS / AI / MCA" },
    ],
    status: { label: "Registration Open", tone: "orange" },
  },
  {
    id: "d3",
    title: "St. Teresa's College — Commerce & Management Drive",
    detail: "Completed • 7 Oct 2026 • Finance Associate & Business Operations Trainees",
    college: "St. Teresa's College (Autonomous)",
    date: "7 Oct 2026",
    location: "Ernakulam, Kerala",
    metrics: [
      { label: "Total Applicants", value: "173" },
      { label: "Offers Extended", value: "14" },
      { label: "Accepted & Joining", value: "12" },
      { label: "Avg Package", value: "₹4.8 LPA" },
    ],
    status: { label: "Completed", tone: "green" },
  },
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    name: "Software Engineering Intern (Summer & Full-Time PPO)",
    department: "Technology",
    duration: "6 months",
    applicants: 328,
    mentors: 8,
    conversion: "72% PPO",
    stipend: "₹25,000 / mo",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "prog-2",
    name: "Digital Product Marketing & Growth Intern",
    department: "Marketing",
    duration: "3 months",
    applicants: 142,
    mentors: 4,
    conversion: "58% PPO",
    stipend: "₹18,000 / mo",
    status: { label: "Hiring", tone: "blue" },
  },
  {
    id: "prog-3",
    name: "People Operations & HR Intern",
    department: "Human Resources",
    duration: "3 months",
    applicants: 97,
    mentors: 3,
    conversion: "61% PPO",
    stipend: "₹15,000 / mo",
    status: { label: "Hiring", tone: "blue" },
  },
];

export const APPRENTICESHIP_PIPELINE: ProgressItem[] = [
  { id: "app-1", label: "Applications Received", value: "436", percent: 100, color: "bg-primary" },
  { id: "app-2", label: "NATS / Govt Eligibility Verified", value: "302", percent: 69, color: "bg-blue-500" },
  { id: "app-3", label: "Structured On-Job Training Started", value: "186", percent: 43, color: "bg-amber-500" },
  { id: "app-4", label: "Permanent Full-time Conversion", value: "92", percent: 21, color: "bg-emerald-500" },
];

export const PROGRAM_CONTROLS = [
  "NATS / NEEM Statutory Compliance & Eligibility Checks",
  "Quarterly Skill Milestones & Technical Logbooks",
  "Dedicated Senior Mentor Assignment & Reviews",
  "Automated Attendance & Stipend Disbursement Integration",
  "Mid-term Objective Assessment Checkpoints",
  "Conversion into Permanent Roles with Experience Credit",
];

export const INITIAL_JUNIOR_ROLES: JuniorRole[] = [
  {
    id: "jr-1",
    title: "Junior Software Engineer (React / Node)",
    department: "Engineering",
    experience: "0–2 years",
    location: "Kochi / Remote",
    applicants: 184,
    salary: "₹4.5 - ₹7.0 LPA",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "jr-2",
    title: "Junior Business & Product Analyst",
    department: "Product",
    experience: "0–1 year",
    location: "Bengaluru, Karnataka",
    applicants: 96,
    salary: "₹5.0 - ₹7.5 LPA",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "jr-3",
    title: "Customer Success & Onboarding Associate",
    department: "Customer Success",
    experience: "0–2 years",
    location: "Remote / Hybrid",
    applicants: 137,
    salary: "₹3.8 - ₹5.5 LPA",
    status: { label: "Urgent", tone: "orange" },
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Graduate Software Trainee (2026 Batch)",
    type: "Fresher Full-Time",
    qualification: "B.Tech CSE / IT / MCA",
    department: "Engineering",
    applications: 422,
    location: "Bengaluru / Kochi",
    salary: "₹5.0 - ₹8.0 LPA",
    status: { label: "Open", tone: "green" },
  },
  {
    id: "job-2",
    title: "Associate Finance & Accounts Executive",
    type: "Fresher Full-Time",
    qualification: "B.Com / BBA / MBA",
    department: "Finance",
    applications: 187,
    location: "Kochi, Kerala",
    salary: "₹3.6 - ₹5.0 LPA",
    status: { label: "Open", tone: "green" },
  },
  {
    id: "job-3",
    title: "UI/UX Product Design Trainee",
    type: "Internship + Full-time",
    qualification: "Any Degree + Portfolio",
    department: "Product & Design",
    applications: 96,
    location: "Remote / Hybrid",
    salary: "₹4.0 - ₹6.5 LPA",
    status: { label: "Hiring", tone: "blue" },
  },
];

export const ASSESSMENT_TILES: Tile[] = [
  {
    id: "ass-1",
    title: "General Aptitude & Reasoning",
    description: "Quantitative aptitude, logical reasoning, verbal comprehension and analytical problem solving.",
    icon: Brain,
    category: "Foundational",
  },
  {
    id: "ass-2",
    title: "Technical & Coding Sandboxes",
    description: "Hands-on browser coding tests for JavaScript, Python, Java, SQL, and Data Structures.",
    icon: Code2,
    category: "Technical",
  },
  {
    id: "ass-3",
    title: "Domain Communication & English",
    description: "AI-graded spoken and written communication, email etiquette, and client simulation.",
    icon: MessageSquareCode,
    category: "Communication",
  },
  {
    id: "ass-4",
    title: "Psychometric & Workplace Culture Fit",
    description: "Work style, adaptability, collaboration index, and growth-mindset evaluation rubric.",
    icon: Compass,
    category: "Behavioral",
  },
];

export const ASSESSMENT_PERFORMANCE: ProgressItem[] = [
  { id: "ap-1", label: "Completed Assessment", value: "78% Candidates", percent: 78, color: "bg-primary" },
  { id: "ap-2", label: "Scored Above Cutoff (>70%)", value: "61% Cleared", percent: 61, color: "bg-emerald-500" },
  { id: "ap-3", label: "Top Percentile Performers (>90%)", value: "18% Elite", percent: 18, color: "bg-amber-500" },
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: "int-1",
    candidate: "Rahul Sharma",
    candidateInitials: "RS",
    role: "Junior Full Stack Engineer",
    round: "Technical Interview (Round 1)",
    interviewer: "Arun Kumar (Lead Architect)",
    date: "10 Oct 2026",
    time: "11:00 AM",
    mode: "Video",
    status: { label: "Scheduled", tone: "orange" },
  },
  {
    id: "int-2",
    candidate: "Ananya Iyer",
    candidateInitials: "AN",
    role: "AI / Data Science Associate",
    round: "Managerial & Problem Solving",
    interviewer: "Priya Rajan (Director of AI)",
    date: "10 Oct 2026",
    time: "03:00 PM",
    mode: "Video",
    status: { label: "Scheduled", tone: "orange" },
  },
  {
    id: "int-3",
    candidate: "Vishnu Kumar",
    candidateInitials: "VK",
    role: "Associate QA Engineer",
    round: "HR & Culture Assessment",
    interviewer: "Meera Suresh (HR Manager)",
    date: "11 Oct 2026",
    time: "10:00 AM",
    mode: "Video",
    status: { label: "Pending", tone: "gray" },
  },
];

export const OFFER_PIPELINE: PipelineStage[] = [
  { id: "off-1", label: "Offers Extended", value: "226", percent: 100, subtext: "Formal offer letters issued" },
  { id: "off-2", label: "Offers Accepted", value: "198", percent: 87, subtext: "Signed acceptance received" },
  { id: "off-3", label: "Pre-boarding & Verified", value: "184", percent: 81, subtext: "Docs & background check cleared" },
  { id: "off-4", label: "Joined & Inducted", value: "42", percent: 23, subtext: "Active in first 30 days" },
];

export const JOINING_RISK: ProgressItem[] = [
  { id: "risk-1", label: "Low Risk of Drop-off (High engagement)", value: "72%", percent: 72, color: "bg-emerald-500" },
  { id: "risk-2", label: "Medium Risk (Multiple campus offers)", value: "19%", percent: 19, color: "bg-amber-500" },
  { id: "risk-3", label: "High Risk (Pending documentation)", value: "9%", percent: 9, color: "bg-red-500" },
];

export const SOURCE_EFFECTIVENESS: ProgressItem[] = [
  { id: "src-1", label: "Campus Partner Universities", value: "34% of Total Hires", percent: 82, color: "bg-primary" },
  { id: "src-2", label: "Employee & Alumni Referrals", value: "26% of Total Hires", percent: 65, color: "bg-purple-500" },
  { id: "src-3", label: "LetGetIn Fresher Marketplace", value: "23% of Total Hires", percent: 58, color: "bg-blue-500" },
  { id: "src-4", label: "Virtual Hackathons & Social", value: "17% of Total Hires", percent: 43, color: "bg-amber-500" },
];

export const QUALITY_OF_HIRE: ProgressItem[] = [
  { id: "qoh-1", label: "Manager Satisfaction Score", value: "4.5 / 5.0 Rating", percent: 90, color: "bg-primary" },
  { id: "qoh-2", label: "Performance Rating After 90 Days", value: "4.4 / 5.0 Rating", percent: 88, color: "bg-emerald-500" },
  { id: "qoh-3", label: "First Year Retention Index", value: "94.1% Retained", percent: 94, color: "bg-blue-500" },
];

class FresherHiringService {
  async getOverviewKpis(): Promise<Kpi[]> {
    return OVERVIEW_KPIS;
  }

  async getCandidates(params?: {
    search?: string;
    qualification?: string;
    stage?: string;
    location?: string;
  }): Promise<Candidate[]> {
    let list = [...INITIAL_CANDIDATES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.skills.toLowerCase().includes(q) ||
          c.college.toLowerCase().includes(q) ||
          c.target.toLowerCase().includes(q)
      );
    }
    if (params?.qualification && params.qualification !== "All Qualifications") {
      const qual = params.qualification.toLowerCase();
      list = list.filter((c) => c.education.toLowerCase().includes(qual));
    }
    if (params?.stage && params.stage !== "All Stages") {
      list = list.filter((c) => c.stage === params.stage);
    }
    if (params?.location && params.location !== "All Locations") {
      const loc = params.location.split(",")[0].toLowerCase();
      list = list.filter((c) => c.location?.toLowerCase().includes(loc));
    }
    return list;
  }

  async getDrives(params?: { search?: string; status?: string; college?: string }): Promise<Drive[]> {
    let list = [...INITIAL_DRIVES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.college.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== "All Drive Status") {
      list = list.filter((d) => d.status.label.toLowerCase() === params.status?.toLowerCase());
    }
    return list;
  }

  async getJobs(): Promise<Job[]> {
    return INITIAL_JOBS;
  }

  async getPrograms(): Promise<Program[]> {
    return INITIAL_PROGRAMS;
  }

  async getJuniorRoles(): Promise<JuniorRole[]> {
    return INITIAL_JUNIOR_ROLES;
  }

  async getInterviews(): Promise<Interview[]> {
    return INITIAL_INTERVIEWS;
  }

  async submitCreateForm(formData: CreateFormData): Promise<{ success: boolean; message: string }> {
    // Simulated service call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `${formData.title} has been successfully created in Fresher Hiring!`,
        });
      }, 400);
    });
  }
}

export const fresherHiringService = new FresherHiringService();
