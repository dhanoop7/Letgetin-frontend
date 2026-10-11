import { RecruiterJob } from "@/features/recruiter/types";
import { CandidateStageStatus, CandidatePoolType, PopulatedUser, PopulatedResume } from "@/features/hiringEngine/types/hiringEngine.types";

export interface IDummyStageCandidate {
  _id: string;
  applicationId: string;
  userId:
    | {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        avatarUrl?: string;
      }
    | PopulatedUser
    | string;
  resumeId?:
    | {
        _id: string;
        title: string;
        atsScore?: number;
      }
    | PopulatedResume
    | string
    | null;
  stageId: string;
  stageStatus: CandidateStageStatus;
  poolType: CandidatePoolType;
  matchScore: number;
  assessmentScore?: number;
  aiScore?: number;
  appliedAt?: string;
  notes?: string;
  role?: string;
  experience?: string;
  eliminationReason?: string;
  disqualificationReason?: string;
}

export interface IDummyPipelineStage {
  id: string;
  slug: string;
  order: number;
  name: string;
  stageType: string;
  selectedCount: number;
  eliminatedCount: number;
  inQueueCount: number;
  targetCount: number;
  passingScore?: number;
  ratio?: string;
  eliminatedRatio?: string;
  percentage?: string;
  candidates: IDummyStageCandidate[];
}

