'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { StepId } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { personalInfoSchema, PersonalInfoFormData } from '../lib/validators';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface PersonalInfoViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const PersonalInfoView: React.FC<PersonalInfoViewProps> = ({ onSelectStep }) => {
  const candidate = useCandidateOnboardingStore((state) => state.candidate);
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const personalDraft = useCandidateOnboardingStore((state) => state.personalDraft);
  const savePersonalDraft = useCandidateOnboardingStore((state) => state.savePersonalDraft);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);
  const setCandidate = useCandidateOnboardingStore((state) => state.setCandidate);

  const defaultValues: PersonalInfoFormData = {
    fullName: personalDraft.fullName || candidate.name || 'Aarav Sharma',
    email: personalDraft.email || candidate.email || 'aarav.sharma@letgetin.io',
    phone: personalDraft.phone || '+91 9876543210',
    dob: personalDraft.dob || '1996-05-18',
    gender: (personalDraft.gender as any) || 'male',
    address: personalDraft.address || '402, Green Glen Layout, Bellandur Outer Ring Road',
    city: personalDraft.city || 'Bengaluru',
    state: personalDraft.state || 'Karnataka',
    pincode: personalDraft.pincode || '560103',
    country: personalDraft.country || 'India',
    emergencyName: personalDraft.emergencyName || 'Kavita Sharma',
    emergencyRelation: personalDraft.emergencyRelation || 'Mother',
    emergencyPhone: personalDraft.emergencyPhone || '+91 9845012345',
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const formValues = watch();
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Autosave
  useEffect(() => {
    if (isDirty) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        savePersonalDraft(formValues);
      }, 600);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [formValues, isDirty, savePersonalDraft]);

  const onSubmit = (data: PersonalInfoFormData) => {
    savePersonalDraft(data);
    setCandidate({
      name: data.fullName,
      email: data.email,
    });
    setStepStatus('personal', 'completed');
    onSelectStep('documents');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="personal"
        title="Personal Profile & Contacts"
        description="Submit your legal identity information, residential coordinates, and emergency contact for official company records."
        badge={
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Save className="w-3 h-3 animate-pulse" /> Autosaving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            <StatusBadge status={stepStatus.personal} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Identity */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Primary Candidate Information
              </h3>
              <p className="text-xs text-ink-soft">
                Your legal name must match your government photo identification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                {...register('fullName')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91 9876543210"
                {...register('phone')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('dob')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.dob && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.dob.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-ink">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('gender')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Residential Address */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Residential & Shipping Address
              </h3>
              <p className="text-xs text-ink-soft">
                Used for dispatching company welcome kit and official hardware equipment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="House/Apartment #, Street, Area"
                {...register('address')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
              {errors.address && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru"
                {...register('city')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.city && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                State / Province <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Karnataka"
                {...register('state')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.state && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Pincode / Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="6-digit pincode"
                {...register('pincode')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.pincode && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.pincode.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Country <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                {...register('country')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.country && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Emergency Contact Details
              </h3>
              <p className="text-xs text-ink-soft">
                Primary contact person in case of medical or urgent workplace necessity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Contact Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kavita Sharma"
                {...register('emergencyName')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.emergencyName && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.emergencyName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Relationship <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mother / Spouse"
                {...register('emergencyRelation')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.emergencyRelation && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.emergencyRelation.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Emergency Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91 9845012345"
                {...register('emergencyPhone')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.emergencyPhone && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.emergencyPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step Footer */}
        <StepFooter
          onBack={() => onSelectStep('welcome')}
          backText="Offer Letter"
          canContinue={true}
          isSubmitting={isSubmitting}
          onContinue={handleSubmit(onSubmit)}
          continueText="Save & Continue to Documents"
        />
      </form>
    </div>
  );
};
