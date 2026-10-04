import { Video } from 'lucide-react';

export interface QuestionItem {
  id: string;
  questionNumber: number;
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  expectedAnswer: string;
  keywords: string[];
  explanation: string;
  starTip?: string;
  codeSnippet?: string;
}

export interface InterviewMode {
  id: string;
  title: string;
  badge: string;
  icon: typeof Video;
  iconBg: string;
  iconColor: string;
  description: string;
  actionText: string;
  interviewerIntro: string;
  questions: QuestionItem[];
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
