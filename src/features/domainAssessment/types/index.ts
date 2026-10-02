export type AssessmentDifficulty = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
export type AssessmentStatus = 'draft' | 'ready' | 'published' | 'archived';
export type QuestionType = 'mcq' | 'coding' | 'architecture' | 'system_design' | 'debugging' | 'short_answer';
export type TestingMode = 'coding' | 'architecture' | 'system' | 'debugging' | 'database' | 'security';
export type AttemptStatus = 'in_progress' | 'submitted' | 'evaluated' | 'expired';
export type AttemptVerdict = 'strong_hire' | 'hire' | 'borderline' | 'reject';

export interface IMcqOption {
  id: string;
  text: string;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  order: number;
  title: string;
  question: string;
  type: QuestionType;
  testingMode: TestingMode;
  skill: string;
  difficulty: AssessmentDifficulty;
  points: number;
  instructions?: string;
  context?: string;
  starterCode?: string;
  solutionCode?: string;
  language?: string;
  testCases?: ITestCase[];
  options?: IMcqOption[];
  correctOptionId?: string;
  expectedAnswer?: string;
  evaluationCriteria?: string[];
}

export interface AssessmentOptions {
  allowCodeCompilation: boolean;
  enableAiHints: boolean;
  recordScreen: boolean;
  autoEvaluateRubrics: boolean;
}

export interface DomainAssessment {
  id: string;
  _id?: string;
  assessmentId: string;
  recruiterId?: string;
  title: string;
  role: string;
  jobId?: string;
  jobTitle?: string;
  jobDescription: string;
  domain: string;
  skillAreas: string[];
  difficulty: AssessmentDifficulty;
  timeLimitMinutes: number;
  testingModes: TestingMode[];
  options: AssessmentOptions;
  customInstructions?: string;
  status: AssessmentStatus;
  questions: AssessmentQuestion[];
  questionsCount: number;
  totalPoints: number;
  passingPercentage: number;
  attemptsCount?: number;
  completedAttemptsCount?: number;
  averageScore?: number;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoConfigureInput {
  jobTitle?: string;
  jobDescription?: string;
  domain?: string;
}

export interface AutoConfigureOutput {
  domain: string;
  role: string;
  skillAreas: string[];
  difficulty: AssessmentDifficulty;
  timeLimitMinutes: number;
  testingModes: TestingMode[];
  options: AssessmentOptions;
  customInstructions: string;
  summary: string;
}

export interface GenerateQuestionsInput {
  domain: string;
  role?: string;
  skillAreas: string[];
  difficulty: AssessmentDifficulty;
  testingModes: TestingMode[];
  count?: number;
  jobDescription?: string;
  customInstructions?: string;
}

export interface AttemptAnswer {
  questionId: string;
  answer: string;
  language?: string;
  autoSavedAt?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface SkillScoreBreakdown {
  skill: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
}

export interface ModeScoreBreakdown {
  mode: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AttemptEvaluation {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  verdict: AttemptVerdict;
  summary: string;
  skillBreakdown: SkillScoreBreakdown[];
  modeBreakdown: ModeScoreBreakdown[];
  strengths: string[];
  gaps: string[];
  recommendations: string;
  evaluatedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  _id?: string;
  attemptId: string;
  assessmentId: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  timeLimitMinutes: number;
  remainingSeconds?: number;
  answers: AttemptAnswer[];
  evaluation?: AttemptEvaluation;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnalytics {
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface AssessmentResultsResponse {
  assessment: Partial<DomainAssessment>;
  analytics: AssessmentAnalytics;
  attempts: Array<{
    id: string;
    attemptId: string;
    candidateName: string;
    candidateEmail: string;
    status: AttemptStatus;
    startedAt: string;
    submittedAt?: string;
    timeSpentSeconds: number;
    score: number;
    percentage: number;
    passed: boolean;
    verdict: string;
  }>;
}
