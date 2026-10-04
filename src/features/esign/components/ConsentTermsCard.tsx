'use client';

import React from 'react';
import {
  ShieldCheck,
  FileCheck,
  Building2,
  Cpu,
  UserCheck,
  Info,
} from 'lucide-react';

export const ConsentTermsCard: React.FC = () => {
  const terms = [
    {
      id: 'cert-verification',
      icon: ShieldCheck,
      title: 'Certificate Verification',
      description:
        'I authorize the company and its authorized verification partners to verify certificates, qualifications, and other documents submitted by me during the recruitment/onboarding process.',
    },
    {
      id: 'doc-verification',
      icon: FileCheck,
      title: 'Document Verification',
      description:
        'I understand that the company may review documents submitted by me to verify their authenticity and consistency with the information provided during the recruitment process.',
    },
    {
      id: 'company-policies',
      icon: Building2,
      title: 'Company Policies',
      description:
        'I acknowledge that I have read and agree to comply with the applicable company policies and procedures communicated to me.',
    },
    {
      id: 'info-processing',
      icon: Cpu,
      title: 'Information Processing',
      description:
        'I understand that my submitted information and documents may be processed by authorized personnel for recruitment, verification, and onboarding purposes.',
    },
    {
      id: 'candidate-ack',
      icon: UserCheck,
      title: 'Candidate Acknowledgement',
      description:
        'I confirm that the information and documents submitted by me are accurate to the best of my knowledge.',
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Consent & Authorization Terms
            </h3>
            <p className="text-xs text-ink-soft">
              Please carefully review the verification guidelines and authorizations below.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full hidden sm:inline-flex">
          5 Clauses
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {terms.map((term, index) => {
          const Icon = term.icon;
          const isFullWidth = index === terms.length - 1;

          return (
            <div
              key={term.id}
              className={`p-4 rounded-2xl bg-surface-alt/70 border border-border/70 hover:border-primary/30 transition-all space-y-2 flex flex-col justify-between ${
                isFullWidth ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface border border-border text-primary-glow flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-ink">
                      {term.title}
                    </h4>
                    <span className="text-[10px] text-ink-soft/70 font-mono">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    &ldquo;{term.description}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
