import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Candidate,
  ChecklistItem,
  PersonalInfoFormValues,
  BankTaxFormValues,
  StepId,
  StepProgressState,
  StepStatus,
  TrainingModule,
  UploadedDoc,
} from '../types';
import { mockCandidate } from '../mocks/candidate';
import { mockPolicies } from '../mocks/policies';
import { mockTrainingModules } from '../mocks/modules';
import { mockChecklistItems } from '../mocks/checklist';
import { STEP_ORDER } from '../lib/constants';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

interface CandidateOnboardingState {
  candidate: Candidate;
  activeStep: 'dashboard' | StepId;
  stepStatus: StepProgressState;
  offerAccepted: boolean;
  offerAcceptedDate?: string;
  
  // Drafts for autosave
  personalDraft: Partial<PersonalInfoFormValues>;
  bankDraft: Partial<BankTaxFormValues>;
  
  // Documents
  uploadedDocs: UploadedDoc[];
  
  // Policies
  readPolicyIds: string[];
  acknowledgedPolicyIds: string[];
  
  // Training
  trainingModules: TrainingModule[];
  
  // Checklist
  checklist: ChecklistItem[];
  
  // Final submission state
  isSubmitted: boolean;
  submittedAt?: string;

  // Actions
  setActiveStep: (step: 'dashboard' | StepId) => void;
  syncWithSelectedApp: (app: any, user?: any) => void;
  setCandidate: (candidate: Partial<Candidate>) => void;
  setStepStatus: (stepId: StepId, status: StepStatus) => void;
  acceptOffer: () => void;
  savePersonalDraft: (draft: Partial<PersonalInfoFormValues>) => void;
  saveBankDraft: (draft: Partial<BankTaxFormValues>) => void;
  addUploadedDoc: (doc: UploadedDoc) => void;
  removeUploadedDoc: (docId: string) => void;
  markPolicyAsRead: (policyId: string) => void;
  acknowledgePolicy: (policyId: string) => void;
  acknowledgeAllPolicies: () => void;
  updateTrainingProgress: (moduleId: string, progress: number, completed?: boolean) => void;
  toggleChecklistItem: (itemId: string) => void;
  submitOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialStepStatus: StepProgressState = {
  welcome: 'not_started',
  personal: 'not_started',
  documents: 'not_started',
  bank: 'not_started',
  policies: 'not_started',
  training: 'not_started',
  team: 'not_started',
  checklist: 'not_started',
};

export const useCandidateOnboardingStore = create<CandidateOnboardingState>()(
  persist(
    (set, get) => ({
      candidate: mockCandidate,
      activeStep: 'dashboard',
      stepStatus: initialStepStatus,
      offerAccepted: false,
      offerAcceptedDate: undefined,
      personalDraft: {},
      bankDraft: {
        taxRegime: 'New Regime',
        accountType: 'Savings',
      },
      uploadedDocs: [],
      readPolicyIds: [],
      acknowledgedPolicyIds: [],
      trainingModules: mockTrainingModules,
      checklist: mockChecklistItems,
      isSubmitted: false,
      submittedAt: undefined,

      setActiveStep: (step) => set({ activeStep: step }),

      syncWithSelectedApp: (app, user) => {
        if (!app) return;
        set((state) => {
          const jobTitle = app.job?.title || app.title || state.candidate.role;
          const companyName = app.job?.company?.name || app.company || state.candidate.company;
          const location =
            app.job?.location?.city && app.job?.location?.country
              ? `${app.job.location.city}, ${app.job.location.country}`
              : app.job?.location?.country || state.candidate.location;
          const candidateName = user?.fullName || state.candidate.name;
          const candidateEmail = user?.email || state.candidate.email;

          return {
            candidate: {
              ...state.candidate,
              name: candidateName,
              email: candidateEmail,
              role: jobTitle,
              company: companyName,
              location,
            },
          };
        });
      },

      setCandidate: (candidateData) =>
        set((state) => ({
          candidate: { ...state.candidate, ...candidateData },
        })),

      setStepStatus: (stepId, status) =>
        set((state) => ({
          stepStatus: {
            ...state.stepStatus,
            [stepId]: status,
          },
        })),

      acceptOffer: () => {
        const now = new Date().toISOString();
        set((state) => ({
          offerAccepted: true,
          offerAcceptedDate: now,
          stepStatus: {
            ...state.stepStatus,
            welcome: 'completed',
            personal: state.stepStatus.personal === 'not_started' ? 'in_progress' : state.stepStatus.personal,
          },
        }));
      },

      savePersonalDraft: (draft) =>
        set((state) => ({
          personalDraft: { ...state.personalDraft, ...draft },
          stepStatus: {
            ...state.stepStatus,
            personal: state.stepStatus.personal === 'completed' ? 'completed' : 'in_progress',
          },
        })),

      saveBankDraft: (draft) =>
        set((state) => ({
          bankDraft: { ...state.bankDraft, ...draft },
          stepStatus: {
            ...state.stepStatus,
            bank: state.stepStatus.bank === 'completed' ? 'completed' : 'in_progress',
          },
        })),

      addUploadedDoc: (newDoc) =>
        set((state) => {
          const filtered = state.uploadedDocs.filter((d) => d.type !== newDoc.type);
          const updated = [...filtered, newDoc];
          return {
            uploadedDocs: updated,
            stepStatus: {
              ...state.stepStatus,
              documents: state.stepStatus.documents === 'completed' ? 'completed' : 'in_progress',
            },
          };
        }),

      removeUploadedDoc: (docId) =>
        set((state) => ({
          uploadedDocs: state.uploadedDocs.filter((d) => d.id !== docId),
        })),

      markPolicyAsRead: (policyId) =>
        set((state) => {
          if (state.readPolicyIds.includes(policyId)) return state;
          return {
            readPolicyIds: [...state.readPolicyIds, policyId],
          };
        }),

      acknowledgePolicy: (policyId) =>
        set((state) => {
          const acked = state.acknowledgedPolicyIds.includes(policyId)
            ? state.acknowledgedPolicyIds
            : [...state.acknowledgedPolicyIds, policyId];
          const allAcked = mockPolicies.every((p) => acked.includes(p.id));
          return {
            acknowledgedPolicyIds: acked,
            stepStatus: {
              ...state.stepStatus,
              policies: allAcked ? 'completed' : 'in_progress',
            },
          };
        }),

      acknowledgeAllPolicies: () =>
        set((state) => {
          const allIds = mockPolicies.map((p) => p.id);
          return {
            readPolicyIds: allIds,
            acknowledgedPolicyIds: allIds,
            stepStatus: {
              ...state.stepStatus,
              policies: 'completed',
            },
          };
        }),

      updateTrainingProgress: (moduleId, progress, completed = false) =>
        set((state) => {
          const updated = state.trainingModules.map((m) => {
            if (m.id === moduleId) {
              const isDone = completed || progress >= 100;
              return {
                ...m,
                progress: isDone ? 100 : Math.max(m.progress, progress),
                isCompleted: isDone,
              };
            }
            return m;
          });
          const allCompleted = updated.every((m) => m.isCompleted);
          return {
            trainingModules: updated,
            stepStatus: {
              ...state.stepStatus,
              training: allCompleted ? 'completed' : 'in_progress',
            },
          };
        }),

      toggleChecklistItem: (itemId) =>
        set((state) => {
          const updated = state.checklist.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
          );
          const allCompleted = updated.every((item) => item.isCompleted);
          return {
            checklist: updated,
            stepStatus: {
              ...state.stepStatus,
              checklist: allCompleted ? 'completed' : 'in_progress',
            },
          };
        }),

      submitOnboarding: () =>
        set((state) => ({
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          stepStatus: {
            ...state.stepStatus,
            checklist: 'completed',
          },
        })),

      resetOnboarding: () =>
        set({
          candidate: mockCandidate,
          activeStep: 'dashboard',
          stepStatus: initialStepStatus,
          offerAccepted: false,
          offerAcceptedDate: undefined,
          personalDraft: {},
          bankDraft: {
            taxRegime: 'New Regime',
            accountType: 'Savings',
          },
          uploadedDocs: [],
          readPolicyIds: [],
          acknowledgedPolicyIds: [],
          trainingModules: mockTrainingModules.map((m) => ({ ...m, progress: 0, isCompleted: false })),
          checklist: mockChecklistItems.map((c, i) => ({ ...c, isCompleted: i === 0 })),
          isSubmitted: false,
          submittedAt: undefined,
        }),
    }),
    {
      name: 'letgetin-candidate-onboarding-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stepStatus: state.stepStatus,
        offerAccepted: state.offerAccepted,
        offerAcceptedDate: state.offerAcceptedDate,
        personalDraft: state.personalDraft,
        bankDraft: state.bankDraft,
        uploadedDocs: state.uploadedDocs,
        readPolicyIds: state.readPolicyIds,
        acknowledgedPolicyIds: state.acknowledgedPolicyIds,
        trainingModules: state.trainingModules,
        checklist: state.checklist,
        isSubmitted: state.isSubmitted,
        submittedAt: state.submittedAt,
      }),
    },
  ),
);