export const DUMMY_SHORTLIST_JOBS: RecruiterJob[] = [
  {
    _id: "job-sl-1",
    title: "Senior React Developer",
    company: {
      name: "TechNova Innovations",
      website: "https://technova.example.com",
    },
    location: {
      city: "Bangalore",
      country: "India",
      state: "Karnataka",
      remote: false,
    },
    workplaceType: "onsite",
    employmentType: "full-time",
    status: "active",
    applicantCount: 38,
    skills: ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: "Lead frontend engineering team for next-generation enterprise web apps.",
  },
  {
    _id: "job-sl-2",
    title: "Full Stack Developer",
    company: {
      name: "Apex Global Labs",
      website: "https://apexlabs.example.com",
    },
    location: {
      city: "Remote",
      country: "Global",
      state: "Remote",
      remote: true,
    },
    workplaceType: "remote",
    employmentType: "full-time",
    status: "active",
    applicantCount: 45,
    skills: ["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: "End-to-end cloud product developer building responsive UIs and robust backend APIs.",
  },
  {
    _id: "job-sl-3",
    title: "AI/ML Engineer",
    company: {
      name: "CognitiveAI Systems",
      website: "https://cognitiveai.example.com",
    },
    location: {
      city: "Hyderabad",
      country: "India",
      state: "Telangana",
      remote: false,
    },
    workplaceType: "hybrid",
    employmentType: "full-time",
    status: "active",
    applicantCount: 29,
    skills: ["Python", "PyTorch", "LLMs", "LangChain", "FastAPI"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: "Build cutting-edge LLM pipelines and intelligent agent workflows.",
  },
  {
    _id: "job-sl-4",
    title: "Backend Node.js Developer",
    company: {
      name: "CloudScale Infotech",
      website: "https://cloudscale.example.com",
    },
    location: {
      city: "Kochi",
      country: "India",
      state: "Kerala",
      remote: false,
    },
    workplaceType: "onsite",
    employmentType: "full-time",
    status: "active",
    applicantCount: 22,
    skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: "High-throughput microservices architecture and distributed cache design.",
  },
  {
    _id: "job-sl-5",
    title: "UI/UX Developer",
    company: {
      name: "DesignPulse Studio",
      website: "https://designpulse.example.com",
    },
    location: {
      city: "Chennai",
      country: "India",
      state: "Tamil Nadu",
      remote: false,
    },
    workplaceType: "hybrid",
    employmentType: "full-time",
    status: "active",
    applicantCount: 19,
    skills: ["Figma", "React", "CSS Modules", "Tailwind CSS", "Framer Motion"],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: "Craft pixel-perfect micro-interactions and cohesive modern design systems.",
  },
];

// 5 Complete Stages: Resume Screening -> Assessment -> Interview -> Final Shortlist -> BGC
export const DEFAULT_DUMMY_PIPELINE_STAGES: IDummyPipelineStage[] = [
  {
    id: "stage-1-resume",
    slug: "resume-screening",
    order: 1,
    name: "Resume Screening",
    stageType: "resume_match",
    selectedCount: 8,
    eliminatedCount: 2,
    inQueueCount: 3,
    targetCount: 15,
    passingScore: 75,
    ratio: "1:1",
    eliminatedRatio: "1:4",
    percentage: "200%",
    candidates: [
      {
        _id: "cand-dummy-1",
        applicationId: "cand-dummy-1",
        userId: {
          _id: "user-sl-1",
          fullName: "Rahul Menon",
          email: "rahul.menon@example.com",
          phone: "+91 98765 43210",
        },
        resumeId: {
          _id: "res-sl-1",
          title: "Rahul_Menon_Frontend_CV.pdf",
          atsScore: 92,
        },
        stageId: "stage-1-resume",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 92,
        assessmentScore: 88,
        aiScore: 90,
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Strong React & TypeScript experience. Top ATS keyword score.",
        role: "Frontend Engineer",
        experience: "3 Years",
      },
      {
        _id: "cand-dummy-2",
        applicationId: "cand-dummy-2",
        userId: {
          _id: "user-sl-2",
          fullName: "Anjali S",
          email: "anjali.s@example.com",
          phone: "+91 97890 12345",
        },
        resumeId: {
          _id: "res-sl-2",
          title: "Anjali_S_Software_Dev.pdf",
          atsScore: 88,
        },
        stageId: "stage-1-resume",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 88,
        assessmentScore: 85,
        aiScore: 87,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Passed resume matching criteria with high score in state management.",
        role: "React Developer",
        experience: "2.5 Years",
      },
      {
        _id: "cand-dummy-3",
        applicationId: "cand-dummy-3",
        userId: {
          _id: "user-sl-3",
          fullName: "Arjun Kumar",
          email: "arjun.kumar@example.com",
          phone: "+91 94567 89012",
        },
        resumeId: {
          _id: "res-sl-3",
          title: "Arjun_Kumar_Resume.pdf",
          atsScore: 84,
        },
        stageId: "stage-1-resume",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 84,
        assessmentScore: 82,
        aiScore: 85,
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Solid resume baseline. Shortlisted for technical round.",
        role: "Full Stack Developer",
        experience: "2 Years",
      },
      {
        _id: "cand-dummy-4",
        applicationId: "cand-dummy-4",
        userId: {
          _id: "user-sl-4",
          fullName: "Siddharth Rao",
          email: "siddharth.rao@example.com",
          phone: "+91 91234 56789",
        },
        resumeId: {
          _id: "res-sl-4",
          title: "Siddharth_Rao_CV.pdf",
          atsScore: 58,
        },
        stageId: "stage-1-resume",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 58,
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Did not meet required TypeScript and Next.js proficiency thresholds.",
        role: "Junior Web Dev",
        experience: "6 Months",
      },
      {
        _id: "cand-dummy-13",
        applicationId: "cand-dummy-13",
        userId: {
          _id: "user-sl-13",
          fullName: "Rohan Varma",
          email: "rohan.varma@example.com",
          phone: "+91 97111 88990",
        },
        resumeId: {
          _id: "res-sl-13",
          title: "Rohan_Varma_CV.pdf",
          atsScore: 52,
        },
        stageId: "stage-1-resume",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 52,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Eliminated due to missing relevant tech stack requirements.",
        role: "Web Designer",
        experience: "1 Year",
      },
    ],
  },
  {
    id: "stage-2-assessment",
    slug: "assessment",
    order: 2,
    name: "Assessment",
    stageType: "general_aptitude",
    selectedCount: 5,
    eliminatedCount: 1,
    inQueueCount: 2,
    targetCount: 10,
    passingScore: 80,
    ratio: "1:1",
    eliminatedRatio: "1:5",
    percentage: "167%",
    candidates: [
      {
        _id: "cand-dummy-5",
        applicationId: "cand-dummy-5",
        userId: {
          _id: "user-sl-5",
          fullName: "Neha Thomas",
          email: "neha.thomas@example.com",
          phone: "+91 93456 78901",
        },
        resumeId: {
          _id: "res-sl-5",
          title: "Neha_Thomas_React_Lead.pdf",
          atsScore: 90,
        },
        stageId: "stage-2-assessment",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 90,
        assessmentScore: 94,
        aiScore: 92,
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Top score in technical domain challenge (94%).",
        role: "Senior Frontend Engineer",
        experience: "3.5 Years",
      },
      {
        _id: "cand-dummy-6",
        applicationId: "cand-dummy-6",
        userId: {
          _id: "user-sl-6",
          fullName: "Akhil Raj",
          email: "akhil.raj@example.com",
          phone: "+91 98111 22334",
        },
        resumeId: {
          _id: "res-sl-6",
          title: "Akhil_Raj_FullStack.pdf",
          atsScore: 86,
        },
        stageId: "stage-2-assessment",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 86,
        assessmentScore: 88,
        aiScore: 87,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Solid performance in coding evaluation and algorithms test.",
        role: "React / Node Engineer",
        experience: "3 Years",
      },
      {
        _id: "cand-dummy-7",
        applicationId: "cand-dummy-7",
        userId: {
          _id: "user-sl-7",
          fullName: "Deepak Verma",
          email: "deepak.verma@example.com",
          phone: "+91 96222 33445",
        },
        resumeId: {
          _id: "res-sl-7",
          title: "Deepak_Verma_Resume.pdf",
          atsScore: 64,
        },
        stageId: "stage-2-assessment",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 82,
        assessmentScore: 64,
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Failed proctored coding benchmark with score below 70%.",
        role: "Software Developer",
        experience: "2 Years",
      },
    ],
  },
  {
    id: "stage-3-interview",
    slug: "interview",
    order: 3,
    name: "Interview",
    stageType: "ai_interview",
    selectedCount: 3,
    eliminatedCount: 1,
    inQueueCount: 1,
    targetCount: 6,
    passingScore: 85,
    ratio: "1:1",
    eliminatedRatio: "1:5",
    percentage: "100%",
    candidates: [
      {
        _id: "cand-dummy-8",
        applicationId: "cand-dummy-8",
        userId: {
          _id: "user-sl-8",
          fullName: "Vishnu P",
          email: "vishnu.p@example.com",
          phone: "+91 95333 44556",
        },
        resumeId: {
          _id: "res-sl-8",
          title: "Vishnu_P_Senior_Engineer.pdf",
          atsScore: 94,
        },
        stageId: "stage-3-interview",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 94,
        assessmentScore: 92,
        aiScore: 95,
        appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Outstanding AI and technical panel interview performance.",
        role: "Senior React Developer",
        experience: "4 Years",
      },
      {
        _id: "cand-dummy-9",
        applicationId: "cand-dummy-9",
        userId: {
          _id: "user-sl-9",
          fullName: "Meera Nair",
          email: "meera.nair@example.com",
          phone: "+91 94444 55667",
        },
        resumeId: {
          _id: "res-sl-9",
          title: "Meera_Nair_Frontend_CV.pdf",
          atsScore: 91,
        },
        stageId: "stage-3-interview",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 91,
        assessmentScore: 89,
        aiScore: 91,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Clear architectural thinking and strong system design answers.",
        role: "UI Engineer",
        experience: "3 Years",
      },
      {
        _id: "cand-dummy-10",
        applicationId: "cand-dummy-10",
        userId: {
          _id: "user-sl-10",
          fullName: "Rohit Krishnan",
          email: "rohit.k@example.com",
          phone: "+91 93555 66778",
        },
        resumeId: {
          _id: "res-sl-10",
          title: "Rohit_Krishnan_Resume.pdf",
          atsScore: 83,
        },
        stageId: "stage-3-interview",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 83,
        assessmentScore: 84,
        aiScore: 62,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Eliminated after panel interview due to communication gaps.",
        role: "Frontend Developer",
        experience: "2 Years",
      },
    ],
  },
  {
    id: "stage-4-final",
    slug: "final-shortlist",
    order: 4,
    name: "Final Shortlist",
    stageType: "manual_review",
    selectedCount: 2,
    eliminatedCount: 1,
    inQueueCount: 1,
    targetCount: 4,
    passingScore: 90,
    ratio: "1:1",
    eliminatedRatio: "1:4",
    percentage: "100%",
    candidates: [
      {
        _id: "cand-dummy-11",
        applicationId: "cand-dummy-11",
        userId: {
          _id: "user-sl-11",
          fullName: "Adarsh Kumar",
          email: "adarsh.kumar@example.com",
          phone: "+91 98765 43210",
        },
        resumeId: {
          _id: "res-sl-11",
          title: "Adarsh_Kumar_React_Lead.pdf",
          atsScore: 96,
        },
        stageId: "stage-4-final",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 96,
        assessmentScore: 95,
        aiScore: 94,
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Selected for Finalist roster. Approved by hiring committee.",
        role: "Senior React Developer",
        experience: "3 Years",
      },
      {
        _id: "cand-dummy-12",
        applicationId: "cand-dummy-12",
        userId: {
          _id: "user-sl-12",
          fullName: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "+91 92666 77889",
        },
        resumeId: {
          _id: "res-sl-12",
          title: "Priya_Sharma_Resume.pdf",
          atsScore: 93,
        },
        stageId: "stage-4-final",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 93,
        assessmentScore: 91,
        aiScore: 92,
        appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "All qualification stages passed with distinction.",
        role: "Full Stack Engineer",
        experience: "3.5 Years",
      },
      {
        _id: "cand-dummy-14",
        applicationId: "cand-dummy-14",
        userId: {
          _id: "user-sl-14",
          fullName: "Gaurav Malhotra",
          email: "gaurav.m@example.com",
          phone: "+91 91999 00112",
        },
        resumeId: {
          _id: "res-sl-14",
          title: "Gaurav_Malhotra_CV.pdf",
          atsScore: 82,
        },
        stageId: "stage-4-final",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 82,
        assessmentScore: 84,
        aiScore: 80,
        appliedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Candidate declined salary expectations during final review.",
        role: "Frontend Engineer",
        experience: "3 Years",
      },
    ],
  },
  {
    id: "stage-5-bgc",
    slug: "bgc",
    order: 5,
    name: "Background Verification (BGC)",
    stageType: "background_verification",
    selectedCount: 2,
    eliminatedCount: 1,
    inQueueCount: 0,
    targetCount: 3,
    passingScore: 95,
    ratio: "1:1",
    eliminatedRatio: "1:2",
    percentage: "100%",
    candidates: [
      {
        _id: "cand-dummy-11-bgc",
        applicationId: "cand-dummy-11",
        userId: {
          _id: "user-sl-11",
          fullName: "Adarsh Kumar",
          email: "adarsh.kumar@example.com",
          phone: "+91 98765 43210",
        },
        resumeId: {
          _id: "res-sl-11",
          title: "Adarsh_Kumar_React_Lead.pdf",
          atsScore: 96,
        },
        stageId: "stage-5-bgc",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 96,
        appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Identity, employment history and educational credentials verified.",
        role: "Senior React Developer",
        experience: "3 Years",
      },
      {
        _id: "cand-dummy-12-bgc",
        applicationId: "cand-dummy-12",
        userId: {
          _id: "user-sl-12",
          fullName: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "+91 92666 77889",
        },
        resumeId: {
          _id: "res-sl-12",
          title: "Priya_Sharma_Resume.pdf",
          atsScore: 93,
        },
        stageId: "stage-5-bgc",
        stageStatus: "passed",
        poolType: "primary",
        matchScore: 93,
        appliedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Police verification and reference checks passed.",
        role: "Full Stack Engineer",
        experience: "3.5 Years",
      },
      {
        _id: "cand-dummy-15-bgc",
        applicationId: "cand-dummy-15",
        userId: {
          _id: "user-sl-15",
          fullName: "Rajesh Nair",
          email: "rajesh.nair@example.com",
          phone: "+91 91555 33221",
        },
        resumeId: {
          _id: "res-sl-15",
          title: "Rajesh_Nair_CV.pdf",
          atsScore: 75,
        },
        stageId: "stage-5-bgc",
        stageStatus: "failed",
        poolType: "primary",
        matchScore: 75,
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Discrepancy in previous employment tenure verification.",
        role: "React Developer",
        experience: "2.5 Years",
      },
    ],
  },
];

// Helper to find stage by slug or id
export function getStageBySlugOrId(identifier: string): IDummyPipelineStage | null {
  const normalized = identifier.toLowerCase().trim();
  return (
    DEFAULT_DUMMY_PIPELINE_STAGES.find(
      (s) => s.slug === normalized || s.id === normalized || s.name.toLowerCase().replace(/ /g, "-") === normalized
    ) || null
  );
}

// Helper to find candidate by ID across stages or by specific stage
export function getCandidateFromDummyPipeline(
  candidateId: string,
  stageIdOrSlug?: string
): { candidate: IDummyStageCandidate; stage: IDummyPipelineStage } | null {
  const normalizedId = candidateId.toLowerCase().trim();

  // If stage is provided, search that stage first
  if (stageIdOrSlug) {
    const stage = getStageBySlugOrId(stageIdOrSlug);
    if (stage) {
      const found = stage.candidates.find(
        (c) =>
          c._id.toLowerCase() === normalizedId ||
          c.applicationId.toLowerCase() === normalizedId ||
          (typeof c.userId === "object" && c.userId._id?.toLowerCase() === normalizedId)
      );
      if (found) return { candidate: found, stage };
    }
  }

  // Otherwise search across all stages
  for (const stage of DEFAULT_DUMMY_PIPELINE_STAGES) {
    const found = stage.candidates.find(
      (c) =>
        c._id.toLowerCase() === normalizedId ||
        c.applicationId.toLowerCase() === normalizedId ||
        (typeof c.userId === "object" && c.userId._id?.toLowerCase() === normalizedId)
    );
    if (found) return { candidate: found, stage };
  }

  return null;
}

