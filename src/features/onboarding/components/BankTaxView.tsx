'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  Building2,
  FileCheck2,
  HelpCircle,
  Save,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { StepId } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { bankTaxSchema, BankTaxFormData } from '../lib/validators';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface BankTaxViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const BankTaxView: React.FC<BankTaxViewProps> = ({ onSelectStep }) => {
  const candidate = useCandidateOnboardingStore((state) => state.candidate);
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const bankDraft = useCandidateOnboardingStore((state) => state.bankDraft);
  const saveBankDraft = useCandidateOnboardingStore((state) => state.saveBankDraft);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);

  const defaultValues: BankTaxFormData = {
    accountHolder: bankDraft.accountHolder || candidate.name || 'Aarav Sharma',
    accountNumber: bankDraft.accountNumber || '50100412398412',
    confirmAccountNumber: bankDraft.confirmAccountNumber || '50100412398412',
    ifscCode: bankDraft.ifscCode || 'HDFC0001234',
    bankName: bankDraft.bankName || 'HDFC Bank Ltd',
    branchName: bankDraft.branchName || 'Koramangala 4th Block, Bengaluru',
    accountType: (bankDraft.accountType as any) || 'Savings',
    panNumber: bankDraft.panNumber || 'ABCDE1234F',
    uanNumber: bankDraft.uanNumber || '101234567890',
    taxRegime: (bankDraft.taxRegime as any) || 'New Regime',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BankTaxFormData>({
    resolver: zodResolver(bankTaxSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const formValues = watch();
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IFSC Auto-Lookup Simulation
  const ifscValue = watch('ifscCode');
  useEffect(() => {
    if (ifscValue && ifscValue.length === 11) {
      if (ifscValue.startsWith('HDFC')) {
        setValue('bankName', 'HDFC Bank Ltd');
        setValue('branchName', 'Koramangala 4th Block, Bengaluru');
      } else if (ifscValue.startsWith('ICIC')) {
        setValue('bankName', 'ICICI Bank Ltd');
        setValue('branchName', 'Indiranagar 100ft Road, Bengaluru');
      } else if (ifscValue.startsWith('SBIN')) {
        setValue('bankName', 'State Bank of India');
        setValue('branchName', 'MG Road Main Branch, Bengaluru');
      }
    }
  }, [ifscValue, setValue]);

  // Debounced Autosave
  useEffect(() => {
    if (isDirty) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        saveBankDraft(formValues);
      }, 600);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [formValues, isDirty, saveBankDraft]);

  const onSubmit = (data: BankTaxFormData) => {
    saveBankDraft(data);
    setStepStatus('bank', 'completed');
    onSelectStep('policies');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        stepId="bank"
        title="Bank & Tax Information"
        description="Provide your salary disbursement account details, permanent account number (PAN), and select your income tax regime."
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
            <StatusBadge status={stepStatus.bank} size="md" />
          </div>
        }
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Salary Bank Account */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Salary Disbursement Account
              </h3>
              <p className="text-xs text-ink-soft">
                Must be an active Indian domestic bank account in your legal name.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-ink">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Name as per bank passbook / statement"
                {...register('accountHolder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.accountHolder && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.accountHolder.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter 9-18 digit account number"
                {...register('accountNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.accountNumber && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.accountNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Confirm Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Re-enter account number"
                {...register('confirmAccountNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.confirmAccountNumber && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.confirmAccountNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                {...register('ifscCode')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.ifscCode && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.ifscCode.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Account Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('accountType')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">Bank Name</label>
              <input
                type="text"
                placeholder="Bank Name"
                {...register('bankName')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/30 border border-border text-xs text-ink focus:outline-none"
              />
              {errors.bankName && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">Branch Name</label>
              <input
                type="text"
                placeholder="Branch Location"
                {...register('branchName')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/30 border border-border text-xs text-ink focus:outline-none"
              />
              {errors.branchName && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.branchName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Tax Identifiers & Regime */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-ink">
                Tax Identifiers & Regime Selection
              </h3>
              <p className="text-xs text-ink-soft">
                Required for statutory TDS calculation and monthly Provident Fund (PF) deposits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                PAN Card Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="10-digit PAN (e.g. ABCDE1234F)"
                {...register('panNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.panNumber && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.panNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                Universal Account Number (UAN / PF) <span className="text-ink-soft font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="12-digit existing UAN number"
                {...register('uanNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt/50 border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {errors.uanNumber && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.uanNumber.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2 pt-2">
              <label className="text-xs font-bold text-ink">
                Income Tax Regime for FY 2026-27 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-alt/50 border border-border cursor-pointer hover:border-primary/40 transition">
                  <input
                    type="radio"
                    value="New Regime"
                    {...register('taxRegime')}
                    className="mt-0.5 text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-ink">New Tax Regime (Default)</span>
                    <p className="text-[11px] text-ink-soft">
                      Lower tax slabs with standard ₹75,000 deduction, no exemption documentation needed.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-alt/50 border border-border cursor-pointer hover:border-primary/40 transition">
                  <input
                    type="radio"
                    value="Old Regime"
                    {...register('taxRegime')}
                    className="mt-0.5 text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-ink">Old Tax Regime</span>
                    <p className="text-[11px] text-ink-soft">
                      Allows deductions under 80C, 80D, HRA, and Home Loan interest exemptions.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Step Footer */}
        <StepFooter
          onBack={() => onSelectStep('documents')}
          backText="Documents"
          canContinue={true}
          isSubmitting={isSubmitting}
          onContinue={handleSubmit(onSubmit)}
          continueText="Save & Continue to Policies"
        />
      </form>
    </div>
  );
};
