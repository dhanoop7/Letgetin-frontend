import type { CandidateStage, CreateType, Tone } from "../types";

export const CREATE_CONFIG: Record<
  CreateType,
  { title: string; label: string; placeholder: string; defaultType: string; description: string }
> = {
  candidate: {
    title: "Add Fresher Candidate",
    label: "Candidate Full Name",
    placeholder: "e.g. Rahul Sharma",
    defaultType: "Fresher Job",
    description: "Add a promising campus graduate or entry-level talent directly into your recruiter pipeline.",
  },
  drive: {
    title: "Create Campus Placement Drive",
    label: "Drive Name / College Partnership",
    placeholder: "e.g. Rajagiri Engineering Campus Drive 2026",
    defaultType: "Campus Recruitment",
    description: "Schedule campus placement, pool drives, technical rounds and hiring slots.",
  },
  job: {
    title: "Create Fresher Job Opening",
    label: "Role / Program Title",
    placeholder: "e.g. Graduate Software Trainee (2026 Batch)",
    defaultType: "Fresher Job",
    description: "Publish entry-level and campus graduate job opportunities across portals.",
  },
  internship: {
    title: "Launch Internship Program",
    label: "Internship Title",
    placeholder: "e.g. AI / Full Stack Software Engineering Intern",
    defaultType: "Internship",
    description: "Set up mentored 3-6 month internship batches with conversion tracks.",
  },
  apprenticeship: {
    title: "Create Structured Apprenticeship",
    label: "Apprenticeship Program Name",
    placeholder: "e.g. Cloud & DevOps Apprenticeship Track",
    defaultType: "Apprenticeship",
    description: "Configure learn-and-earn structured apprenticeship cohorts.",
  },
  junior: {
    title: "Post Junior Role (0–2 Yrs)",
    label: "Junior Role Title",
    placeholder: "e.g. Junior Product Analyst",
    defaultType: "Junior Employee",
    description: "Hire high-aptitude early-career candidates with 0–2 years of experience.",
  },
};

export const HIRING_TYPES = [
  "Campus Recruitment",
  "Fresher Job",
  "Internship",
  "Apprenticeship",
  "Junior Employee",
];

export const DEPARTMENTS = [
  "Technology & Engineering",
  "Product & Design",
  "Data Science & AI",
  "Finance & Operations",
  "Human Resources",
  "Marketing & Growth",
  "Customer Success & QA",
];

export const STAGE_TONE: Record<CandidateStage, Tone> = {
  Screening: "gray",
  Assessment: "blue",
  Interview: "orange",
  Offer: "emerald",
  Joined: "green",
};

export const FILTERS = {
  qualification: [
    "All Qualifications",
    "B.Tech / BE",
    "BCA / MCA",
    "MBA / PGDM",
    "B.Com / BBA",
    "M.Tech / MS",
    "B.Des / M.Des",
  ],
  stage: [
    "All Stages",
    "Screening",
    "Assessment",
    "Interview",
    "Offer",
    "Joined",
  ],
  location: [
    "All Locations",
    "Bengaluru, Karnataka",
    "Chennai, Tamil Nadu",
    "Kochi, Kerala",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Remote / Hybrid",
  ],
  driveStatus: [
    "All Drive Status",
    "Upcoming",
    "Registration Open",
    "Live / In Progress",
    "Completed",
  ],
  college: [
    "All College Types",
    "IITs & NITs (Tier 1)",
    "Top Private & Autonomous",
    "Management & B-Schools",
    "Arts & Science Colleges",
  ],
  stream: [
    "All Streams",
    "Engineering & Tech",
    "Data & AI",
    "Design & UX",
    "Business & Operations",
  ],
};
