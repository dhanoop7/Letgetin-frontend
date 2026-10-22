import { apiClient } from '@/shared/services/apiClient';

export interface CreditTransaction {
  _id: string;
  type: 'purchase' | 'spend' | 'grant' | 'referral' | 'refund';
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  feature?: string;
  reason: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
}

export interface UserSubscription {
  _id: string;
  planId: string;
  planName: string;
  billingCycle: string;
  creditsIncluded: number;
  priceInr: number;
  quotaTotal?: number;
  quotaUsed?: number;
  quotaRemaining?: number;
  packageType?: 'subscription' | 'ai_apply' | 'candidate_package' | 'company_promotion' | 'promotion' | 'startup_service' | 'startup';
  startDate: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CandidatePlanItem {
  id: string;
  name: string;
  chargingUnit: string;
  credits: number;
  priceInr: number;
  category: string;
  description?: string;
  durationDays?: number;
  jobLimit?: number;
  actionUrl?: string;
}

export interface CandidateCategoryGroup {
  id: string;
  title: string;
  description: string;
  items: CandidatePlanItem[];
}

export interface CompanyPlanItem {
  id: string;
  name: string;
  chargingUnit: string;
  credits: number;
  priceInr: number;
  category: string;
  description?: string;
  durationDays?: number;
  actionUrl?: string;
  providerFeeNote?: string;
  caseByCase?: boolean;
}

export interface CompanyCategoryGroup {
  id: string;
  title: string;
  description: string;
  items: CompanyPlanItem[];
}

export interface StartupPlanItem {
  id: string;
  name: string;
  chargingUnit: string;
  credits: number;
  priceInr: number;
  category: string;
  description?: string;
  durationDays?: number;
  actionUrl?: string;
  providerFeeNote?: string;
  caseByCase?: boolean;
}

export interface StartupCategoryGroup {
  id: string;
  title: string;
  description: string;
  items: StartupPlanItem[];
}

export interface InstitutionPlanItem {
  id: string;
  name: string;
  chargingUnit: string;
  credits: number;
  priceInr: number;
  category: string;
  description?: string;
  actionUrl?: string;
}

export interface InstitutionCategoryGroup {
  id: string;
  title: string;
  description: string;
  items: InstitutionPlanItem[];
}

export interface FeaturePriceItem {
  id: string;
  name: string;
  chargingUnit: string;
  credits: number;
  priceInr: number;
  category: string;
  description?: string;
}

export interface SubscriptionDurationTier {
  credits: number;
  priceInr: number;
  days: number;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  targetRole: string;
  durations: {
    monthly: SubscriptionDurationTier;
    six_months: SubscriptionDurationTier;
    yearly: SubscriptionDurationTier;
  };
  features: string[];
}

export interface CreditTopupPack {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  best?: boolean;
}

export interface WalletData {
  balance: number;
  referralCode?: string;
  promotionalGranted: boolean;
  subscriptions: UserSubscription[];
  packages?: UserSubscription[];
  transactions: CreditTransaction[];
  pricingCatalog: {
    creditValueInr: number;
    featurePricing: Record<string, FeaturePriceItem>;
    subscriptionPlans: SubscriptionPlanItem[];
    creditPacks: CreditTopupPack[];
    candidatePlans?: CandidateCategoryGroup[];
    companyPlans?: CompanyCategoryGroup[];
    startupPlans?: StartupCategoryGroup[];
    institutionPlans?: InstitutionCategoryGroup[];
  };
}

export interface CreateOrderResponse {
  orderId: string;
  amountInr: number;
  currency: string;
  credits: number;
  itemName: string;
  purchaseType: string;
  keyId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  balance: number;
  creditsAdded: number;
  orderId: string;
  subscription?: UserSubscription;
}

const PENDING_ACTION_STORAGE_KEY = 'letgetin_pending_action_state';

export const creditService = {
  /**
   * Fetch current user's wallet, transaction history, active subscriptions, and pricing catalog
   */
  async getWallet(): Promise<WalletData> {
    const res = await apiClient.get<never, { success: boolean; data: WalletData }>('/credits/wallet');
    return res.data;
  },

  /**
   * Create a payment order for credits top-up or subscription plan
   */
  async createOrder(params: {
    purchaseType: 'credits' | 'subscription' | 'package';
    itemKey: string;
    billingCycle?: string;
    customCredits?: number;
  }): Promise<CreateOrderResponse> {
    const res = await apiClient.post<never, { success: boolean; data: CreateOrderResponse }>('/credits/order', params);
    return res.data;
  },

  /**
   * Verify payment signature and credit account
   */
  async verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature?: string;
  }): Promise<VerifyPaymentResponse> {
    const res = await apiClient.post<never, { success: boolean; data: VerifyPaymentResponse }>(
      '/credits/verify',
      params
    );
    return res.data;
  },

  /**
   * Claim referral code to earn reward credits
   */
  async claimReferral(referralCode: string): Promise<{ success: boolean; message: string; balance: number }> {
    const res = await apiClient.post<never, { success: boolean; data: { success: boolean; message: string; balance: number } }>(
      '/credits/referral',
      { referralCode }
    );
    return res.data;
  },

  /**
   * Activate candidate package directly using wallet credit balance
   */
  async activatePackage(packageKey: string): Promise<{ success: boolean; message: string; balance: number; subscription: UserSubscription }> {
    const res = await apiClient.post<never, { success: boolean; data: { success: boolean; message: string; balance: number; subscription: UserSubscription } }>(
      '/credits/activate-package',
      { packageKey }
    );
    return res.data;
  },

  /**
   * Activate company promotion using wallet credit balance
   */
  async activatePromotion(params: {
    promoKey: string;
    jobId?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; balance: number; subscription: UserSubscription }> {
    const res = await apiClient.post<never, { success: boolean; data: { success: boolean; message: string; balance: number; subscription: UserSubscription } }>(
      '/credits/activate-promotion',
      params
    );
    return res.data;
  },

  /**
   * Charge credits for a billable company action (Domain Check, BG Verification, AI Hire, etc.)
   */
  async chargeFeature(params: {
    featureKey: string;
    customCredits?: number;
    refId?: string;
    reasonOverride?: string;
  }): Promise<{ success: boolean; message: string; data: { balance: number; cost: number; feature: string } }> {
    const res = await apiClient.post<never, { success: boolean; message: string; data: { balance: number; cost: number; feature: string } }>(
      '/credits/charge',
      params
    );
    return res;
  },

  /**
   * Charge credits for an institution service (Mass application, campus drive, job fair, genius test, etc.)
   */
  async chargeInstitutionFeature(params: {
    featureKey: string;
    count?: number;
    quantity?: number;
    customCredits?: number;
    refId?: string;
    reasonOverride?: string;
    details?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string; balance?: number; data?: { balance: number; cost: number; feature: string } }> {
    const res = await apiClient.post<never, { success: boolean; message: string; balance?: number; data?: { balance: number; cost: number; feature: string } }>(
      '/credits/charge',
      params
    );
    return res;
  },

  /**
   * Request a startup service using wallet credit balance
   */
  async requestStartupService(params: {
    serviceKey: string;
    details?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string; balance?: number; creditsDeducted?: number; data?: any }> {
    const res = await apiClient.post<never, { success: boolean; message: string; balance?: number; creditsDeducted?: number; data?: any }>(
      '/startup/services/request',
      params
    );
    return res;
  },

  /**
   * Save pending action state before redirecting to credit purchase page
   */
  savePendingAction(feature: string, state: Record<string, unknown>, returnUrl: string) {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(
        PENDING_ACTION_STORAGE_KEY,
        JSON.stringify({
          feature,
          state,
          returnUrl,
          savedAt: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Failed to save pending action state to sessionStorage', e);
    }
  },

  /**
   * Retrieve and clear pending action state upon return from credit purchase page
   */
  getAndClearPendingAction(): { feature: string; state: Record<string, unknown>; returnUrl: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
      const parsed = JSON.parse(raw);
      // Valid if saved within past 2 hours
      if (Date.now() - parsed.savedAt < 2 * 3600 * 1000) {
        return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  },

  /**
   * Inspect API error to see if it represents an Insufficient Credits condition
   */
  isInsufficientCreditsError(error: any): {
    isInsufficient: boolean;
    requiredCredits: number;
    availableBalance: number;
    shortfall: number;
    feature?: string;
    message?: string;
  } {
    const err = error?.error || error;
    if (
      err?.code === 'INSUFFICIENT_CREDITS' ||
      error?.statusCode === 402 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('insufficient credits'))
    ) {
      const details = err?.details || {};
      const requiredCredits = Number(details.requiredCredits) || 0;
      const availableBalance = Number(details.availableBalance) || 0;
      const shortfall = Number(details.shortfall) || Math.max(0, requiredCredits - availableBalance);
      return {
        isInsufficient: true,
        requiredCredits,
        availableBalance,
        shortfall,
        feature: details.feature,
        message: err.message,
      };
    }
    return {
      isInsufficient: false,
      requiredCredits: 0,
      availableBalance: 0,
      shortfall: 0,
    };
  },
};
