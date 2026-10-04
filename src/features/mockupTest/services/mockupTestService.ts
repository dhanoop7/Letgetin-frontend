import { apiClient } from '@/shared/services/apiClient';
import {
  TestCategory,
  TestMode,
  MockupClientQuestion,
  MockupAnswerPayload,
  MockupSessionResponse,
  MockupScorecard,
  DescriptiveEvaluationResult,
  InteractionMode,
} from '../types';

export {
  type TestCategory,
  type TestMode,
  type MockupClientQuestion,
  type MockupAnswerPayload,
  type MockupSessionResponse,
  type MockupScorecard,
  type DescriptiveEvaluationResult,
  type InteractionMode,
};

export const mockupTestService = {
  /**
   * Analyze Job Description & generate question sets
   */
  async generateQuestions(params: {
    testType?: TestCategory;
    assessmentType?: string;
    interactionMode?: InteractionMode;
    jobDescription?: string;
    mode?: TestMode;
  }): Promise<{ questions: MockupClientQuestion[]; extractedSkills: string[] }> {
    const res: any = await apiClient.post('/mockup-tests/generate', params);
    return res.data;
  },

  /**
   * Create and initialize a new test session in DB
   */
  async createSession(params: {
    testType?: TestCategory;
    assessmentType?: string;
    interactionMode?: InteractionMode;
    mode?: TestMode;
    jobDescription?: string;
  }): Promise<MockupSessionResponse> {
    const res: any = await apiClient.post('/mockup-tests/session', params);
    return res.data;
  },

  /**
   * Fetch active or completed session by sessionId
   */
  async getSession(sessionId: string): Promise<MockupSessionResponse> {
    const res: any = await apiClient.get(`/mockup-tests/session/${sessionId}`);
    return res.data;
  },

  /**
   * Submit candidate answers for scoring and AI STAR evaluation
   */
  async submitSession(
    sessionId: string,
    payload: {
      answers: MockupAnswerPayload[];
      durationSeconds?: number;
    }
  ): Promise<MockupSessionResponse> {
    const res: any = await apiClient.post(
      `/mockup-tests/session/${sessionId}/submit`,
      payload
    );
    return res.data;
  },

  /**
   * Evaluate a single descriptive answer on-the-fly via Gemini
   */
  async evaluateDescriptive(params: {
    question: string;
    answer: string;
    category?: string;
    testType?: TestCategory;
    jobDescription?: string;
  }): Promise<DescriptiveEvaluationResult> {
    const res: any = await apiClient.post(
      '/mockup-tests/evaluate-descriptive',
      params
    );
    return res.data;
  },

  /**
   * Generate tailored Mockup Assessment questions via Gemini
   */
  async generateAssessmentQuestions(params: {
    assessmentType: string;
    interactionMode: InteractionMode;
    jobDescription: string;
  }): Promise<{
    sessionId: string;
    assessment: {
      title: string;
      assessmentType: string;
      interactionMode: string;
      durationMinutes: number;
    };
    extractedSkills: string[];
    questions: any[];
  }> {
    const res: any = await apiClient.post(
      '/mockup-tests/generate-assessment',
      params
    );
    return res.data;
  },

  /**
   * Evaluate candidate answer for Mockup Assessment with Gemini
   */
  async evaluateAssessmentAnswer(params: {
    question: string;
    answer: string;
    category?: string;
    assessmentType?: string;
    expectedAnswer?: string;
    jobDescription?: string;
    interactionMode?: InteractionMode;
  }): Promise<DescriptiveEvaluationResult> {
    const res: any = await apiClient.post(
      '/mockup-tests/evaluate-assessment-answer',
      params
    );
    return res.data;
  },

  /**
   * Get past completed mockup sessions for user
   */
  async getUserSessions(): Promise<any[]> {
    const res: any = await apiClient.get('/mockup-tests/sessions');
    return res.data || [];
  },
};