export const selectOverallProgress = (state: CandidateOnboardingState): number => {
  const steps = STEP_ORDER;
  const completedCount = steps.filter((stepId) => state.stepStatus[stepId] === 'completed').length;
  return Math.round((completedCount / steps.length) * 100);
};

export const selectCompletedStepsCount = (state: CandidateOnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'completed').length;
};

export const selectInProgressStepsCount = (state: CandidateOnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'in_progress').length;
};

export const selectPendingStepsCount = (state: CandidateOnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'not_started').length;
};

export const isStepLocked = (stepId: StepId, stepStatus: StepProgressState): boolean => {
  switch (stepId) {
    case 'welcome':
      return false;
    case 'personal':
      return stepStatus.welcome !== 'completed';
    case 'documents':
      return stepStatus.personal !== 'completed';
    case 'bank':
      return stepStatus.documents !== 'completed';
    case 'policies':
      return stepStatus.bank !== 'completed';
    case 'training':
      return stepStatus.policies !== 'completed';
    case 'team':
      return stepStatus.policies !== 'completed';
    case 'checklist':
      return (
        stepStatus.welcome !== 'completed' ||
        stepStatus.personal !== 'completed' ||
        stepStatus.documents !== 'completed' ||
        stepStatus.bank !== 'completed' ||
        stepStatus.policies !== 'completed'
      );
    default:
      return false;
  }
};
