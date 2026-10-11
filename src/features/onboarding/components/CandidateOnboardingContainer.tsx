'use client';

import React, { useEffect } from 'react';
import { ApplicationItem } from '@/features/applications/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { StepId } from '../types';
import {
  useCandidateOnboardingStore,
  selectOverallProgress,
} from '../store/useCandidateOnboardingStore';
import { OnboardingWorkspaceHeader } from './OnboardingWorkspaceHeader';
import { OnboardingStepNav } from './OnboardingStepNav';
import { DashboardView } from './DashboardView';
import { WelcomeView } from './WelcomeView';
import { PersonalInfoView } from './PersonalInfoView';
import { DocumentsView } from './DocumentsView';
import { BankTaxView } from './BankTaxView';
import { PoliciesView } from './PoliciesView';
import { TrainingView } from './TrainingView';
import { TeamView } from './TeamView';
import { ChecklistView } from './ChecklistView';

export interface CandidateOnboardingContainerProps {
  selectedApp?: ApplicationItem | null;
  onSelectApp?: (app: ApplicationItem) => void;
  onSwitchTab?: (tab: string, stage?: string) => void;
}

export const CandidateOnboardingContainer: React.FC<CandidateOnboardingContainerProps> = ({
  selectedApp,
  onSelectApp,
  onSwitchTab,
}) => {
  const { user } = useAuthStore();
  const activeStep = useCandidateOnboardingStore((state) => state.activeStep);
  const setActiveStep = useCandidateOnboardingStore((state) => state.setActiveStep);
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const syncWithSelectedApp = useCandidateOnboardingStore((state) => state.syncWithSelectedApp);
  const overallProgress = useCandidateOnboardingStore(selectOverallProgress);

  // Synchronize candidate details whenever selectedApp or user session changes
  useEffect(() => {
    if (selectedApp) {
      syncWithSelectedApp(selectedApp, user);
    }
  }, [selectedApp, user, syncWithSelectedApp]);

  const handleSelectStep = (step: 'dashboard' | StepId) => {
    setActiveStep(step);
  };

  return (
    <div className="space-y-6">
      {/* 1. Onboarding Header (Job Title, Company, Progress, Actions) */}
      <OnboardingWorkspaceHeader
        selectedApp={selectedApp}
        overallProgress={overallProgress}
      />

      {/* 2. Step Navigation Bar (Dashboard + 8 Steps) */}
      <OnboardingStepNav
        activeStep={activeStep}
        stepStatus={stepStatus}
        onSelectStep={handleSelectStep}
      />

      {/* 3. Active Step Content Area */}
      <div className="w-full transition-all duration-200">
        {activeStep === 'dashboard' && <DashboardView onSelectStep={handleSelectStep} />}
        {activeStep === 'welcome' && <WelcomeView onSelectStep={handleSelectStep} />}
        {activeStep === 'personal' && <PersonalInfoView onSelectStep={handleSelectStep} />}
        {activeStep === 'documents' && <DocumentsView onSelectStep={handleSelectStep} />}
        {activeStep === 'bank' && <BankTaxView onSelectStep={handleSelectStep} />}
        {activeStep === 'policies' && <PoliciesView onSelectStep={handleSelectStep} />}
        {activeStep === 'training' && <TrainingView onSelectStep={handleSelectStep} />}
        {activeStep === 'team' && <TeamView onSelectStep={handleSelectStep} />}
        {activeStep === 'checklist' && <ChecklistView onSelectStep={handleSelectStep} />}
      </div>
    </div>
  );
};
