import { apiClient } from "@/shared/services/apiClient";
import {
  AdmissionApplication,
  AdmissionTrack,
  AdmissionStage,
  CreateAdmissionTrackInput,
  CreateAdmissionApplicationInput,
  UpdateAdmissionApplicationInput,
} from "../types/admission.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const admissionService = {
  async getTracks(): Promise<AdmissionTrack[]> {
    const res = await apiClient.get<never, ApiResponse<AdmissionTrack[]>>("/institution/admission/tracks");
    return res.data;
  },

  async createTrack(payload: CreateAdmissionTrackInput): Promise<AdmissionTrack> {
    const res = await apiClient.post<never, ApiResponse<AdmissionTrack>>(
      "/institution/admission/tracks",
      payload
    );
    return res.data;
  },

  async getApplications(filters?: {
    program?: string;
    stage?: string;
    search?: string;
  }): Promise<AdmissionApplication[]> {
    const res = await apiClient.get<never, ApiResponse<AdmissionApplication[]>>(
      "/institution/admission/applications",
      {
        params: filters,
      }
    );
    return res.data;
  },

  async createApplication(payload: CreateAdmissionApplicationInput): Promise<AdmissionApplication> {
    const res = await apiClient.post<never, ApiResponse<AdmissionApplication>>(
      "/institution/admission/applications",
      payload
    );
    return res.data;
  },

  async updateStage(
    applicationId: string,
    stage: AdmissionStage,
    note?: string
  ): Promise<AdmissionApplication> {
    const res = await apiClient.patch<never, ApiResponse<AdmissionApplication>>(
      `/institution/admission/applications/${applicationId}/stage`,
      { stage, note }
    );
    return res.data;
  },

  async updateApplication(
    applicationId: string,
    payload: UpdateAdmissionApplicationInput
  ): Promise<AdmissionApplication> {
    const res = await apiClient.patch<never, ApiResponse<AdmissionApplication>>(
      `/institution/admission/applications/${applicationId}`,
      payload
    );
    return res.data;
  },

  async bulkIssueCallLetters(applicantIds: string[]): Promise<{ updatedCount: number }> {
    const res = await apiClient.post<never, ApiResponse<{ updatedCount: number }>>(
      "/institution/admission/applications/bulk-call-letters",
      { applicantIds }
    );
    return res.data;
  },

  async addNote(applicationId: string, note: string): Promise<AdmissionApplication> {
    const res = await apiClient.post<never, ApiResponse<AdmissionApplication>>(
      `/institution/admission/applications/${applicationId}/notes`,
      { note }
    );
    return res.data;
  },
};
