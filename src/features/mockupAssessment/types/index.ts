import { Code2, MessageSquare } from 'lucide-react';

export type InteractionModeType = 'text' | 'audio' | 'video';

export interface AssessmentQuestionItem {
  id: string;
  questionNumber: number;
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  expectedAnswer: string;
  keywords: string[];
  explanation: string;
  hint?: string;
  codeSnippet?: string;
}

export interface AssessmentMode {
  id: string;
  title: string;
  badge: string;
  icon: typeof Code2;
  iconBg: string;
  iconColor: string;
  description: string;
  duration: string;
  questions: AssessmentQuestionItem[];
}

export interface InteractionModeOption {
  id: InteractionModeType;
  title: string;
  icon: typeof MessageSquare;
  iconBg: string;
  iconColor: string;
  description: string;
  badge: string;
}

export interface AnswerRecord {
  questionId: string;
  answerType: 'objective' | 'typed';
  selectedOptionIndex?: number;
  userAnswer: string;
  isCorrect: boolean;
  scoreAwarded: boolean;
  expectedAnswer: string;
  explanation: string;
  submittedAt: number;
}
