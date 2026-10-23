"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Zap,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Crown,
  Sparkles,
  History,
  Copy,
  Gift,
  Loader2,
  Check,
  Layers,
  HelpCircle,
  CreditCard,
  Building2,
  Rocket,
  GraduationCap,
  Briefcase,
  FileText,
  FileCheck2,
  Brain,
  MessageSquare,
  Bot,
  BookOpen,
  Award,
  ExternalLink,
  Clock,
  Send,
  Calendar,
  Compass,
  Megaphone,
  TrendingUp,
  Tv,
  CheckCheck,
} from "lucide-react";
import {
  creditService,
  WalletData,
  CreditTopupPack,
  SubscriptionPlanItem,
  UserSubscription,
  CandidatePlanItem,
  CandidateCategoryGroup,
  CompanyPlanItem,
  CompanyCategoryGroup,
  StartupPlanItem,
  StartupCategoryGroup,
  InstitutionPlanItem,
  InstitutionCategoryGroup,
} from "../services/creditService";
import { InsufficientCreditsModal } from "@/components/common/InsufficientCreditsModal";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface CreditPurchaseViewProps {
  role?: "recruiter" | "candidate" | "user" | "institution" | "startup";
  embedded?: boolean;
  initialTab?: "plans" | "company_plans" | "startup_plans" | "institution_plans" | "subscriptions" | "topup" | "history";
  hideHeaderBanner?: boolean;
}

