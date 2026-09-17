export type FunnelStageType = 'resume_match' | 'assessment' | 'ai_interview' | 'manual_review';
export type FunnelConfigStatus = 'draft' | 'active' | 'completed' | 'paused';
export type FunnelHealthState = 'healthy' | 'starved' | 'paused' | 'completed';

export interface IFunnelStage {
  stageId: string;
  stageName: string;
  stageType: FunnelStageType;
  order: number;
  expectedAttendanceRate: number;
  expectedPassRate: number;
  targetCount: number;
  deadlineHours: number;
  autoAdvanceScoreThreshold: number;
  autoRefillEnabled: boolean;
}

export interface IHiringFunnelConfig {
  _id?: string;
  jobId: string;
  orgId?: string;
  finalShortlistTarget: number;
  stages: IFunnelStage[];
  status: FunnelConfigStatus;
  totalFunnelIntakeTarget: number;
  currentShortlistedCount: number;
  lastCalculatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStageMetrics {
  stageId: string;
  stageName: string;
  stageType: string;
  order: number;
  targetCount: number;
  activeCount: number;
  invitedCount: number;
  startedCount: number;
  passedCount: number;
  failedCount: number;
  noShowCount: number;
  deficit: number;
  reserveAvailable: number;
}

export interface IFunnelMetricsReport {
  jobId: string;
  jobTitle: string;
  finalShortlistTarget: number;
  currentShortlistedCount: number;
  totalFunnelIntakeTarget: number;
  totalApplicants: number;
  primaryPoolSize: number;
  reservePoolSize: number;
  health: FunnelHealthState;
  healthReason?: string;
  stages: IStageMetrics[];
}

export interface PopulatedUser {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PopulatedResume {
  _id: string;
  title?: string;
  atsScore?: number;
  createdAt?: string;
}

export type CandidatePoolType = 'primary' | 'reserve' | 'disqualified';
export type CandidateStageStatus = 'invited' | 'started' | 'passed' | 'failed' | 'no_show';

export interface HiringEngineCandidate {
  _id: string;
  userId: PopulatedUser | string;
  jobId: string;
  resumeId?: PopulatedResume | string;
  matchScore?: number;
  compositeRank?: number;
  poolType: CandidatePoolType;
  currentStageIndex?: number;
  currentStageId?: string;
  stageStatus?: CandidateStageStatus;
  stageDeadline?: string;
  assessmentScore?: number;
  aiScore?: number;
  status: string; // ATS status (submitted, shortlisted, rejected, etc.)
  appliedAt: string;
  invitedAt?: string;
  stageStartedAt?: string;
  stageCompletedAt?: string;
}

export interface StageCandidatesResponse {
  stageId: string;
  primary: HiringEngineCandidate[];
  reserve: HiringEngineCandidate[];
}

export interface ICandidateStageHistory {
  _id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  stageId: string;
  stageName: string;
  stageIndex: number;
  status: CandidateStageStatus;
  score?: number;
  evaluationDetails?: Record<string, any>;
  promotedFromReserve?: boolean;
  notes?: string;
  enteredAt: string;
  completedAt?: string;
}

export interface AdvanceCandidatePayload {
  score?: number;
  notes?: string;
  evaluationDetails?: Record<string, any>;
}

export interface FailCandidatePayload {
  reason?: string;
}

export interface RefillStagePayload {
  count?: number;
}
