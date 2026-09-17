import { apiClient } from '@/shared/services/apiClient';
import {
  IHiringFunnelConfig,
  IFunnelMetricsReport,
  StageCandidatesResponse,
  ICandidateStageHistory,
  AdvanceCandidatePayload,
  FailCandidatePayload,
  RefillStagePayload,
  HiringEngineCandidate,
} from '../types/hiringEngine.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export const hiringEngineService = {
  /**
   * GET /api/recruiter/jobs/:jobId/hiring-engine/config
   * Retrieves the current pipeline configuration and stage definitions.
   */
  async getPipelineConfig(jobId: string): Promise<IHiringFunnelConfig> {
    const res = await apiClient.get<never, ApiResponse<IHiringFunnelConfig>>(
      `/recruiter/jobs/${jobId}/hiring-engine/config`
    );
    return res.data;
  },

  /**
   * GET /api/recruiter/jobs/:jobId/hiring-engine/funnel-metrics
   * Retrieves real-time funnel health, target vs active candidates, deficit, and stage breakdowns.
   */
  async getFunnelMetrics(jobId: string): Promise<IFunnelMetricsReport> {
    const res = await apiClient.get<never, ApiResponse<IFunnelMetricsReport>>(
      `/recruiter/jobs/${jobId}/hiring-engine/funnel-metrics`
    );
    return res.data;
  },

  /**
   * GET /api/recruiter/jobs/:jobId/hiring-engine/stages/:stageId/candidates
   * Lists primary and reserve candidates for a specific stage.
   */
  async getStageCandidates(jobId: string, stageId: string): Promise<StageCandidatesResponse> {
    const res = await apiClient.get<never, ApiResponse<StageCandidatesResponse>>(
      `/recruiter/jobs/${jobId}/hiring-engine/stages/${stageId}/candidates`
    );
    return res.data;
  },

  /**
   * GET /api/recruiter/jobs/:jobId/hiring-engine/candidates/:applicationId/history
   * Retrieves the immutable audit log for a candidate's stage transitions.
   */
  async getCandidateHistory(jobId: string, applicationId: string): Promise<ICandidateStageHistory[]> {
    const res = await apiClient.get<never, ApiResponse<ICandidateStageHistory[]>>(
      `/recruiter/jobs/${jobId}/hiring-engine/candidates/${applicationId}/history`
    );
    return res.data;
  },

  /**
   * POST /api/recruiter/jobs/:jobId/hiring-engine/candidates/:applicationId/advance
   * Advances a candidate to the next stage or final shortlist.
   */
  async advanceCandidate(
    jobId: string,
    applicationId: string,
    payload?: AdvanceCandidatePayload
  ): Promise<{ application: HiringEngineCandidate; nextStageId: string | null; isFinalShortlist: boolean }> {
    const res = await apiClient.post<
      never,
      ApiResponse<{ application: HiringEngineCandidate; nextStageId: string | null; isFinalShortlist: boolean }>
    >(`/recruiter/jobs/${jobId}/hiring-engine/candidates/${applicationId}/advance`, payload || {});
    return res.data;
  },

  /**
   * POST /api/recruiter/jobs/:jobId/hiring-engine/candidates/:applicationId/fail
   * Marks candidate as failed and triggers dynamic refill from reserves if deficit exists.
   */
  async failCandidate(
    jobId: string,
    applicationId: string,
    payload?: FailCandidatePayload
  ): Promise<{
    application: HiringEngineCandidate;
    promotedCount: number;
    promotedCandidates: HiringEngineCandidate[];
    message?: string;
  }> {
    const res = await apiClient.post<
      never,
      ApiResponse<{
        application: HiringEngineCandidate;
        promotedCount: number;
        promotedCandidates: HiringEngineCandidate[];
      }>
    >(`/recruiter/jobs/${jobId}/hiring-engine/candidates/${applicationId}/fail`, payload || {});
    return {
      ...res.data,
      message: res.message,
    };
  },

  /**
   * POST /api/recruiter/jobs/:jobId/hiring-engine/stages/:stageId/refill
   * Manually pulls from reserve candidates into primary pool.
   */
  async refillStage(
    jobId: string,
    stageId: string,
    payload?: RefillStagePayload
  ): Promise<{
    promotedCount: number;
    promotedCandidates: HiringEngineCandidate[];
    message?: string;
  }> {
    const res = await apiClient.post<
      never,
      ApiResponse<{
        promotedCount: number;
        promotedCandidates: HiringEngineCandidate[];
      }>
    >(`/recruiter/jobs/${jobId}/hiring-engine/stages/${stageId}/refill`, payload || {});
    return {
      ...res.data,
      message: res.message,
    };
  },

  /**
   * POST /api/recruiter/jobs/:jobId/hiring-engine/config
   * Initializes or reconfigures the hiring funnel.
   */
  async configurePipeline(
    jobId: string,
    payload: {
      finalShortlistTarget: number;
      stages: Array<{
        stageId: string;
        stageName: string;
        stageType: string;
        order: number;
        expectedAttendanceRate: number;
        expectedPassRate: number;
        deadlineHours?: number;
        autoAdvanceScoreThreshold?: number;
      }>;
    }
  ): Promise<{ config: IHiringFunnelConfig; initialMetrics: IFunnelMetricsReport }> {
    const res = await apiClient.post<
      never,
      ApiResponse<{ config: IHiringFunnelConfig; initialMetrics: IFunnelMetricsReport }>
    >(`/recruiter/jobs/${jobId}/hiring-engine/config`, payload);
    return res.data;
  },
};
