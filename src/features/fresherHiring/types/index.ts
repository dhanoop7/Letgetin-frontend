import type { LucideIcon } from "lucide-react";

export type Tone = "green" | "blue" | "orange" | "red" | "gray" | "purple" | "emerald" | "amber";
export type CreateType = "candidate" | "drive" | "job" | "internship" | "apprenticeship" | "junior";
export type CandidateStage = "Screening" | "Assessment" | "Interview" | "Offer" | "Joined";

export type FresherTab =
  | "overview"
  | "candidates"
  | "drives"
  | "jobs"
  | "internships"
  | "apprenticeships"
  | "junior"
  | "assessment"
  | "interviews"
  | "offers"
  | "analytics";

export interface Status {
  label: string;
  tone: Tone;
}

export interface Kpi {
  id: string;
  label: string;
  icon?: LucideIcon;
  value: string;
  trend: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface ProgressItem {
  id: string;
  label: string;
  value: string;
  percent: number;
  color?: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  value: string;
  percent?: number;
  subtext?: string;
}

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  id: FresherTab;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface QuickLink {
  tab: FresherTab;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export interface Tile {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  category?: string;
}

export interface CampusEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  detail: string;
  type?: "In-Person" | "Virtual" | "Hybrid";
  location?: string;
  openings?: number;
}

export interface Candidate {
  id: string;
  initials: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  education: string;
  stream?: string;
  college: string;
  skills: string;
  score: string;
  assessmentScore?: number;
  target: string;
  stage: CandidateStage;
  location?: string;
  graduationYear?: number;
  cgpa?: string;
  verified?: boolean;
  actionLabel: string;
  actionMessage: string;
}

export interface Drive {
  id: string;
  title: string;
  detail: string;
  college: string;
  date: string;
  location: string;
  metrics: Metric[];
  status: Status;
}

export interface Program {
  id: string;
  name: string;
  department: string;
  duration: string;
  applicants: number;
  mentors: number;
  conversion: string;
  stipend?: string;
  status: Status;
}

export interface JuniorRole {
  id: string;
  title: string;
  department: string;
  experience: string;
  location: string;
  applicants: number;
  salary?: string;
  status: Status;
}

export interface Job {
  id: string;
  title: string;
  type: string;
  qualification: string;
  department?: string;
  applications: number;
  location?: string;
  salary?: string;
  status: Status;
}

export interface Interview {
  id: string;
  candidate: string;
  candidateInitials?: string;
  role: string;
  round: string;
  interviewer: string;
  date: string;
  time?: string;
  mode?: "Video" | "In-Person" | "AI";
  status: Status;
}

export interface CreateFormData {
  type: CreateType;
  title: string;
  hiringType: string;
  department: string;
  location: string;
  openPositions: number;
  startDate: string;
  description: string;
  skillsRequired?: string;
  stipendOrSalary?: string;
  qualification?: string;
}
