import { apiClient } from '@/shared/services/apiClient';

export type HuremasoAccessStatus =
  | 'trial_not_started'
  | 'trial_active'
  | 'trial_expired'
  | 'subscription_active'
  | 'subscription_cancelled';

export interface HuremasoPlan {
  id: 'starter' | 'pro';
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
}

export interface HuremasoStatusData {
  status: HuremasoAccessStatus;
  canLaunch: boolean;
  serverTimestamp: string;
  org: {
    id: string;
    name: string;
  };
  trial: {
    startedAt: string | null;
    expiresAt: string | null;
    daysRemaining: number;
    hoursRemaining: number;
    secondsRemaining: number;
    trialUsed: boolean;
    durationDays: number;
  };
  subscription: {
    planId: string | null;
    planName: string | null;
    billingCycle: string | null;
    amountPaid: number | null;
    currency: string;
    startedAt: string | null;
    expiresAt: string | null;
    paymentId: string | null;
  } | null;
  plans: Record<'starter' | 'pro', HuremasoPlan>;
}

export interface LaunchResponseData {
  launchUrl: string;
  token: string;
  expiresAt: string;
  status: HuremasoAccessStatus;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const huremasoService = {
  async getStatus(): Promise<HuremasoStatusData> {
    const res = await apiClient.get<never, ApiResponse<HuremasoStatusData>>('/recruiter/huremaso/status');
    return res.data;
  },

  async startTrial(): Promise<HuremasoStatusData> {
    const res = await apiClient.post<never, ApiResponse<HuremasoStatusData>>('/recruiter/huremaso/start-trial', {});
    return res.data;
  },

  async launch(): Promise<LaunchResponseData> {
    const res = await apiClient.post<never, ApiResponse<LaunchResponseData>>('/recruiter/huremaso/launch', {});
    return res.data;
  },

  async subscribe(planId: 'starter' | 'pro', billingCycle: 'monthly' | 'annual'): Promise<HuremasoStatusData> {
    const res = await apiClient.post<never, ApiResponse<HuremasoStatusData>>('/recruiter/huremaso/subscribe', {
      planId,
      billingCycle,
    });
    return res.data;
  },
};
