'use client';

import React from 'react';
import { ApplicationItem } from '@/features/applications/types';
import { CandidateOnboardingContainer } from '@/features/onboarding/components/CandidateOnboardingContainer';

interface JobOnboardingViewProps {
  applications?: ApplicationItem[];
  selectedApp?: ApplicationItem | null;
  onSelectApp?: (app: ApplicationItem) => void;
  onSwitchTab?: (tab: string, stage?: string) => void;
}

export function JobOnboardingView({
  selectedApp,
  onSelectApp,
  onSwitchTab,
}: JobOnboardingViewProps) {
  return (
    <CandidateOnboardingContainer
      selectedApp={selectedApp}
      onSelectApp={onSelectApp}
      onSwitchTab={onSwitchTab}
    />
  );
}
