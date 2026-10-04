export type TestCategory = 'aptitude' | 'technical';
export type TestMode = 'objective' | 'rapid' | 'descriptive' | 'quick5m';

export interface MockupClientQuestion {
  id: string;
  index: number;
  type: 'objective' | 'rapid' | 'descriptive';
  question: string;
  category: string;
  options: string[];
  difficulty?: string;
  starTip?: string;
  // Included upon completion
  correctAnswer?: string;
  correctOptionIndex?: number;
  explanation?: string;
}

export interface MockupAnswerPayload {
  questionId: string;
  selectedOption?: number;
  selectedAnswer?: string;
  textAnswer?: string;
  timeSpentSeconds?: number;
  isCorrect?: boolean;
}

export interface MockupScorecard {
  overallScore: number;
  correctCount?: number;
  totalQuestions?: number;
  percentage?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  starCoherence?: number;
  speechPacingWpm?: number;
  readinessIndex?: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  starAnalysis?: {
    s: string;
    t: string;
    a: string;
    r: string;
  };
}

export type InteractionMode = 'text' | 'audio' | 'video';

export interface MockupSessionResponse {
  sessionId: string;
  testType: TestCategory;
  mode: TestMode;
  assessmentType?: string;
  interactionMode?: InteractionMode;
  jobDescription?: string;
  extractedSkills: string[];
  totalQuestions?: number;
  score?: number;
  totalPossible?: number;
  percentage?: number;
  durationSeconds?: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  questions: MockupClientQuestion[];
  answers?: MockupAnswerPayload[];
  scorecard?: MockupScorecard;
}

export interface DescriptiveEvaluationResult {
  score: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  starCoherence: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  starAnalysis: {
    s: string;
    t: string;
    a: string;
    r: string;
  };
}
