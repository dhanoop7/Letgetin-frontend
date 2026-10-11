import { apiClient } from '@/shared/services/apiClient';
import {
  Interview,
  InterviewStage,
  CreateInterviewInput,
  GenerateAiQuestionsInput,
  EvaluateSessionInput,
  AiQuestion,
  AiScorecard,
  JoinAccessResult,
} from '../types';

export const interviewService = {
  /**
   * List interviews with optional stage and search filtering
   */
  async getInterviews(params?: { stage?: InterviewStage; date?: string; search?: string }): Promise<Interview[]> {
    const res: any = await apiClient.get('/interviews', { params });
    return res.data || [];
  },

  /**
   * Get an interview by ID
   */
  async getInterviewById(id: string): Promise<Interview> {
    const res: any = await apiClient.get(`/interviews/${id}`);
    return res.data;
  },

  /**
   * Schedule a new interview
   */
  async createInterview(input: CreateInterviewInput): Promise<Interview> {
    const res: any = await apiClient.post('/interviews', input);
    return res.data;
  },

  /**
   * Update interview fields
   */
  async updateInterview(id: string, input: Partial<CreateInterviewInput>): Promise<Interview> {
    const res: any = await apiClient.put(`/interviews/${id}`, input);
    return res.data;
  },

  /**
   * Update interview stage (Kanban drag & drop or select)
   */
  async updateStage(id: string, stage: InterviewStage): Promise<Interview> {
    const res: any = await apiClient.patch(`/interviews/${id}/stage`, { stage });
    return res.data;
  },

  /**
   * Submit interview panel feedback & score
   */
  async submitFeedback(id: string, score: number, feedbackNotes: string): Promise<Interview> {
    const res: any = await apiClient.post(`/interviews/${id}/feedback`, { score, feedbackNotes });
    return res.data;
  },

  /**
   * Delete an interview
   */
  async deleteInterview(id: string): Promise<void> {
    await apiClient.delete(`/interviews/${id}`);
  },

  /**
   * Generate role-specific interview questions via Gemini AI
   */
  async generateAiQuestions(input: GenerateAiQuestionsInput): Promise<AiQuestion[]> {
    const res: any = await apiClient.post('/interviews/ai/questions', input);
    return res.data || [];
  },

  /**
   * Evaluate candidate interview answers via Gemini AI
   */
  async evaluateSession(input: EvaluateSessionInput): Promise<AiScorecard> {
    const res: any = await apiClient.post('/interviews/ai/evaluate', input);
    return res.data;
  },

  /**
   * Validate join access and check 15-minute join window lock
   */
  async validateJoinAccess(id: string): Promise<JoinAccessResult> {
    const res: any = await apiClient.get(`/interviews/${id}/join-access`);
    return res.data;
  },

  /**
   * Send WebRTC signaling message
   */
  async sendSignalingMessage(interviewId: string, clientId: string, payload: any): Promise<boolean> {
    const res: any = await apiClient.post(`/interviews/${interviewId}/signal/message`, {
      clientId,
      payload,
    });
    return res.success;
  },

  /**
   * Get the EventSource signaling URL
   */
  getSignalingStreamUrl(interviewId: string, role: 'candidate' | 'interviewer'): string {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${base}/interviews/${interviewId}/signal/stream?role=${role}`;
  },

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

