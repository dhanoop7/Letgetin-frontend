import {
  LayoutGrid,
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  Wrench,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  BarChart3,
} from "lucide-react";
import type { NavGroup, QuickLink, FresherTab } from "../types";

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Recruitment",
    items: [
      { path: "/recruiter/fresher-hiring?tab=overview", icon: LayoutGrid, label: "Overview", id: "overview" },
      { path: "/recruiter/fresher-hiring?tab=candidates", icon: Users, label: "Candidates", id: "candidates" },
      { path: "/recruiter/fresher-hiring?tab=jobs", icon: Briefcase, label: "Fresher Jobs", id: "jobs" },
      { path: "/recruiter/fresher-hiring?tab=drives", icon: Building2, label: "Campus Drives", id: "drives" },
      { path: "/recruiter/fresher-hiring?tab=internships", icon: GraduationCap, label: "Internships", id: "internships" },
      { path: "/recruiter/fresher-hiring?tab=apprenticeships", icon: Wrench, label: "Apprenticeships", id: "apprenticeships" },
      { path: "/recruiter/fresher-hiring?tab=junior", icon: Sparkles, label: "Junior Hiring", id: "junior" },
    ],
  },
  {
    label: "Assessment & Screening",
    items: [
      { path: "/recruiter/fresher-hiring?tab=assessment", icon: CheckCircle2, label: "Tests & Assessments", id: "assessment" },
      { path: "/recruiter/fresher-hiring?tab=interviews", icon: CalendarDays, label: "Interviews", id: "interviews" },
    ],
  },
  {
    label: "Pipeline & Analytics",
    items: [
      { path: "/recruiter/fresher-hiring?tab=offers", icon: FileCheck, label: "Offers & Joining", id: "offers" },
      { path: "/recruiter/fresher-hiring?tab=analytics", icon: BarChart3, label: "Analytics & Reports", id: "analytics" },
    ],
  },
];

export const TOP_TABS: { id: FresherTab; label: string; icon: typeof LayoutGrid; count?: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "candidates", label: "Candidates", icon: Users, count: "2.8k" },
  { id: "drives", label: "Campus Drives", icon: Building2, count: "18" },
  { id: "jobs", label: "Fresher Jobs", icon: Briefcase, count: "128" },
  { id: "internships", label: "Internships", icon: GraduationCap, count: "31" },
  { id: "apprenticeships", label: "Apprenticeships", icon: Wrench },
  { id: "junior", label: "Junior Roles", icon: Sparkles, count: "42" },
  { id: "assessment", label: "Assessments", icon: CheckCircle2 },
  { id: "interviews", label: "Interviews", icon: CalendarDays, count: "3" },
  { id: "offers", label: "Offers", icon: FileCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export const QUICK_LINKS: QuickLink[] = [
  {
    tab: "drives",
    icon: Building2,
    title: "Campus Drives & Placements",
    description: "Partner with top 140+ university campuses and conduct automated pool drives.",
    badge: "18 Active Drives",
  },
  {
    tab: "internships",
    icon: GraduationCap,
    title: "Internship & PPO Programs",
    description: "3 to 6-month graduate internship cohorts with mentor reviews & direct PPO conversion.",
    badge: "64% Conversion",
  },
  {
    tab: "apprenticeships",
    icon: Wrench,
    title: "Apprenticeships & NATS",
    description: "Structured learn-and-earn workforce tracks adhering to apprentice guidelines.",
    badge: "Govt. Compliant",
  },
  {
    tab: "junior",
    icon: Sparkles,
    title: "Junior Lateral Hiring",
    description: "Target high-potential early career talent with 0 to 2 years of domain experience.",
    badge: "42 Openings",
  },
];
