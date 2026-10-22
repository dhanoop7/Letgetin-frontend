export type AdmissionStage =
  | 'inquiry'
  | 'submitted'
  | 'shortlisted'
  | 'counseling'
  | 'enrolled'
  | 'rejected';

export type VerificationStatus = 'verified' | 'in_progress' | 'pending' | 'flagged';

export interface DocumentRecord {
  name: string;
  type: string;
  size: string;
  status: VerificationStatus;
  updatedAt: string;
}

export interface BgCheckItem {
  id: string;
  label: string;
  desc: string;
  vendor: string;
  status: VerificationStatus;
  updatedAt: string;
}

export interface AssessmentItem {
  name: string;
  weight: number;
  score: number | null;
  max: number;
  status: 'done' | 'pending';
}

export interface TimelineEvent {
  title: string;
  meta: string;
  date: string;
}

export interface InternalNote {
  text: string;
  author: string;
  createdAt: string;
}

export interface AdmissionApplication {
  _id: string;
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  program: string;
  stage: AdmissionStage;
  score: string;
  gpa: string;
  category: string;
  source: string;
  counselor: string;
  appliedDate: string;
  meritRank?: number;
  meritIndex?: number;
  enrollmentNo?: string;
  feeStatus: 'Full Fee Paid' | 'Token Paid (₹50k)' | 'Scholarship 100%' | 'Pending';
  scholarshipTier: string;
  hostelOpted: boolean;
  callLetterSent: boolean;
  documents: DocumentRecord[];
  bgChecks: {
    overall: VerificationStatus;
    checks: BgCheckItem[];
  };
  assessments: AssessmentItem[];
  timeline: TimelineEvent[];
  notes: InternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionTrack {
  _id: string;
  program: string;
  school: string;
  seats: number;
  appliedCount: number;
  startDate: string;
  deadline: string;
  eligibility: string;
  applicationFee: string;
  status: 'Open' | 'Upcoming' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionTrackInput {
  program: string;
  school: string;
  seats: number;
  startDate?: string;
  deadline?: string;
  eligibility?: string;
  applicationFee?: string;
  status?: 'Open' | 'Upcoming' | 'Closed';
}

export interface CreateAdmissionApplicationInput {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  program: string;
  stage?: AdmissionStage;
  score?: string;
  gpa?: string;
  category?: string;
  source?: string;
  counselor?: string;
  hostelOpted?: boolean;
}

export interface UpdateAdmissionApplicationInput {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  program?: string;
  stage?: AdmissionStage;
  score?: string;
  gpa?: string;
  category?: string;
  source?: string;
  counselor?: string;
  meritRank?: number;
  meritIndex?: number;
  enrollmentNo?: string;
  feeStatus?: 'Full Fee Paid' | 'Token Paid (₹50k)' | 'Scholarship 100%' | 'Pending';
  scholarshipTier?: string;
  hostelOpted?: boolean;
  callLetterSent?: boolean;
}
