import { apiClient } from '@/shared/services/apiClient';
import { InteractionModeType } from '../types';

export const mockupAssessmentService = {
  /**
   * Generate tailored Mockup Assessment questions via Gemini
   */
  async generateAssessmentQuestions(params: {
    assessmentType: string;
    interactionMode: InteractionModeType;
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
    interactionMode?: InteractionModeType;
  }): Promise<{
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
  }> {
    const res: any = await apiClient.post(
      '/mockup-tests/evaluate-assessment-answer',
      params
    );
    return res.data;
  },
};
