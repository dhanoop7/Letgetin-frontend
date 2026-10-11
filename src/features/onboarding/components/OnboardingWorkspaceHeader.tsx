'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Compass, Sparkles, Building2, MapPin } from 'lucide-react';
import { ApplicationItem } from '@/features/applications/types';
import { resolveCandidateStatus } from '@/features/applications/utils/candidateStatusResolver';

interface OnboardingWorkspaceHeaderProps {
  selectedApp?: ApplicationItem | null;
  overallProgress: number;
}

export const OnboardingWorkspaceHeader: React.FC<OnboardingWorkspaceHeaderProps> = ({
  selectedApp,
  overallProgress,
}) => {
  const jobTitle = selectedApp?.job?.title || 'Senior React Architect';
  const companyName = selectedApp?.job?.company?.name || 'Stripe';
  const location = selectedApp?.job?.location
    ? selectedApp.job.location.city
      ? `${selectedApp.job.location.city}, ${selectedApp.job.location.country}`
      : selectedApp.job.location.country || 'Remote'
    : 'Bengaluru, India';
  const candidateStatus = selectedApp ? resolveCandidateStatus(selectedApp) : null;

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-left">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">
            Onboarding Workspace
          </span>
          <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {overallProgress}% Completed
          </span>
          {candidateStatus && (
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${candidateStatus.badgeClass}`}
            >
              {candidateStatus.label}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            {jobTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft font-medium mt-0.5">
            <span className="font-bold text-ink flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              {companyName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-ink-soft" />
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>Explore Opportunities</span>
        </Link>
        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>Resume Builder</span>
        </Link>
      </div>
    </div>
  );
};
