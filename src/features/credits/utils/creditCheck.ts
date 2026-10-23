import { creditService } from "../services/creditService";
import { showInsufficientCreditsPopup } from "@/components/providers/InsufficientCreditsProvider";

export interface FeatureCreditConfig {
  key: string;
  name: string;
  credits: number;
}

export const FEATURE_CREDIT_CONFIG: Record<string, FeatureCreditConfig> = {
  ats_resume: {
    key: "ats_resume",
    name: "Resume Optimization (ATS)",
    credits: 30,
  },
  verified_resume: {
    key: "verified_resume",
    name: "Verified Resume",
    credits: 30,
  },
  ai_apply: {
    key: "ai_apply",
    name: "AI Apply Package",
    credits: 20,
  },
  ai_apply_10jobs_1day: {
    key: "ai_apply_10jobs_1day",
    name: "AI Apply — 10 jobs/1 day",
    credits: 20,
  },
  ai_apply_20jobs_7days: {
    key: "ai_apply_20jobs_7days",
    name: "AI Apply — 20 jobs/7 days",
    credits: 40,
  },
  ai_apply_50jobs_10days: {
    key: "ai_apply_50jobs_10days",
    name: "AI Apply — 50 jobs/10 days",
    credits: 50,
  },
  mockup_assessment: {
    key: "mockup_assessment",
    name: "Mockup Assessment",
    credits: 20,
  },
  mockup_interview: {
    key: "mockup_interview",
    name: "Mockup Interview",
    credits: 20,
  },
  psychometric_test: {
    key: "psychometric_test",
    name: "Psychometric Test",
    credits: 10,
  },
  genius_test: {
    key: "genius_test",
    name: "Genius Test",
    credits: 10,
  },
  linguistic_test: {
    key: "linguistic_test",
    name: "Linguistic Test",
    credits: 10,
  },
  career_counselling_ai: {
    key: "career_counselling_ai",
    name: "Career Guidance — AI Consultation",
    credits: 3,
  },
  career_counselling_manual: {
    key: "career_counselling_manual",
    name: "Career Guidance — Mentor Session",
    credits: 30,
  },
};

/**
 * Checks candidate's available credit balance before allowing a billable action.
 * If balance is insufficient, displays the Insufficient Credits popup and returns allowed: false.
 */
export async function checkFeatureCredits(
  featureKey: string,
  customCost?: number
): Promise<{ allowed: boolean; availableBalance: number; requiredCredits: number }> {
  try {
    const wallet = await creditService.getWallet();
    const availableBalance = wallet.balance ?? 0;
    const requiredCredits = customCost ?? FEATURE_CREDIT_CONFIG[featureKey]?.credits ?? 20;
    const serviceName = FEATURE_CREDIT_CONFIG[featureKey]?.name || featureKey;

    if (availableBalance < requiredCredits) {
      showInsufficientCreditsPopup({
        feature: featureKey,
        serviceName,
        requiredCredits,
        availableBalance,
      });
      return { allowed: false, availableBalance, requiredCredits };
    }

    return { allowed: true, availableBalance, requiredCredits };
  } catch (err: any) {
    if (creditService.isInsufficientCreditsError(err)) {
      const isIns = creditService.isInsufficientCreditsError(err);
      showInsufficientCreditsPopup({
        feature: featureKey,
        serviceName: FEATURE_CREDIT_CONFIG[featureKey]?.name || featureKey,
        requiredCredits: isIns.requiredCredits || customCost || 20,
        availableBalance: isIns.availableBalance || 0,
      });
      return { allowed: false, availableBalance: isIns.availableBalance || 0, requiredCredits: isIns.requiredCredits || customCost || 20 };
    }
    // In case of unauthenticated or network error, let the action attempt proceed so standard auth/network handlers fire
    return { allowed: true, availableBalance: 0, requiredCredits: customCost || 20 };
  }
}

/**
 * Broadcasts an event that the wallet balance changed so any mounted balance pills or views can refresh.
 */
export function notifyWalletBalanceUpdated(newBalance?: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("letgetin:wallet_updated", {
        detail: { balance: newBalance },
      })
    );
  }
}
