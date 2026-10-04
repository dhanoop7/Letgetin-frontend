import { apiClient } from '@/shared/services/apiClient';

export const interviewBuddyService = {
  /**
   * Generate tailored Interview Buddy questions via Gemini AI
   */
  async generateBuddyQuestions(params: {
    mode: string;
    jobDescription?: string;
    customConfig?: {
      role?: string;
      seniority?: string;
      scenario?: string;
      interviewStyle?: string;
      technicalScope?: string;
    };
  }): Promise<{
    sessionId: string;
    sessionTitle: string;
    extractedSkills: string[];
    questions: any[];
  }> {
    const res: any = await apiClient.post('/interviews/buddy/generate', params);
    return res.data;
  },

  /**
   * Evaluate a candidate's answer for Interview Buddy via Gemini AI
   */
  async evaluateBuddyAnswer(params: {
    question: string;
    answer: string;
    category?: string;
    mode?: string;
    expectedAnswer?: string;
    jobDescription?: string;
  }): Promise<{
    score: number;
    isCorrect: boolean;
    feedback: string;
    strengths: string[];
    improvements: string[];
    star?: {
      situation?: string;
      task?: string;
      action?: string;
      result?: string;
    };
  }> {
    const res: any = await apiClient.post('/interviews/buddy/evaluate', params);
    return res.data;
  },
};