const DEFAULT_CANDIDATE_CATEGORIES: CandidateCategoryGroup[] = [
  {
    id: "resume_services",
    title: "Resume Services",
    description: "AI-driven resume optimization and profile verification",
    items: [
      { id: "ats_resume", name: "ATS Resume", chargingUnit: "Per resume processed", credits: 30, priceInr: 300, category: "resume_services", description: "Deep ATS optimization, score breakdown, and keywords match" },
      { id: "verified_resume", name: "Verified Resume", chargingUnit: "Per resume verification", credits: 30, priceInr: 300, category: "resume_services", description: "Document verification badge for profile authenticity" },
    ],
  },
  {
    id: "ai_apply",
    title: "AI Apply Packages",
    description: "Automated multi-job application packages with time-bounded limits",
    items: [
      { id: "ai_apply_10jobs_1day", name: "AI Apply — 10 jobs/day", chargingUnit: "1-day package", credits: 20, priceInr: 200, category: "ai_apply", description: "Automated submission up to 10 matching jobs valid for 1 day" },
      { id: "ai_apply_20jobs_7days", name: "AI Apply — 20 jobs / 1 week", chargingUnit: "7-day package", credits: 40, priceInr: 400, category: "ai_apply", description: "Automated submission up to 20 matching jobs valid for 7 days" },
      { id: "ai_apply_50jobs_10days", name: "AI Apply — 50 jobs / 10 days", chargingUnit: "10-day package", credits: 50, priceInr: 500, category: "ai_apply", description: "Automated submission up to 50 matching jobs valid for 10 days" },
    ],
  },
  {
    id: "mockups_and_assessments",
    title: "Mockups and Assessments",
    description: "Simulated assessments, mock interviews, and cognitive evaluations",
    items: [
      { id: "mockup_assessment", name: "Mockup Assessment", chargingUnit: "Per candidate assessment", credits: 20, priceInr: 200, category: "mockups_and_assessments", description: "Interactive skill and domain assessment generated from job description" },
      { id: "mockup_interview", name: "Mockup Interview", chargingUnit: "Per candidate interview", credits: 20, priceInr: 200, category: "mockups_and_assessments", description: "Live AI-assisted mock interview session with feedback" },
      { id: "psychometric_test", name: "Psychometric Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "mockups_and_assessments", description: "Personality and workplace behavioral assessment" },
      { id: "genius_test", name: "Genius Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "mockups_and_assessments", description: "Cognitive aptitude, logic, and problem-solving evaluation" },
      { id: "linguistic_test", name: "Linguistic Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "mockups_and_assessments", description: "Language proficiency and business communication analysis" },
    ],
  },
  {
    id: "career_guidance_and_learning",
    title: "Career Guidance and Learning",
    description: "Mentorship, skill enhancements, certifications, and on-job training",
    items: [
      { id: "career_counselling_ai", name: "Career Counselling — AI", chargingUnit: "Per session", credits: 3, priceInr: 30, category: "career_guidance_and_learning", description: "Instant career roadmap and role transition advisory powered by AI" },
      { id: "career_counselling_manual", name: "Career Counselling — Manual", chargingUnit: "Per session", credits: 30, priceInr: 300, category: "career_guidance_and_learning", description: "1-on-1 human expert career advisory and mentoring session" },
      { id: "skills_enhancement", name: "Skills Enhancement", chargingUnit: "Per course/programme", credits: 30, priceInr: 300, category: "career_guidance_and_learning", description: "Targeted skill improvement courses tailored to high-demand roles" },
      { id: "language_training", name: "Language Training", chargingUnit: "Per course/module", credits: 20, priceInr: 200, category: "career_guidance_and_learning", description: "Professional language and communication training modules" },
      { id: "certificate_courses", name: "Certificate Courses", chargingUnit: "Per course", credits: 50, priceInr: 500, category: "career_guidance_and_learning", description: "Industry-aligned certificate course with verified credential" },
      { id: "on_job_training", name: "On-job Training", chargingUnit: "Per programme", credits: 100, priceInr: 1000, category: "career_guidance_and_learning", description: "Hands-on apprenticeship and real-world project training programme" },
      { id: "skills_certifications", name: "Skills Certifications Courses", chargingUnit: "Per course/certification", credits: 30, priceInr: 300, category: "career_guidance_and_learning", description: "Standardized technical certification exams and badges" },
    ],
  },
];

const CANDIDATE_ACTION_ROUTES: Record<string, { route: string; label: string }> = {
  ats_resume: { route: "/resume", label: "Optimize Resume" },
  verified_resume: { route: "/verified-resume", label: "Verify Resume" },
  mockup_assessment: { route: "/interviews/assessment", label: "Start Assessment" },
  mockup_interview: { route: "/interviews/mock", label: "Mock Interview" },
  psychometric_test: { route: "/psychometric-test", label: "Take Test" },
  genius_test: { route: "/geniustest", label: "Take Test" },
  linguistic_test: { route: "/linguistic-test", label: "Take Test" },
  skills_enhancement: { route: "/skills", label: "View Courses" },
  career_counselling_ai: { route: "/career-guidance/ai", label: "AI Counselling" },
  career_counselling_manual: { route: "/career-guidance/personal", label: "Book Session" },
  language_training: { route: "/training", label: "Start Training" },
  certificate_courses: { route: "/exams", label: "Certifications" },
  on_job_training: { route: "/training", label: "Explore Training" },
  skills_certifications: { route: "/exams", label: "Certifications" },
};

const DEFAULT_COMPANY_CATEGORIES: CompanyCategoryGroup[] = [
  {
    id: "job_posting_recruitment",
    title: "Job Posting & Recruitment Activities",
    description: "Standard & premium job postings, verified candidate resumes, AI hiring, and background checks",
    items: [
      { id: "standard_job_posting", name: "Create Job Posting — Standard", chargingUnit: "Per job posting", credits: 10, priceInr: 100, category: "job_posting_recruitment", description: "Publish standard job post with applicant tracking and pipeline match", actionUrl: "/recruiter/jobs/create" },
      { id: "premium_job_posting", name: "Create Job Posting — PremiumS", chargingUnit: "Per job posting", credits: 20, priceInr: 200, category: "job_posting_recruitment", description: "High-visibility premium job post with accelerated multi-channel distribution", actionUrl: "/recruiter/jobs/create" },
      { id: "verified_resume", name: "Verified Resume", chargingUnit: "Per resume verification", credits: 30, priceInr: 300, category: "job_posting_recruitment", description: "In-depth candidate credentials, employment history, and education check", actionUrl: "/recruiter/candidates" },
      { id: "ai_hire", name: "AI Hire", chargingUnit: "Per candidate processed", credits: 50, priceInr: 500, category: "job_posting_recruitment", description: "Full automated AI-driven shortlisting, dynamic interview, and ranked evaluation", actionUrl: "/recruiter/jobs" },
      { id: "domain_check", name: "Domain Check", chargingUnit: "Per check", credits: 20, priceInr: 200, category: "job_posting_recruitment", description: "Tailored domain assessment generation and candidate score report", actionUrl: "/recruiter/assessment" },
      { id: "bg_verification", name: "BG Verification", chargingUnit: "Per verification", credits: 30, priceInr: 300, category: "job_posting_recruitment", description: "Professional background screening with platform verification report", providerFeeNote: "30 platform credits + applicable external provider fee", actionUrl: "/recruiter/background-verification" },
    ],
  },
  {
    id: "promotions_explore",
    title: "Company Promotions & Explore Opportunities",
    description: "High-impact brand visibility, 7-day front-page placements, social boosts, and job fair features",
    items: [
      { id: "promo_landing_page", name: "List on the Landing Pages", chargingUnit: "Per campaign", credits: 50, priceInr: 500, category: "promotions_explore", description: "Prime hero section feature on candidate & public homepages" },
      { id: "promo_featured_jobs", name: "Featured Jobs", chargingUnit: "Per featured placement", credits: 30, priceInr: 300, category: "promotions_explore", description: "Highlighted placement at the top of candidate search results" },
      { id: "promo_recently_posted", name: "Recently Posted", chargingUnit: "Per promoted listing", credits: 10, priceInr: 100, category: "promotions_explore", description: "Boost position in Recently Posted feeds for active candidates" },
      { id: "promo_first_page_7d", name: "Stay on the First Page", chargingUnit: "7-day placement", credits: 50, priceInr: 500, category: "promotions_explore", durationDays: 7, description: "Guaranteed front-page ranking across discovery feeds for 7 full days" },
      { id: "promo_front_row_7d", name: "Stay in the Front Row / Top Row", chargingUnit: "7-day placement", credits: 75, priceInr: 750, category: "promotions_explore", durationDays: 7, description: "Pinned top-row banner placement in category listings for 7 days" },
      { id: "promo_social_media", name: "Promote on Social Media", chargingUnit: "Per campaign", credits: 30, priceInr: 300, category: "promotions_explore", description: "Multi-platform social outreach blast across LinkedIn and Twitter feeds" },
      { id: "promo_job_fair", name: "Promote on Job Fair", chargingUnit: "Per campaign", credits: 100, priceInr: 1000, category: "promotions_explore", description: "Exclusive virtual and physical job fair spotlight exhibition booth" },
      { id: "promo_advertisement", name: "Advertisement", chargingUnit: "By placement and duration", credits: 0, priceInr: 0, category: "promotions_explore", caseByCase: true, description: "Custom enterprise banner placements and sponsor campaigns (Case-by-case / To be agreed)" },
    ],
  },
  {
    id: "career_guidance_workforce",
    title: "Career Guidance & Workforce Suite",
    description: "Workforce assessments, psychological profiling, executive mentoring, and skills certification",
    items: [
      { id: "psychometric_test", name: "Psychometric Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_workforce", description: "Workplace personality, cultural alignment, and situational judgment", actionUrl: "/recruiter/psychometric-test" },
      { id: "genius_test", name: "Genius Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_workforce", description: "Cognitive aptitude, logic, and analytical problem solving", actionUrl: "/recruiter/genius-test" },
      { id: "linguistic_test", name: "Linguistic Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_workforce", description: "Language proficiency and workplace communication assessment", actionUrl: "/recruiter/linguistic-test" },
      { id: "skills_enhancement", name: "Skills Enhancement", chargingUnit: "Per course/programme", credits: 30, priceInr: 300, category: "career_guidance_workforce", description: "Employee upskilling curriculum and role transformation track", actionUrl: "/recruiter/training" },
      { id: "career_counselling_ai", name: "Career Counselling — AI", chargingUnit: "Per session", credits: 3, priceInr: 30, category: "career_guidance_workforce", description: "AI-guided career trajectory and growth roadmapping", actionUrl: "/recruiter/career-counselling" },
      { id: "career_counselling_manual", name: "Career Counselling — Manual", chargingUnit: "Per session", credits: 30, priceInr: 300, category: "career_guidance_workforce", description: "1-on-1 human expert advisory and executive mentoring session", actionUrl: "/recruiter/career-counselling" },
      { id: "language_training", name: "Language Training", chargingUnit: "Per course/module", credits: 20, priceInr: 200, category: "career_guidance_workforce", description: "Business English and workplace fluency modules", actionUrl: "/recruiter/training" },
      { id: "certificate_courses", name: "Certificate Courses", chargingUnit: "Per course", credits: 50, priceInr: 500, category: "career_guidance_workforce", description: "Accredited certificate coursework with verified employee credentials", actionUrl: "/recruiter/training" },
      { id: "on_job_training", name: "On-job Training", chargingUnit: "Per programme", credits: 100, priceInr: 1000, category: "career_guidance_workforce", description: "Real-world apprenticeship and workplace simulation programme", actionUrl: "/recruiter/training" },
      { id: "skills_certifications_courses", name: "Skills Certifications Courses", chargingUnit: "Per course/certification", credits: 30, priceInr: 300, category: "career_guidance_workforce", description: "Standardized technical certification exams and badges", actionUrl: "/recruiter/training" },
    ],
  },
];

const COMPANY_ACTION_ROUTES: Record<string, { route: string; label: string }> = {
  standard_job_posting: { route: "/recruiter/jobs/create", label: "Create Job" },
  premium_job_posting: { route: "/recruiter/jobs/create", label: "Create Premium Job" },
  verified_resume: { route: "/recruiter/candidates", label: "Verify Candidates" },
  ai_hire: { route: "/recruiter/jobs", label: "Run AI Hire" },
  domain_check: { route: "/recruiter/assessment", label: "Open Domain Check" },
  bg_verification: { route: "/recruiter/background-verification", label: "Open BG Verification" },
  psychometric_test: { route: "/recruiter/psychometric-test", label: "Run Test" },
  genius_test: { route: "/recruiter/genius-test", label: "Run Test" },
  linguistic_test: { route: "/recruiter/linguistic-test", label: "Run Test" },
  skills_enhancement: { route: "/recruiter/training", label: "View Courses" },
  career_counselling_ai: { route: "/recruiter/career-counselling", label: "AI Counselling" },
  career_counselling_manual: { route: "/recruiter/career-counselling", label: "Book Mentor" },
  language_training: { route: "/recruiter/training", label: "Training Modules" },
  certificate_courses: { route: "/recruiter/training", label: "Certifications" },
  on_job_training: { route: "/recruiter/training", label: "OJT Programmes" },
  skills_certifications_courses: { route: "/recruiter/training", label: "Skill Badges" },
};

const DEFAULT_STARTUP_CATEGORIES: StartupCategoryGroup[] = [
  {
    id: "job_posting_recruitment",
    title: "Job Posting and Recruitment Activities",
    description: "Job postings, resume verifications, AI hiring, and candidate background checks",
    items: [
      { id: "standard_job_posting", name: "Create Job Posting – Standard", chargingUnit: "Per job posting", credits: 10, priceInr: 100, category: "job_posting_recruitment", description: "Standard single job listing with applicant inbox and matching", actionUrl: "/recruiter/jobs/create" },
      { id: "premium_job_posting", name: "Create Job Posting – PremiumS", chargingUnit: "Per job posting", credits: 20, priceInr: 200, category: "job_posting_recruitment", description: "Premium job listing with highlighted placement and boosted candidate reach", actionUrl: "/recruiter/jobs/create" },
      { id: "verified_resume", name: "Verified Resume", chargingUnit: "Per resume verification", credits: 30, priceInr: 300, category: "job_posting_recruitment", description: "Comprehensive verification of candidate credentials, past employment, and academic badges", actionUrl: "/recruiter/verified-resumes" },
      { id: "ai_hire", name: "AI Hire", chargingUnit: "Per candidate processed", credits: 50, priceInr: 500, category: "job_posting_recruitment", description: "Autonomous AI candidate evaluation, technical scoring, and hiring recommendation", actionUrl: "/recruiter/ai-hire" },
      { id: "domain_check", name: "Domain Check", chargingUnit: "Per check", credits: 20, priceInr: 200, category: "job_posting_recruitment", description: "Specialized domain technical assessment tailored to job requirements", actionUrl: "/recruiter/domain-assessments" },
      { id: "bg_verification", name: "BG Verification", chargingUnit: "Per verification", credits: 30, priceInr: 300, category: "job_posting_recruitment", description: "30 platform credits + provider fee, if applicable (UIDAI, EPFO, NAD, e-Courts checks)", actionUrl: "/recruiter/background-verification", providerFeeNote: "External registry provider fee applicable where required" },
    ],
  },
  {
    id: "promotions_explore",
    title: "Promotions and Explore Opportunities",
    description: "Placement promotions, landing page spotlights, social media pushes, and job fairs",
    items: [
      { id: "promo_landing_page", name: "List on the landing pages", chargingUnit: "Per campaign", credits: 50, priceInr: 500, category: "promotions_explore", description: "Feature your vacancy prominently on LetGetIn landing pages", actionUrl: "/recruiter/jobs/create" },
      { id: "promo_featured_jobs", name: "Featured Jobs", chargingUnit: "Per featured placement", credits: 30, priceInr: 300, category: "promotions_explore", description: "Featured badge and top placement in candidate search feeds", actionUrl: "/recruiter/jobs/create" },
      { id: "promo_recently_posted", name: "Recently Posted", chargingUnit: "Per promoted listing", credits: 10, priceInr: 100, category: "promotions_explore", description: "Boost position in Recently Posted feeds for active candidates", actionUrl: "/recruiter/jobs/create" },
      { id: "promo_first_page_7d", name: "Stay on the first page", chargingUnit: "7-day placement", credits: 50, priceInr: 500, category: "promotions_explore", durationDays: 7, description: "Guaranteed front-page ranking across discovery feeds for 7 full days", actionUrl: "/recruiter/promote-job" },
      { id: "promo_front_row_7d", name: "Stay in the front row / top row", chargingUnit: "7-day placement", credits: 75, priceInr: 750, category: "promotions_explore", durationDays: 7, description: "Pinned top-row banner placement in category listings for 7 days", actionUrl: "/recruiter/promote-job" },
      { id: "promo_social_media", name: "Promote on Social Media", chargingUnit: "Per campaign", credits: 30, priceInr: 300, category: "promotions_explore", description: "Multi-platform social outreach blast across LinkedIn and Twitter feeds", actionUrl: "/recruiter/promote-job" },
      { id: "promo_job_fair", name: "Promote on Job Fair", chargingUnit: "Per campaign", credits: 100, priceInr: 1000, category: "promotions_explore", description: "Exclusive virtual and physical job fair spotlight exhibition booth", actionUrl: "/recruiter/promote-job" },
      { id: "promo_advertisement", name: "Advertisement", chargingUnit: "By placement and duration", credits: 0, priceInr: 0, category: "promotions_explore", caseByCase: true, description: "Custom enterprise banner placements and sponsor campaigns (Case-by-case / To be agreed)", actionUrl: "/recruiter/ad-management" },
    ],
  },
  {
    id: "career_guidance_learning",
    title: "Career Guidance and Learning",
    description: "Workforce assessments, psychological profiling, executive mentoring, and skills certification",
    items: [
      { id: "psychometric_test", name: "Psychometric Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_learning", description: "Workplace personality, cultural alignment, and situational judgment", actionUrl: "/recruiter/psychometric-test" },
      { id: "genius_test", name: "Genius Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_learning", description: "Cognitive aptitude, logic, and analytical problem solving", actionUrl: "/recruiter/genius-test" },
      { id: "linguistic_test", name: "Linguistic Test", chargingUnit: "Per test", credits: 10, priceInr: 100, category: "career_guidance_learning", description: "Language proficiency and workplace communication assessment", actionUrl: "/recruiter/linguistic-test" },
      { id: "skills_enhancement", name: "Skills Enhancement", chargingUnit: "Per course/programme", credits: 30, priceInr: 300, category: "career_guidance_learning", description: "Employee upskilling curriculum and role transformation track", actionUrl: "/recruiter/training" },
      { id: "career_counselling_ai", name: "Career Counselling – AI", chargingUnit: "Per session", credits: 3, priceInr: 30, category: "career_guidance_learning", description: "AI-guided career trajectory and growth roadmapping", actionUrl: "/recruiter/career-counselling" },
      { id: "career_counselling_manual", name: "Career Counselling – Manual", chargingUnit: "Per session", credits: 30, priceInr: 300, category: "career_guidance_learning", description: "1-on-1 human expert advisory and executive mentoring session", actionUrl: "/recruiter/career-counselling" },
      { id: "language_training", name: "Language Training", chargingUnit: "Per course/module", credits: 20, priceInr: 200, category: "career_guidance_learning", description: "Business English and workplace fluency modules", actionUrl: "/recruiter/training" },
      { id: "certificate_courses", name: "Certificate Courses", chargingUnit: "Per course", credits: 50, priceInr: 500, category: "career_guidance_learning", description: "Accredited certificate coursework with verified employee credentials", actionUrl: "/recruiter/training" },
      { id: "on_job_training", name: "On-job Training", chargingUnit: "Per programme", credits: 100, priceInr: 1000, category: "career_guidance_learning", description: "Real-world apprenticeship and workplace simulation programme", actionUrl: "/recruiter/training" },
      { id: "skills_certifications_courses", name: "Skills Certifications Courses", chargingUnit: "Per course/certification", credits: 30, priceInr: 300, category: "career_guidance_learning", description: "Standardized technical certification exams and badges", actionUrl: "/recruiter/training" },
    ],
  },
  {
    id: "growth_fundraising",
    title: "Growth & Fundraising Services",
    description: "Venture scaling, investor networking, and business acceleration packages",
    items: [
      {
        id: "startup_business_plus",
        name: "Business Plus",
        chargingUnit: "Per listing/package",
        credits: 50,
        priceInr: 500,
        category: "growth_fundraising",
        description: "Premium startup business showcase, AI pitch generation, and partner visibility",
        actionUrl: "/recruiter/startup/marketing-plus",
      },
      {
        id: "startup_networking",
        name: "Networking",
        chargingUnit: "Per event/access",
        credits: 20,
        priceInr: 200,
        category: "growth_fundraising",
        description: "Direct investor networking access and pipeline deal creation",
        actionUrl: "/recruiter/startup/investors-connect",
      },
      {
        id: "startup_funding_support",
        name: "Funding Support",
        chargingUnit: "Per support service",
        credits: 50,
        priceInr: 500,
        category: "growth_fundraising",
        description: "Dedicated fundraising advisory, outreach review, and capital strategy",
        actionUrl: "/recruiter/startup/fundraising-pipeline",
      },
    ],
  },
  {
    id: "ecosystem_programs",
    title: "Ecosystem & Documentation Services",
    description: "Corporate filings, pitch decks, incubation facilities, and top-tier accelerators",
    items: [
      {
        id: "startup_documentations",
        name: "Documentations",
        chargingUnit: "Per service/request",
        credits: 50,
        priceInr: 500,
        category: "ecosystem_programs",
        description: "Comprehensive documentation support (pitch decks, registrations, govt scheme filings)",
        actionUrl: "/recruiter/startup/pitch-decks",
      },
      {
        id: "startup_incubations",
        name: "Incubations",
        chargingUnit: "Per listing/application support",
        credits: 50,
        priceInr: 500,
        category: "ecosystem_programs",
        description: "Incubation hub listings, lab facility access, and academic joint-program application support",
        actionUrl: "/recruiter/startup/incubator",
      },
      {
        id: "startup_accelerators",
        name: "Accelerators",
        chargingUnit: "Per listing/application support",
        credits: 50,
        priceInr: 500,
        category: "ecosystem_programs",
        description: "Venture acceleration listings, cohort milestone tracking, and application support",
        actionUrl: "/recruiter/startup/accelerate",
      },
    ],
  },
];

const STARTUP_ACTION_ROUTES: Record<string, { route: string; label: string }> = {
  startup_business_plus: { route: "/recruiter/startup/marketing-plus", label: "Open Business Plus" },
  startup_networking: { route: "/recruiter/startup/investors-connect", label: "Investor Connect" },
  startup_funding_support: { route: "/recruiter/startup/fundraising-pipeline", label: "Fundraising Pipeline" },
  startup_documentations: { route: "/recruiter/startup/pitch-decks", label: "Documentation Hub" },
  startup_incubations: { route: "/recruiter/startup/incubator", label: "Incubator Hub" },
  startup_accelerators: { route: "/recruiter/startup/accelerate", label: "Accelerate Programs" },
};

const DEFAULT_INSTITUTION_CATEGORIES: InstitutionCategoryGroup[] = [
  {
    id: "institution_services",
    title: "Institution Services and Charges",
    description: "Campus recruitment drives, mass student applications, job fairs, skill enhancement, and student testing",
    items: [
      {
        id: "inst_placement_mass_application",
        name: "Placement – Mass Application",
        chargingUnit: "Per student application",
        credits: 2,
        priceInr: 20,
        category: "institution_services",
        description: "Submit mass applications for graduating batches across active corporate employer pipelines",
        actionUrl: "/recruiter/institution/placements",
      },
      {
        id: "inst_campus_drive",
        name: "Campus – Drive",
        chargingUnit: "Per event",
        credits: 100,
        priceInr: 1000,
        category: "institution_services",
        description: "Host dedicated on-campus corporate recruitment drive with multi-company scheduling",
        actionUrl: "/recruiter/institution/campus-recruitment",
      },
      {
        id: "inst_job_fair_campus",
        name: "Job Fair at Campus",
        chargingUnit: "Per event",
        credits: 300,
        priceInr: 3000,
        category: "institution_services",
        description: "Large-scale physical job fair on campus hosting multiple verified corporate recruiters",
        actionUrl: "/recruiter/institution/placements",
      },
      {
        id: "inst_job_fair_online",
        name: "Job Fair – Online",
        chargingUnit: "Per event",
        credits: 150,
        priceInr: 1500,
        category: "institution_services",
        description: "Virtual recruitment fair connecting all institution students with remote employers",
        actionUrl: "/recruiter/institution/placements",
      },
      {
        id: "inst_career_enhancement",
        name: "Career Enhancement at Campus",
        chargingUnit: "Per session",
        credits: 50,
        priceInr: 500,
        category: "institution_services",
        description: "Campus-wide corporate career guidance, CV workshops, and executive orientation session",
        actionUrl: "/recruiter/institution/training",
      },
      {
        id: "inst_skills_enhancement_batch",
        name: "Skills Enhancement",
        chargingUnit: "Per batch",
        credits: 100,
        priceInr: 1000,
        category: "institution_services",
        description: "Structured industry-readiness training batch aligned with corporate demand",
        actionUrl: "/recruiter/institution/training",
      },
      {
        id: "inst_genius_test_campus",
        name: "Genius Test at Campus",
        chargingUnit: "Per student test",
        credits: 5,
        priceInr: 50,
        category: "institution_services",
        description: "Standardized cognitive aptitude, logic, and employability assessment per student",
        actionUrl: "/recruiter/genius-test",
      },
    ],
  },
];

const INSTITUTION_ACTION_ROUTES: Record<string, { route: string; label: string }> = {
  inst_placement_mass_application: { route: "/recruiter/institution/placements", label: "Open Placements" },
  inst_campus_drive: { route: "/recruiter/institution/campus-recruitment", label: "Schedule Drive" },
  inst_job_fair_campus: { route: "/recruiter/institution/placements", label: "Host Campus Fair" },
  inst_job_fair_online: { route: "/recruiter/institution/placements", label: "Host Online Fair" },
  inst_career_enhancement: { route: "/recruiter/institution/training", label: "Book Session" },
  inst_skills_enhancement_batch: { route: "/recruiter/institution/training", label: "Launch Batch" },
  inst_genius_test_campus: { route: "/recruiter/genius-test", label: "Schedule Tests" },
};

const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanItem[] = [
  {
    id: "job_posting",
    name: "Job Posting",
    targetRole: "recruiter",
    durations: {
      monthly: { credits: 50, priceInr: 500, days: 30 },
      six_months: { credits: 250, priceInr: 2500, days: 180 },
      yearly: { credits: 500, priceInr: 5000, days: 365 },
    },
    features: ["Active Job Postings included", "Direct Applicant Pipeline", "Standard Candidate Messaging"],
  },
  {
    id: "hrms",
    name: "HRMS",
    targetRole: "recruiter",
    durations: {
      monthly: { credits: 150, priceInr: 1500, days: 30 },
      six_months: { credits: 750, priceInr: 7500, days: 180 },
      yearly: { credits: 1500, priceInr: 15000, days: 365 },
    },
    features: ["Employee Management System", "Payroll & Compliance Tools", "Leave & Attendance Management"],
  },
  {
    id: "recruitment_suite",
    name: "Recruitment Suite",
    targetRole: "recruiter",
    durations: {
      monthly: { credits: 250, priceInr: 2500, days: 30 },
      six_months: { credits: 1250, priceInr: 12500, days: 180 },
      yearly: { credits: 2500, priceInr: 25000, days: 365 },
    },
    features: ["AI Resume Shortlisting & Scoring", "Multi-round Automated Testing Suite", "AI Interview Suite & Video Proctoring"],
  },
  {
    id: "institution",
    name: "Institution",
    targetRole: "institution",
    durations: {
      monthly: { credits: 100, priceInr: 1000, days: 30 },
      six_months: { credits: 500, priceInr: 5000, days: 180 },
      yearly: { credits: 1000, priceInr: 10000, days: 365 },
    },
    features: ["Mass Student Applications", "Campus Drive Scheduling", "Recruiter Network Direct Links"],
  },
  {
    id: "startup",
    name: "Startup",
    targetRole: "startup",
    durations: {
      monthly: { credits: 50, priceInr: 500, days: 30 },
      six_months: { credits: 250, priceInr: 2500, days: 180 },
      yearly: { credits: 500, priceInr: 5000, days: 365 },
    },
    features: ["Business Plus Listing", "Documentations & Govt Schemes Support", "Investor Connect & Fundraising Pipeline"],
  },
];

export function CreditPurchaseView({
  role = "candidate",
  embedded = false,
  initialTab,
  hideHeaderBanner = false,
}: CreditPurchaseViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgProfile } = useRecruiterStore();
  const { user } = useAuthStore();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const isInstitution =
    role === "institution" ||
    (role !== "candidate" &&
      role !== "user" &&
      role !== "recruiter" &&
      role !== "startup" &&
      ((wallet?.pricingCatalog?.institutionPlans && wallet.pricingCatalog.institutionPlans.length > 0) ||
        (typeof window !== "undefined" && window.location.pathname.includes("/institution"))));
  const isInstitutionAccount =
    isInstitution ||
    orgProfile?.entity === "institution" ||
    user?.entityType === "institution" ||
    (typeof window !== "undefined" &&
      (window.location.pathname.includes("/institution") ||
        window.location.search.toLowerCase().includes("institution")));
  const isStartup =
    !isInstitution &&
    (role === "startup" ||
      (role !== "candidate" &&
        role !== "user" &&
        role !== "recruiter" &&
        ((wallet?.pricingCatalog?.startupPlans && wallet.pricingCatalog.startupPlans.length > 0) ||
          (typeof window !== "undefined" && window.location.pathname.includes("/startup")))));
  const isStartupAccount =
    !isInstitutionAccount &&
    (isStartup ||
      orgProfile?.entity === "startup" ||
      user?.entityType === "startup" ||
      (typeof window !== "undefined" &&
        (window.location.pathname.includes("/startup") ||
          window.location.search.toLowerCase().includes("startup"))));
  const isCandidate = (role === "candidate" || role === "user") && !isStartup && !isInstitution;
  const isRecruiter = (role === "recruiter" || (!role && !isCandidate && !isStartup && !isInstitution)) && !isStartup && !isInstitution;

  // URL query parameters for insufficient credits redirect
  const requiredParam = searchParams.get("required");
  const shortfallParam = searchParams.get("shortfall");
  const featureParam = searchParams.get("feature");
  const returnUrlParam = searchParams.get("returnUrl");

  const requiredCredits = requiredParam ? parseInt(requiredParam, 10) : null;
  const shortfallCredits = shortfallParam ? parseInt(shortfallParam, 10) : null;
  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : null;

  const [activeTab, setActiveTab] = useState<
    "plans" | "company_plans" | "startup_plans" | "institution_plans" | "subscriptions" | "topup" | "history"
  >(initialTab || (searchParams.get("subtab") as any) || (isCandidate ? "plans" : "subscriptions"));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (requiredParam) {
      setActiveTab("topup");
    }
  }, [requiredParam]);

  const handleTabClick = (
    tab: "plans" | "company_plans" | "startup_plans" | "institution_plans" | "subscriptions" | "topup" | "history"
  ) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("subtab", tab);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    }
  };
  const [billingCycle, setBillingCycle] = useState<"monthly" | "six_months" | "yearly">("monthly");
  const [customCredits, setCustomCredits] = useState<number>(shortfallCredits && shortfallCredits > 0 ? shortfallCredits : 50);

  // Referral code claim state
  const [referralInput, setReferralInput] = useState("");
  const [claimingReferral, setClaimingReferral] = useState(false);

  // Institution Service Modal
  const [institutionModal, setInstitutionModal] = useState<{
    open: boolean;
    item: InstitutionPlanItem;
  } | null>(null);
  const [institutionQuantity, setInstitutionQuantity] = useState<number>(1);
  const [isRequestingInstitutionService, setIsRequestingInstitutionService] = useState(false);
  const [institutionServiceRequested, setInstitutionServiceRequested] = useState<{
    name: string;
    message: string;
    balance: number;
    actionUrl?: string;
  } | null>(null);

  // Startup Service Request Modal
  const [startupModal, setStartupModal] = useState<{
    open: boolean;
    item: StartupPlanItem;
  } | null>(null);
  const [isRequestingStartupService, setIsRequestingStartupService] = useState(false);
  const [startupServiceRequested, setStartupServiceRequested] = useState<{
    name: string;
    message: string;
    balance: number;
    actionUrl?: string;
  } | null>(null);

  // Candidate Package Activation Modal
  const [packageModal, setPackageModal] = useState<{
    open: boolean;
    item: CandidatePlanItem;
  } | null>(null);
  const [isActivatingPackage, setIsActivatingPackage] = useState(false);
  const [packageActivated, setPackageActivated] = useState<{
    name: string;
    message: string;
    balance: number;
  } | null>(null);

  // Company Promotion Activation Modal
  const [promoModal, setPromoModal] = useState<{
    open: boolean;
    item: CompanyPlanItem;
  } | null>(null);
  const [isActivatingPromo, setIsActivatingPromo] = useState(false);
  const [promoActivated, setPromoActivated] = useState<{
    name: string;
    message: string;
    balance: number;
  } | null>(null);
  const [adInquiryModal, setAdInquiryModal] = useState<boolean>(false);

  // Insufficient Credits Modal State
  const [insufficientModal, setInsufficientModal] = useState<{
    open: boolean;
    serviceName: string;
    requiredCredits: number;
    availableBalance: number;
  } | null>(null);

  // Checkout modal state for buying credits / top-up
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    purchaseType: "credits" | "subscription" | "package";
    itemKey: string;
    itemName: string;
    credits: number;
    amountInr: number;
    billingCycle?: "monthly" | "six_months" | "yearly";
  } | null>(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState<{
    orderId: string;
    creditsAdded: number;
    balance: number;
    itemName: string;
  } | null>(null);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const data = await creditService.getWallet();
      setWallet(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleCopyReferral = () => {
    if (!wallet?.referralCode) return;
    const url = `${window.location.origin}/auth?ref=${wallet.referralCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied to clipboard!");
  };

  const handleClaimReferral = async () => {
    if (!referralInput.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    setClaimingReferral(true);
    try {
      const res = await creditService.claimReferral(referralInput.trim());
      toast.success(res.message);
      setReferralInput("");
      await loadWallet();
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply referral code");
    } finally {
      setClaimingReferral(false);
    }
  };

  const handleInitiateCreditPurchase = (pack: CreditTopupPack) => {
    if (wallet?.paymentsCreditsEnabled === false) {
      toast.error(wallet.paymentsCreditsDisabledReason || "Payments and credit operations are temporarily disabled platform-wide.");
      return;
    }
    const returnUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    router.push(
      `/payment?pack=${pack.id}&item=${encodeURIComponent(pack.name)}&credits=${pack.credits}&amount=${pack.priceInr}&returnUrl=${returnUrl}`
    );
  };

  const handleInitiateCustomTopup = () => {
    if (wallet?.paymentsCreditsEnabled === false) {
      toast.error(wallet.paymentsCreditsDisabledReason || "Payments and credit operations are temporarily disabled platform-wide.");
      return;
    }
    if (customCredits < 1) {
      toast.error("Please select at least 1 credit to purchase");
      return;
    }
    const amountInr = customCredits * 10;
    const returnUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    router.push(
      `/payment?item=${encodeURIComponent(`Custom Top-up (${customCredits} Credits)`)}&credits=${customCredits}&amount=${amountInr}&returnUrl=${returnUrl}`
    );
  };

  const handleInitiateSubscriptionPurchase = (plan: SubscriptionPlanItem) => {
    if (wallet?.paymentsCreditsEnabled === false) {
      toast.error(wallet.paymentsCreditsDisabledReason || "Payments and credit operations are temporarily disabled platform-wide.");
      return;
    }
    const durationConfig = plan.durations[billingCycle];
    const returnUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    router.push(
      `/payment?item=${encodeURIComponent(`${plan.name} (${billingCycle.replace("_", " ")})`)}&credits=${
        durationConfig.credits
      }&amount=${durationConfig.priceInr}&billingCycle=${billingCycle}&returnUrl=${returnUrl}`
    );
  };

  const handleConfirmPayment = async () => {
    if (!checkoutModal) return;
    const returnUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    setCheckoutModal(null);
    router.push(
      `/payment?item=${encodeURIComponent(checkoutModal.itemName)}&credits=${checkoutModal.credits}&amount=${checkoutModal.amountInr}&returnUrl=${returnUrl}`
    );
  };

  const handleActivateCandidatePackage = async () => {
    if (!packageModal?.item) return;
    setIsActivatingPackage(true);
    try {
      const res = await creditService.activatePackage(packageModal.item.id);
      setPackageActivated({
        name: packageModal.item.name,
        message: res.message,
        balance: res.balance,
      });
      toast.success(res.message);
      await loadWallet();
    } catch (err: any) {
      toast.error(err?.message || "Failed to activate candidate package");
    } finally {
      setIsActivatingPackage(false);
    }
  };

  const handleActivatePromotion = async () => {
    if (!promoModal?.item) return;
    setIsActivatingPromo(true);
    try {
      const res = await creditService.activatePromotion({
        promoKey: promoModal.item.id,
      });
      setPromoActivated({
        name: promoModal.item.name,
        message: res.message,
        balance: res.balance,
      });
      toast.success(res.message);
      await loadWallet();
    } catch (err: any) {
      const isInsufficient = creditService.isInsufficientCreditsError(err);
      if (isInsufficient.isInsufficient) {
        toast.error(
          `Insufficient credits. This requires ${isInsufficient.requiredCredits} credits, but your balance is ${isInsufficient.availableBalance}.`
        );
        setPromoModal(null);
        setActiveTab("topup");
        setCustomCredits(isInsufficient.shortfall);
      } else {
        toast.error(err?.message || "Failed to activate promotion");
      }
    } finally {
      setIsActivatingPromo(false);
    }
  };

  const handleConfirmStartupService = async () => {
    if (!startupModal) return;
    const { item } = startupModal;
    if (balance < item.credits) {
      toast.error(
        `Insufficient credits. This requires ${item.credits} credits, but your balance is ${balance}.`
      );
      setStartupModal(null);
      setActiveTab("topup");
      setCustomCredits(item.credits - balance);
      return;
    }

    setIsRequestingStartupService(true);
    try {
      const res = await creditService.requestStartupService({
        serviceKey: item.id,
        details: {
          featureName: item.name,
          chargingUnit: item.chargingUnit,
        },
      });
      setStartupServiceRequested({
        name: item.name,
        message: res.message || "Service activated and recorded in your startup ledger",
        balance: res.balance ?? balance - item.credits,
        actionUrl: item.actionUrl,
      });
      toast.success(res.message || `${item.name} activated successfully`);
      await loadWallet();
    } catch (err: any) {
      const isInsufficient = creditService.isInsufficientCreditsError(err);
      if (isInsufficient.isInsufficient) {
        toast.error(
          `Insufficient credits. This requires ${isInsufficient.requiredCredits} credits, but your balance is ${isInsufficient.availableBalance}.`
        );
        setStartupModal(null);
        setActiveTab("topup");
        setCustomCredits(isInsufficient.shortfall);
      } else {
        toast.error(err?.message || "Failed to process startup service request");
      }
    } finally {
      setIsRequestingStartupService(false);
    }
  };

  const handleConfirmInstitutionService = async () => {
    if (!institutionModal) return;
    const { item } = institutionModal;
    const qty = Math.max(1, institutionQuantity || 1);
    const totalCredits = item.credits * qty;
    if (balance < totalCredits) {
      toast.error(
        `Insufficient credits. This requires ${totalCredits} credits (${qty} × ${item.credits}), but your balance is ${balance}.`
      );
      setInstitutionModal(null);
      setActiveTab("topup");
      setCustomCredits(totalCredits - balance);
      return;
    }

    setIsRequestingInstitutionService(true);
    try {
      const res = await creditService.chargeInstitutionFeature({
        featureKey: item.id,
        count: qty,
        quantity: qty,
        details: {
          featureName: item.name,
          chargingUnit: item.chargingUnit,
        },
      });
      const updatedBalance = res.balance ?? res.data?.balance ?? balance - totalCredits;
      setInstitutionServiceRequested({
        name: item.name,
        message: res.message || `${item.name} activated and recorded in your institution ledger`,
        balance: updatedBalance,
        actionUrl: item.actionUrl,
      });
      toast.success(res.message || `${item.name} processed successfully`);
      await loadWallet();
    } catch (err: any) {
      const isInsufficient = creditService.isInsufficientCreditsError(err);
      if (isInsufficient.isInsufficient) {
        toast.error(
          `Insufficient credits. This requires ${isInsufficient.requiredCredits} credits, but your balance is ${isInsufficient.availableBalance}.`
        );
        setInstitutionModal(null);
        setActiveTab("topup");
        setCustomCredits(isInsufficient.shortfall);
      } else {
        toast.error(err?.message || "Failed to process institution service request");
      }
    } finally {
      setIsRequestingInstitutionService(false);
    }
  };

  const handleReturnToOriginalAction = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
        <p className="text-sm font-medium text-ink-soft">Loading wallet and plans...</p>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const balanceInr = balance * 10;
  const creditPacks = wallet?.pricingCatalog?.creditPacks || [];
  const availableSubscriptions: SubscriptionPlanItem[] =
    wallet?.pricingCatalog?.subscriptionPlans && wallet.pricingCatalog.subscriptionPlans.length > 0
      ? [
          ...wallet.pricingCatalog.subscriptionPlans,
          ...DEFAULT_SUBSCRIPTION_PLANS.filter(
            (def) => !wallet.pricingCatalog.subscriptionPlans.some((p) => p.id === def.id)
          ),
        ]
      : DEFAULT_SUBSCRIPTION_PLANS;
  const subscriptionPlans = availableSubscriptions;
  const candidateCategories = wallet?.pricingCatalog?.candidatePlans || DEFAULT_CANDIDATE_CATEGORIES;
  const companyCategories = wallet?.pricingCatalog?.companyPlans || DEFAULT_COMPANY_CATEGORIES;
  const startupCategories = wallet?.pricingCatalog?.startupPlans || DEFAULT_STARTUP_CATEGORIES;
  const institutionCategories = wallet?.pricingCatalog?.institutionPlans || DEFAULT_INSTITUTION_CATEGORIES;
  const activePackages = wallet?.packages || [];
  const activeCompanyPromotions = activePackages.filter(
    (p) => p.packageType === "company_promotion" || p.packageType === "promotion"
  );
  const activeCandidatePackages = activePackages.filter(
    (p) => p.packageType === "ai_apply" || p.packageType === "candidate_package"
  );
  const transactions = wallet?.transactions || [];

  return (
    <div className={`${embedded ? "w-full max-w-[900px] mx-auto px-0 py-2 space-y-6" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"} animate-fade-in`}>
      {/* Insufficient Credits Alert Banner */}
      {requiredCredits !== null && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 shadow-xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                  Insufficient Credits
                </span>
                {featureParam && (
                  <span className="text-xs font-semibold text-ink-soft">
                    Action: <strong className="text-ink capitalize">{featureParam.replace(/_/g, " ")}</strong>
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-ink mt-1.5 leading-snug">
                This feature requires <span className="text-primary-glow font-black">{requiredCredits} credits</span>,
                but your available balance is <span className="text-ink font-black">{balance} credits</span>.
                {shortfallCredits !== null && shortfallCredits > 0 && (
                  <span>
                    {" "}
                    You need <span className="text-amber-600 font-black">{shortfallCredits} more credits</span> (₹
                    {(shortfallCredits * 10).toLocaleString()}) to proceed.
                  </span>
                )}
              </p>
              <p className="text-xs text-ink-soft mt-1">
                Top up your wallet below or activate a credit package. Once completed, you will be able to return to your original
                action immediately.
              </p>
            </div>

            {returnUrl && (
              <button
                type="button"
                onClick={handleReturnToOriginalAction}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return Back</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Header & Wallet Overview Card */}
      {!hideHeaderBanner && (
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isCandidate
                  ? "Candidate Credits & Feature Plans"
                  : isInstitution
                  ? "Institution Credits, Subscriptions & Services"
                  : isStartup
                  ? "Startup Credits, Subscriptions & Services"
                  : "Company Credits, Subscriptions & Rates"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {isCandidate
                ? "Candidate Wallet & Feature Pricing"
                : isInstitution
                ? "Institution Wallet & Credit Plans"
                : isStartup
                ? "Startup Wallet & Credit Plans"
                : "Company Wallet & Credit Plans"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              {isCandidate ? (
                <>
                  Use credits for AI Apply packages, resume ATS checks, mockups & assessments, tests, and career learning.
                  Standard rule: <strong>1 credit = ₹10</strong>. Initial bonus: <strong>20 credits (₹200)</strong>. Refer & earn: <strong>10 credits (₹100)</strong>.
                </>
              ) : isInstitution ? (
                <>
                  Empower campus placements, schedule recruitment drives, host job fairs, and run student assessments with Institution credits.
                  Standard rule: <strong>1 credit = ₹10</strong>. Initial promotional bonus: <strong>20 credits (₹200)</strong>. Refer & earn: <strong>10 credits (₹100)</strong>.
                </>
              ) : isStartup ? (
                <>
                  Accelerate your venture with Startup subscriptions, investor networking, documentation, incubation, and accelerator support.
                  Standard rule: <strong>1 credit = ₹10</strong>. Initial promotional bonus: <strong>20 credits (₹200)</strong>. Refer & earn: <strong>10 credits (₹100)</strong>.
                </>
              ) : (
                <>
                  Manage company credit balances, enterprise subscriptions, billable job actions, and placement promotions.
                  Standard rule: <strong>1 credit = ₹10</strong>. Initial promotional bonus: <strong>20 credits (₹200)</strong>. Refer & earn: <strong>10 credits (₹100)</strong>.
                </>
              )}
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-primary/10 via-surface to-surface-alt p-5 sm:p-6 rounded-3xl border border-primary/20 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-glow shrink-0">
              <Coins className="w-7 h-7" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Available Balance</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">{balance}</span>
                <span className="text-xs font-bold text-primary-glow">Credits</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                ≈ ₹{balanceInr.toLocaleString()} INR
              </span>
            </div>
            {returnUrl && balance >= (requiredCredits || 0) && (
              <button
                type="button"
                onClick={handleReturnToOriginalAction}
                className="mt-2 sm:mt-0 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Continue Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Navigation Tabs (Hidden for candidate as parent Payments & Subscription provides top-level tabs) */}
      {!isCandidate && (
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
          {isInstitution ? (
            <>
              <button
                type="button"
                onClick={() => handleTabClick("subscriptions")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Institution Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("institution_plans")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "institution_plans"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Services & Charges</span>
              </button>
            </>
          ) : isStartup ? (
            <>
              <button
                type="button"
                onClick={() => handleTabClick("subscriptions")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Startup Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("startup_plans")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "startup_plans"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Startup Services & Charges</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleTabClick("subscriptions")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>
                  {isInstitutionAccount
                    ? "Institution Subscription"
                    : isStartupAccount
                    ? "Startup Subscription"
                    : "Company Subscriptions"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("company_plans")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "company_plans"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Features & Charges</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleTabClick("topup")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "topup"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-ink-soft hover:text-ink hover:bg-surface-alt"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Credit Top-Ups</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("history")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-ink-soft hover:text-ink hover:bg-surface-alt"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Transaction Ledger</span>
          </button>
        </div>
      )}

      {/* Global Payments & Credits Disabled Platform Warning */}
      {wallet && wallet.paymentsCreditsEnabled === false && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
              Payments & Credits Temporarily Paused
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {wallet.paymentsCreditsDisabledReason || 'New credit purchases, top-ups, paid subscriptions, and billable operations are temporarily paused platform-wide for scheduled administration.'} Your current wallet balance ({balance} Credits) and transaction history remain completely safe and intact.
            </p>
          </div>
        </div>
      )}

      {/* CANDIDATE TAB: CANDIDATE PLANS & SERVICES */}
      {isCandidate && activeTab === "plans" && (
        <div className="space-y-10 animate-fade-in">
          {/* Active AI Apply Packages Card */}
          {activePackages.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-surface to-surface-alt border border-emerald-500/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-ink">Active AI Apply Packages</h3>
                    <p className="text-xs text-ink-soft">Your active quotas are automatically applied during job submissions.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/ai-apply")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open AI Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {activePackages.map((pkg, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-ink">{pkg.planName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-soft">Quota Remaining:</span>
                        <strong className="text-ink font-bold">
                          {pkg.quotaRemaining ?? 0} / {pkg.quotaTotal ?? 0} Jobs
                        </strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, (((pkg.quotaRemaining ?? 0) / (pkg.quotaTotal || 1)) * 100))
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-ink-soft pt-1 border-t border-border/60">
                      <Clock className="w-3.5 h-3.5 text-primary-glow" />
                      <span>Expires {new Date(pkg.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Plans Grid */}
          {candidateCategories.map((catGroup) => (
            <div key={catGroup.id} className="space-y-4">
              <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {catGroup.id === "resume_services" && <FileCheck2 className="w-5 h-5 text-primary-glow" />}
                    {catGroup.id === "ai_apply" && <Send className="w-5 h-5 text-indigo-500" />}
                    {catGroup.id === "mockups_and_assessments" && <Brain className="w-5 h-5 text-amber-500" />}
                    {catGroup.id === "career_guidance_and_learning" && <Compass className="w-5 h-5 text-emerald-500" />}
                    <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight">{catGroup.title}</h2>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{catGroup.description}</p>
                </div>
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  {catGroup.items.length} Options Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catGroup.items.map((item) => {
                  const isAiPackage = catGroup.id === "ai_apply";
                  const routeInfo = CANDIDATE_ACTION_ROUTES[item.id];
                  const hasSufficient = balance >= item.credits;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-ink leading-snug">{item.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow shrink-0">
                            {item.chargingUnit}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="p-3 rounded-xl bg-surface-alt/70 border border-border/80 flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black text-ink">{item.credits}</span>
                            <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-600">₹{item.priceInr.toLocaleString()}</span>
                            <span className="text-[10px] text-ink-soft block uppercase font-bold">INR Equiv.</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isAiPackage ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (balance < item.credits) {
                                setInsufficientModal({
                                  open: true,
                                  serviceName: item.name,
                                  requiredCredits: item.credits,
                                  availableBalance: balance,
                                });
                              } else {
                                setPackageModal({ open: true, item });
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Activate Package</span>
                          </button>
                        ) : routeInfo ? (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (balance < item.credits) {
                                  setInsufficientModal({
                                    open: true,
                                    serviceName: item.name,
                                    requiredCredits: item.credits,
                                    availableBalance: balance,
                                  });
                                } else {
                                  router.push(routeInfo.route);
                                }
                              }}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                hasSufficient
                                  ? "bg-surface-alt border border-border text-ink hover:border-primary/40 hover:bg-surface"
                                  : "bg-surface-alt border border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                              }`}
                            >
                              <span>{routeInfo.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {!hasSufficient && (
                              <p className="text-[10px] text-amber-600 text-center font-semibold">
                                Requires {item.credits} credits (Balance: {balance})
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPANY TAB: COMPANY FEATURES & CHARGES */}
      {!isCandidate && !isStartup && activeTab === "company_plans" && (
        <div className="space-y-10 animate-fade-in">
          {/* Active Company Promotions & Placements Card */}
          {activeCompanyPromotions.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-surface-alt border border-primary/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-glow flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-ink">Active Company Promotions & Placements</h3>
                    <p className="text-xs text-ink-soft">Your active listings, front-page ranks, and spotlight placements enforced on the platform.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-glow text-xs font-bold">
                  {activeCompanyPromotions.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {activeCompanyPromotions.map((pkg, idx) => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(pkg.expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)));
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-ink">{pkg.planName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                          Active
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-ink-soft">Duration / Cycle:</span>
                          <strong className="text-ink font-bold capitalize">{pkg.billingCycle.replace("_", " ")}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-soft">Time Remaining:</span>
                          <strong className="text-primary-glow font-bold">{daysLeft} days remaining</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-ink-soft pt-1 border-t border-border/60">
                        <Clock className="w-3.5 h-3.5 text-primary-glow" />
                        <span>Expires {new Date(pkg.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorized Company Plans Grid */}
          {companyCategories.map((catGroup) => (
            <div key={catGroup.id} className="space-y-4">
              <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {catGroup.id === "job_posting_recruitment" && <Briefcase className="w-5 h-5 text-primary-glow" />}
                    {catGroup.id === "promotions_explore" && <Megaphone className="w-5 h-5 text-indigo-500" />}
                    {catGroup.id === "career_guidance_workforce" && <Compass className="w-5 h-5 text-emerald-500" />}
                    <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight">{catGroup.title}</h2>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{catGroup.description}</p>
                </div>
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  {catGroup.items.length} Features
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catGroup.items.map((item) => {
                  const isPromotion = catGroup.id === "promotions_explore";
                  const routeInfo = COMPANY_ACTION_ROUTES[item.id];
                  const hasSufficient = item.caseByCase ? true : balance >= item.credits;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-ink leading-snug">{item.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow shrink-0">
                            {item.chargingUnit}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {item.providerFeeNote && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-bold">
                            {item.providerFeeNote}
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-surface-alt/70 border border-border/80 flex items-baseline justify-between">
                          <div>
                            {item.caseByCase ? (
                              <>
                                <span className="text-lg font-black text-ink">Custom</span>
                                <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl font-black text-ink">{item.credits}</span>
                                <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            {item.caseByCase ? (
                              <span className="text-xs font-bold text-ink">To be agreed</span>
                            ) : (
                              <span className="text-sm font-bold text-emerald-600">₹{item.priceInr.toLocaleString()}</span>
                            )}
                            <span className="text-[10px] text-ink-soft block uppercase font-bold">INR Equiv.</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isPromotion ? (
                          item.caseByCase ? (
                            <button
                              type="button"
                              onClick={() => setAdInquiryModal(true)}
                              className="w-full py-2.5 px-3 rounded-xl bg-surface-alt border border-border text-ink text-xs font-bold hover:bg-surface hover:border-primary/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Tv className="w-3.5 h-3.5 text-primary-glow" />
                              <span>Inquire Custom Quote</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (balance < item.credits) {
                                  setInsufficientModal({
                                    open: true,
                                    serviceName: item.name,
                                    requiredCredits: item.credits,
                                    availableBalance: balance,
                                  });
                                } else {
                                  setPromoModal({ open: true, item });
                                }
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Activate ({item.credits} Credits)</span>
                            </button>
                          )
                        ) : routeInfo ? (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasSufficient) {
                                  setInsufficientModal({
                                    open: true,
                                    serviceName: item.name,
                                    requiredCredits: item.credits,
                                    availableBalance: balance,
                                  });
                                } else {
                                  router.push(routeInfo.route);
                                }
                              }}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                hasSufficient
                                  ? "bg-surface-alt border border-border text-ink hover:border-primary/40 hover:bg-surface"
                                  : "bg-surface-alt border border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                              }`}
                            >
                              <span>{routeInfo.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {!hasSufficient && (
                              <p className="text-[10px] text-amber-600 text-center font-semibold">
                                Requires {item.credits} credits (Balance: {balance})
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STARTUP TAB: STARTUP SERVICES & CHARGES */}
      {isStartup && activeTab === "startup_plans" && (
        <div className="space-y-10 animate-fade-in">
          {/* Startup Services Overview Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-surface-alt border border-primary/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-glow flex items-center justify-center">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-ink">Startup Services & Authoritative Charges</h3>
                  <p className="text-xs text-ink-soft">
                    Recruitment activities, placement promotions, learning & guidance, venture scaling, and ecosystem programs.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-glow text-xs font-bold">
                {startupCategories.reduce((sum, g) => sum + g.items.length, 0)} Services & Charges
              </span>
            </div>
          </div>

          {/* Categorized Startup Plans Grid */}
          {startupCategories.map((catGroup) => (
            <div key={catGroup.id} className="space-y-4">
              <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {catGroup.id === "job_posting_recruitment" && <Briefcase className="w-5 h-5 text-primary-glow" />}
                    {catGroup.id === "promotions_explore" && <Megaphone className="w-5 h-5 text-indigo-500" />}
                    {catGroup.id === "career_guidance_learning" && <Compass className="w-5 h-5 text-emerald-500" />}
                    {catGroup.id === "growth_fundraising" && <Rocket className="w-5 h-5 text-primary-glow" />}
                    {catGroup.id === "ecosystem_programs" && <Building2 className="w-5 h-5 text-indigo-500" />}
                    <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight">{catGroup.title}</h2>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{catGroup.description}</p>
                </div>
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  {catGroup.items.length} Features
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catGroup.items.map((item) => {
                  const isPromotion = catGroup.id === "promotions_explore";
                  const isStartupService = catGroup.id === "growth_fundraising" || catGroup.id === "ecosystem_programs";
                  const routeInfo = STARTUP_ACTION_ROUTES[item.id] || COMPANY_ACTION_ROUTES[item.id];
                  const hasSufficient = item.caseByCase ? true : balance >= item.credits;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-ink leading-snug">{item.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow shrink-0">
                            {item.chargingUnit}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {item.providerFeeNote && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-bold">
                            {item.providerFeeNote}
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-surface-alt/70 border border-border/80 flex items-baseline justify-between">
                          <div>
                            {item.caseByCase ? (
                              <>
                                <span className="text-lg font-black text-ink">Custom</span>
                                <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl font-black text-ink">{item.credits}</span>
                                <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            {item.caseByCase ? (
                              <span className="text-xs font-bold text-ink">To be agreed</span>
                            ) : (
                              <span className="text-sm font-bold text-emerald-600">₹{item.priceInr.toLocaleString()}</span>
                            )}
                            <span className="text-[10px] text-ink-soft block uppercase font-bold">INR Equiv.</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {isPromotion ? (
                          item.caseByCase ? (
                            <button
                              type="button"
                              onClick={() => setAdInquiryModal(true)}
                              className="w-full py-2.5 px-3 rounded-xl bg-surface-alt border border-border text-ink text-xs font-bold hover:bg-surface hover:border-primary/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Tv className="w-3.5 h-3.5 text-primary-glow" />
                              <span>Inquire Custom Quote</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (balance < item.credits) {
                                  setInsufficientModal({
                                    open: true,
                                    serviceName: item.name,
                                    requiredCredits: item.credits,
                                    availableBalance: balance,
                                  });
                                } else {
                                  setPromoModal({ open: true, item });
                                }
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Activate ({item.credits} Credits)</span>
                            </button>
                          )
                        ) : isStartupService ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (balance < item.credits) {
                                  setInsufficientModal({
                                    open: true,
                                    serviceName: item.name,
                                    requiredCredits: item.credits,
                                    availableBalance: balance,
                                  });
                                } else {
                                  setStartupModal({ open: true, item });
                                }
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Request ({item.credits} Credits)</span>
                            </button>

                            {routeInfo && (
                              <button
                                type="button"
                                onClick={() => router.push(routeInfo.route)}
                                className="w-full py-2 px-3 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>{routeInfo.label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        ) : routeInfo ? (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => router.push(routeInfo.route)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                hasSufficient
                                  ? "bg-surface-alt border border-border text-ink hover:border-primary/40 hover:bg-surface"
                                  : "bg-surface-alt border border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                              }`}
                            >
                              <span>{routeInfo.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {!hasSufficient && (
                              <p className="text-[10px] text-amber-600 text-center font-semibold">
                                Requires {item.credits} credits (Balance: {balance})
                              </p>
                            )}
                          </div>
                        ) : null}

                        {!hasSufficient && isStartupService && (
                          <p className="text-[10px] text-amber-600 text-center font-semibold">
                            Requires {item.credits} credits (Balance: {balance})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSTITUTION TAB: INSTITUTION SERVICES & CHARGES */}
      {isInstitution && activeTab === "institution_plans" && (
        <div className="space-y-10 animate-fade-in">
          {/* Institution Services Overview Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-surface-alt border border-primary/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-glow flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-ink">Institution Services & Authoritative Charges</h3>
                  <p className="text-xs text-ink-soft">
                    Campus recruitment drives, mass student applications, on-campus and online job fairs, career sessions, and student testing.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-glow text-xs font-bold">
                {institutionCategories.reduce((sum, g) => sum + g.items.length, 0)} Services & Charges
              </span>
            </div>
          </div>

          {/* Categorized Institution Plans Grid */}
          {institutionCategories.map((catGroup) => (
            <div key={catGroup.id} className="space-y-4">
              <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary-glow" />
                    <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight">{catGroup.title}</h2>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{catGroup.description}</p>
                </div>
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  {catGroup.items.length} Services
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catGroup.items.map((item) => {
                  const routeInfo = INSTITUTION_ACTION_ROUTES[item.id];
                  const hasSufficient = balance >= item.credits;
                  const isBatchOrUnit = item.id === "inst_placement_mass_application" || item.id === "inst_genius_test_campus";

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-ink leading-snug">{item.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow shrink-0">
                            {item.chargingUnit}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="p-3 rounded-xl bg-surface-alt/70 border border-border/80 flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black text-ink">{item.credits}</span>
                            <span className="text-xs font-bold text-primary-glow ml-1">Credits</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-600">₹{item.priceInr.toLocaleString()}</span>
                            <span className="text-[10px] text-ink-soft block uppercase font-bold">INR Equiv.</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (balance < item.credits) {
                              setInsufficientModal({
                                open: true,
                                serviceName: item.name,
                                requiredCredits: item.credits,
                                availableBalance: balance,
                              });
                            } else {
                              setInstitutionQuantity(1);
                              setInstitutionModal({ open: true, item });
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {isBatchOrUnit
                              ? `Charge / Batch (${item.credits} Cr / Unit)`
                              : `Request (${item.credits} Credits)`}
                          </span>
                        </button>

                        {routeInfo && (
                          <button
                            type="button"
                            onClick={() => router.push(routeInfo.route)}
                            className="w-full py-2 px-3 rounded-xl bg-surface-alt border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{routeInfo.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {!hasSufficient && !isBatchOrUnit && (
                          <p className="text-[10px] text-amber-600 text-center font-semibold">
                            Requires {item.credits} credits (Balance: {balance})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: CREDIT TOP-UPS */}
      {activeTab === "topup" && (
        <div className="space-y-8 animate-fade-in">
          {/* Preset Packs Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Authoritative Credit Top-Up Packs</h2>
                <p className="text-xs text-ink-soft">Instantly add credits to your spendable wallet at ₹10 per credit</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Fixed 1 Credit = ₹10
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {creditPacks.map((pack) => {
                const isShortfallPack =
                  shortfallCredits !== null &&
                  shortfallCredits > 0 &&
                  pack.credits >= shortfallCredits &&
                  pack.credits < shortfallCredits + 60;

                return (
                  <div
                    key={pack.id}
                    className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                      pack.best || isShortfallPack
                        ? "border-primary bg-primary/5 shadow-elegant ring-2 ring-primary/20"
                        : "border-border bg-surface hover:border-primary/40 hover:shadow-xs"
                    }`}
                  >
                    {(pack.best || isShortfallPack) && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-brand text-white shadow-xs">
                        {isShortfallPack ? "Recommended" : "Best Value"}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-ink">{pack.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-ink">{pack.credits}</span>
                          <span className="text-xs font-bold text-primary-glow">Credits</span>
                        </div>
                      </div>

                      <div className="text-base font-extrabold text-ink">
                        ₹{pack.priceInr.toLocaleString()}
                        <span className="text-[11px] font-normal text-ink-soft block">Inclusive of taxes</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInitiateCreditPurchase(pack)}
                      className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        pack.best || isShortfallPack
                          ? "bg-gradient-brand text-white shadow-glow hover:opacity-95"
                          : "bg-surface-alt hover:bg-surface border border-border text-ink"
                      }`}
                    >
                      <span>Buy {pack.credits} Credits</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Credit Calculator & Purchase Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-ink">Custom Amount Top-Up</h3>
                <p className="text-xs text-ink-soft">Enter exact credits required for your target candidate feature</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">Quick select:</span>
                {[10, 20, 30, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomCredits(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      customCredits === amt
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-alt hover:bg-surface border border-border text-ink-soft"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink block">Credits to Buy</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={customCredits}
                    onChange={(e) => setCustomCredits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-ink font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Coins className="w-4 h-4 text-ink-soft absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink block">Payable in INR (1 Credit = ₹10)</label>
                <div className="px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-emerald-600 font-extrabold text-sm flex items-center justify-between">
                  <span>₹{(customCredits * 10).toLocaleString()} INR</span>
                  <span className="text-[10px] text-ink-soft uppercase font-bold">Standard</span>
                </div>
              </div>

              <div className="pt-2 md:pt-5">
                <button
                  type="button"
                  onClick={handleInitiateCustomTopup}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay ₹{(customCredits * 10).toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Bonus Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-surface to-surface-alt border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-glow shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-ink">Refer and Earn 10 Credits (₹100)</h3>
                <p className="text-xs text-ink-soft">
                  Share your referral link with peers. You receive 10 credits when they join and verify their account.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              {wallet?.referralCode && (
                <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl text-xs font-black text-ink w-full sm:w-auto justify-between">
                  <span>{wallet.referralCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="p-1 rounded-lg text-primary-glow hover:bg-surface-alt transition cursor-pointer"
                    title="Copy Referral Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-ink uppercase w-28"
                />
                <button
                  type="button"
                  disabled={claimingReferral || !referralInput.trim()}
                  onClick={handleClaimReferral}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  {claimingReferral ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Claim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER TAB: SUBSCRIPTION PLANS (Visible only for non-candidate roles) */}
      {!isCandidate && activeTab === "subscriptions" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {isInstitutionAccount
                  ? "Institution Subscription Plans"
                  : isStartupAccount
                  ? "Startup Subscription Plans"
                  : isRecruiter
                  ? "Company Subscription Plans"
                  : "Official Platform Subscription Plans"}
              </h2>
              <p className="text-xs text-ink-soft">
                {isInstitutionAccount
                  ? "Subscribe to Job Posting, HRMS, Recruitment Suite, or Institution plans with Monthly, 6 Months, or Yearly billing options."
                  : isStartupAccount || isStartup
                  ? "Subscribe to Job Posting, HRMS, Recruitment Suite, or Startup plans with Monthly, 6 Months, or Yearly billing options including platform credits and ecosystem features."
                  : isRecruiter
                  ? "Subscribe to Job Posting, HRMS, or Recruitment Suite with Monthly, 6 Months, or Yearly billing options."
                  : "Subscribe for monthly, 6-month, or yearly entitlements with bundled platform credits."}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === "monthly" ? "bg-white text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("six_months")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === "six_months" ? "bg-white text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === "yearly" ? "bg-white text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isInstitutionAccount || isStartupAccount || isStartup ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}>
            {(isInstitutionAccount
              ? (["job_posting", "hrms", "recruitment_suite", "institution"]
                  .map((id) => subscriptionPlans.find((p) => p.id === id))
                  .filter(Boolean) as SubscriptionPlanItem[])
              : isStartupAccount || isStartup
              ? (["job_posting", "hrms", "recruitment_suite", "startup"]
                  .map((id) => subscriptionPlans.find((p) => p.id === id))
                  .filter(Boolean) as SubscriptionPlanItem[])
              : isRecruiter
              ? subscriptionPlans.filter((p) => ["job_posting", "hrms", "recruitment_suite"].includes(p.id))
              : subscriptionPlans
            ).map((plan) => {
              const duration = plan.durations[billingCycle];
              const isSubscribed = wallet?.subscriptions?.some(
                (s) => s.planId === plan.id && s.status === "active"
              );

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between p-6 rounded-3xl border transition-all ${
                    isSubscribed
                      ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
                      : "border-border bg-surface hover:border-primary/40 hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {plan.id === "job_posting" && <Briefcase className="w-5 h-5 text-primary-glow" />}
                        {plan.id === "hrms" && <Building2 className="w-5 h-5 text-purple-600" />}
                        {plan.id === "recruitment_suite" && <Crown className="w-5 h-5 text-amber-500" />}
                        {plan.id === "institution" && <GraduationCap className="w-5 h-5 text-teal-600" />}
                        {plan.id === "startup" && <Rocket className="w-5 h-5 text-rose-500" />}
                        <h3 className="text-base font-bold text-ink">{plan.name}</h3>
                      </div>

                      {isSubscribed && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <div className="pb-3 border-b border-border/80">
                      <div className="text-2xl sm:text-3xl font-black text-ink">
                        ₹{duration.priceInr.toLocaleString()}
                        <span className="text-xs font-normal text-ink-soft">
                          {" "}
                          / {billingCycle === "monthly" ? "mo" : billingCycle === "six_months" ? "6 mo" : "year"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary-glow mt-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{duration.credits} Credits Included</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft">Features</span>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-ink-soft">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubscribed}
                    onClick={() => handleInitiateSubscriptionPurchase(plan)}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      isSubscribed
                        ? "bg-surface-alt text-ink-soft border border-border cursor-default"
                        : "bg-gradient-brand text-white shadow-xs hover:opacity-95"
                    }`}
                  >
                    {isSubscribed ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>Subscribe for ₹{duration.priceInr.toLocaleString()}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: TRANSACTION LEDGER */}
      {activeTab === "history" && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Credit Movement & Transaction History</h2>
              <p className="text-xs text-ink-soft">Reliable transaction audit log for all granted, purchased, and spent credits.</p>
            </div>
            <span className="text-xs font-bold text-ink-soft">{transactions.length} records</span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-ink-soft text-sm">
              No transactions recorded yet in your account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-ink-soft font-bold">
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Reason / Feature</th>
                    <th className="pb-3 px-3">Credits</th>
                    <th className="pb-3 px-3">Balance After</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-surface-alt/40 transition">
                      <td className="py-3 px-3 text-ink-soft">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            tx.type === "purchase"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : tx.type === "grant" || tx.type === "referral"
                              ? "bg-primary/10 text-primary-glow"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-ink max-w-xs truncate">{tx.reason}</td>
                      <td className="py-3 px-3 font-bold">
                        {tx.type === "spend" ? (
                          <span className="text-destructive">-{tx.amount}</span>
                        ) : (
                          <span className="text-emerald-600">+{tx.amount}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-ink">{tx.balanceAfter ?? "-"}</td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CANDIDATE PACKAGE ACTIVATION MODAL */}
      {packageModal?.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            {!packageActivated ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Activate Candidate Package</h3>
                  <p className="text-xs text-ink-soft">Review package details and credit deduction before activation.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Package:</span>
                    <strong className="text-ink">{packageModal.item.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Duration / Scope:</span>
                    <strong className="text-ink">{packageModal.item.chargingUnit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Required Credits:</span>
                    <strong className="text-primary-glow font-bold">{packageModal.item.credits} Credits (₹{packageModal.item.priceInr})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Current Balance:</span>
                    <span className="font-semibold text-ink">{balance} Credits</span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-black text-ink">
                    <span>Balance After Activation:</span>
                    <span className={balance >= packageModal.item.credits ? "text-emerald-600" : "text-destructive"}>
                      {balance - packageModal.item.credits} Credits
                    </span>
                  </div>
                </div>

                {balance < packageModal.item.credits ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Insufficient Credits</span>
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      You need {packageModal.item.credits - balance} more credits to activate this package.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCredits(packageModal.item.credits - balance);
                        setPackageModal(null);
                        setActiveTab("topup");
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
                    >
                      Top Up {packageModal.item.credits - balance} Credits Now
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-ink-soft bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <ShieldCheck className="w-4 h-4 text-primary-glow shrink-0" />
                    <span>Credits will be deducted atomically and package activated immediately.</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isActivatingPackage}
                    onClick={() => setPackageModal(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  {balance >= packageModal.item.credits && (
                    <button
                      type="button"
                      disabled={isActivatingPackage}
                      onClick={handleActivateCandidatePackage}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isActivatingPackage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm & Deduct</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ink">Package Activated!</h3>
                  <p className="text-xs text-ink-soft">{packageActivated.message}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Package:</span>
                    <strong className="text-ink">{packageActivated.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Remaining Balance:</span>
                    <strong className="text-primary-glow font-bold">{packageActivated.balance} Credits</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPackageActivated(null);
                      setPackageModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPackageActivated(null);
                      setPackageModal(null);
                      router.push("/ai-apply");
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Go to AI Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutModal?.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            {!paymentCompleted ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Order Confirmation</h3>
                  <p className="text-xs text-ink-soft">Review your purchase details before proceeding to payment.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Item:</span>
                    <strong className="text-ink">{checkoutModal.itemName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Credit Allocation:</span>
                    <strong className="text-primary-glow font-bold">+{checkoutModal.credits} Credits</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Currency:</span>
                    <strong className="text-ink">INR (₹)</strong>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-black text-ink">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-600">₹{checkoutModal.amountInr.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-ink-soft bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <ShieldCheck className="w-4 h-4 text-primary-glow shrink-0" />
                  <span>Secure 256-bit encrypted checkout. Server-verified credit fulfillment.</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setCheckoutModal(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleConfirmPayment}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{checkoutModal.amountInr.toLocaleString()}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ink">Payment Successful!</h3>
                  <p className="text-xs text-ink-soft">
                    {paymentCompleted.creditsAdded} credits have been verified and added to your wallet.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Order ID:</span>
                    <span className="font-mono text-ink text-[11px]">{paymentCompleted.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">New Balance:</span>
                    <strong className="text-primary-glow font-bold">{paymentCompleted.balance} Credits</strong>
                  </div>
                </div>

                {returnUrl ? (
                  <button
                    type="button"
                    onClick={handleReturnToOriginalAction}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Return and Resume Action</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCompleted(null);
                      setCheckoutModal(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPANY PROMOTION ACTIVATION MODAL */}
      {promoModal?.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            {!promoActivated ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mx-auto mb-2 shadow-glow">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Activate Company Promotion</h3>
                  <p className="text-xs text-ink-soft">Review credit deduction and placement duration before activating.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Promotion Item:</span>
                    <strong className="text-ink">{promoModal.item.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Charging Unit / Duration:</span>
                    <strong className="text-ink">{promoModal.item.chargingUnit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Credit Cost:</span>
                    <strong className="text-primary-glow font-bold">{promoModal.item.credits} Credits (₹{promoModal.item.priceInr})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Your Current Balance:</span>
                    <strong className="text-ink font-semibold">{balance} Credits</strong>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-ink-soft">Balance After Activation:</span>
                    <strong className={balance >= promoModal.item.credits ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {balance - promoModal.item.credits} Credits
                    </strong>
                  </div>
                </div>

                {balance < promoModal.item.credits && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Insufficient credits. You need {promoModal.item.credits - balance} more credits.</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isActivatingPromo}
                    onClick={() => setPromoModal(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {balance >= promoModal.item.credits ? (
                    <button
                      type="button"
                      disabled={isActivatingPromo}
                      onClick={handleActivatePromotion}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isActivatingPromo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Confirm & Activate</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const shortfall = promoModal.item.credits - balance;
                        setPromoModal(null);
                        setActiveTab("topup");
                        setCustomCredits(shortfall);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-glow hover:bg-amber-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Buy Credits First</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ink">Promotion Activated!</h3>
                  <p className="text-xs text-ink-soft">{promoActivated.message}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Package:</span>
                    <strong className="text-ink">{promoActivated.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Updated Wallet Balance:</span>
                    <strong className="text-primary-glow font-bold">{promoActivated.balance} Credits</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPromoActivated(null);
                    setPromoModal(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADVERTISEMENT INQUIRY MODAL */}
      {adInquiryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center mx-auto mb-2">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Enterprise Advertisement Placement</h3>
              <p className="text-xs text-ink-soft">Custom banner placements, sponsored campaigns, and strategic durations.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Charging Unit:</span>
                <strong className="text-ink">By placement and duration</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Pricing:</span>
                <strong className="text-emerald-600 font-bold">Case-by-case / To be agreed</strong>
              </div>
              <p className="text-ink-soft pt-1 leading-relaxed">
                Platform advertisements are customized based on targeting criteria, page positions, impression goals, and active campaign durations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-ink-soft bg-primary/5 p-3 rounded-xl border border-primary/20">
              <ShieldCheck className="w-4 h-4 text-primary-glow shrink-0" />
              <span>Contact our enterprise account team to receive a tailor-made placement quote.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdInquiryModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
              >
                Close
              </button>
              <a
                href="mailto:support@letgetin.com?subject=Enterprise%20Advertisement%20Placement%20Inquiry"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Email Sales</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* STARTUP SERVICE REQUEST MODAL */}
      {startupModal?.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            {!startupServiceRequested ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mx-auto mb-2 shadow-glow">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Request Startup Service</h3>
                  <p className="text-xs text-ink-soft">Review credit deduction and feature terms before confirming.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Startup Service:</span>
                    <strong className="text-ink">{startupModal.item.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Charging Unit:</span>
                    <strong className="text-ink">{startupModal.item.chargingUnit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Credit Cost:</span>
                    <strong className="text-primary-glow font-bold">
                      {startupModal.item.credits} Credits (₹{startupModal.item.priceInr.toLocaleString()})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Available Balance:</span>
                    <strong className="text-ink font-semibold">{balance} Credits</strong>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-ink-soft">Balance After Deduction:</span>
                    <strong
                      className={
                        balance >= startupModal.item.credits ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"
                      }
                    >
                      {balance - startupModal.item.credits} Credits
                    </strong>
                  </div>
                </div>

                {balance < startupModal.item.credits && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Insufficient credits. You need {startupModal.item.credits - balance} more credits.</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isRequestingStartupService}
                    onClick={() => setStartupModal(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {balance >= startupModal.item.credits ? (
                    <button
                      type="button"
                      disabled={isRequestingStartupService}
                      onClick={handleConfirmStartupService}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isRequestingStartupService ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Confirm & Deduct</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const shortfall = startupModal.item.credits - balance;
                        setStartupModal(null);
                        setActiveTab("topup");
                        setCustomCredits(shortfall);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-glow hover:bg-amber-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Buy Credits First</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ink">Service Activated!</h3>
                  <p className="text-xs text-ink-soft">{startupServiceRequested.message}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Service:</span>
                    <strong className="text-ink">{startupServiceRequested.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Updated Wallet Balance:</span>
                    <strong className="text-primary-glow font-bold">{startupServiceRequested.balance} Credits</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {startupServiceRequested.actionUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = startupServiceRequested.actionUrl!;
                        setStartupServiceRequested(null);
                        setStartupModal(null);
                        router.push(url);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Open Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStartupServiceRequested(null);
                      setStartupModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-surface-alt border border-border text-ink text-xs font-bold hover:bg-surface transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSTITUTION SERVICE REQUEST MODAL */}
      {institutionModal?.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            {!institutionServiceRequested ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mx-auto mb-2 shadow-glow">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Request Institution Service</h3>
                  <p className="text-xs text-ink-soft">Review credit deduction and batch size before confirming.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Institution Service:</span>
                    <strong className="text-ink">{institutionModal.item.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Charging Unit:</span>
                    <strong className="text-ink">{institutionModal.item.chargingUnit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Unit Cost:</span>
                    <strong className="text-primary-glow font-bold">
                      {institutionModal.item.credits} Credits (₹{institutionModal.item.priceInr.toLocaleString()})
                    </strong>
                  </div>

                  {/* Quantity selector */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <label className="text-xs font-bold text-ink">
                      {institutionModal.item.id === "inst_placement_mass_application"
                        ? "Number of Students / Applications:"
                        : institutionModal.item.id === "inst_genius_test_campus"
                        ? "Number of Students to Test:"
                        : "Event / Batch Count:"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={institutionQuantity}
                      onChange={(e) => setInstitutionQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-24 px-3 py-1.5 rounded-xl bg-surface border border-border text-ink font-bold text-center text-xs focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Total Deduction:</span>
                    <strong className="text-primary-glow font-black text-sm">
                      {institutionModal.item.credits * Math.max(1, institutionQuantity || 1)} Credits (₹
                      {(institutionModal.item.priceInr * Math.max(1, institutionQuantity || 1)).toLocaleString()})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Available Balance:</span>
                    <strong className="text-ink font-semibold">{balance} Credits</strong>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-ink-soft">Balance After Deduction:</span>
                    <strong
                      className={
                        balance >= institutionModal.item.credits * Math.max(1, institutionQuantity || 1)
                          ? "text-emerald-600 font-bold"
                          : "text-amber-600 font-bold"
                      }
                    >
                      {balance - institutionModal.item.credits * Math.max(1, institutionQuantity || 1)} Credits
                    </strong>
                  </div>
                </div>

                {balance < institutionModal.item.credits * Math.max(1, institutionQuantity || 1) && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Insufficient credits. You need{" "}
                      {institutionModal.item.credits * Math.max(1, institutionQuantity || 1) - balance} more credits.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isRequestingInstitutionService}
                    onClick={() => setInstitutionModal(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {balance >= institutionModal.item.credits * Math.max(1, institutionQuantity || 1) ? (
                    <button
                      type="button"
                      disabled={isRequestingInstitutionService}
                      onClick={handleConfirmInstitutionService}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isRequestingInstitutionService ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Confirm & Deduct</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const totalNeeded = institutionModal.item.credits * Math.max(1, institutionQuantity || 1);
                        const shortfall = totalNeeded - balance;
                        setInstitutionModal(null);
                        setActiveTab("topup");
                        setCustomCredits(shortfall);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-glow hover:bg-amber-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Buy Credits First</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-ink">Service Confirmed!</h3>
                  <p className="text-xs text-ink-soft">{institutionServiceRequested.message}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Service:</span>
                    <strong className="text-ink">{institutionServiceRequested.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Updated Wallet Balance:</span>
                    <strong className="text-primary-glow font-bold">
                      {institutionServiceRequested.balance} Credits
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {institutionServiceRequested.actionUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = institutionServiceRequested.actionUrl!;
                        setInstitutionServiceRequested(null);
                        setInstitutionModal(null);
                        router.push(url);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Open Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInstitutionServiceRequested(null);
                      setInstitutionModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-surface-alt border border-border text-ink text-xs font-bold hover:bg-surface transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSUFFICIENT CREDITS MODAL */}
      {insufficientModal && (
        <InsufficientCreditsModal
          isOpen={insufficientModal.open}
          onClose={() => setInsufficientModal(null)}
          serviceName={insufficientModal.serviceName}
          requiredCredits={insufficientModal.requiredCredits}
          availableBalance={insufficientModal.availableBalance}
        />
      )}
    </div>
  );
}
