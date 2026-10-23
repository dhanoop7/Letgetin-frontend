'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader, Card, CardRow } from '../components/common/Card'
import { Loader } from '../components/common/Loader'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import {
  CreditCardIcon,
  ShoppingBagIcon,
  FilmIcon,
} from '../components/common/Icons'
import { creditService, WalletData } from '@/features/credits/services/creditService'
import { CreditPurchaseView } from '@/features/credits/components/CreditPurchaseView'
import {
  Zap,
  Sparkles,
  History,
  CreditCard,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Crown,
  HardDrive,
  Check,
  ShieldAlert,
} from 'lucide-react'
import type { AccountType } from '../types/user.types'

interface PaymentsSubscriptionProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

type SubTab = 'overview' | 'plans' | 'subscriptions' | 'topup' | 'history'
type CandidateSubTab = 'storage' | 'career'

interface StoragePlan {
  id: string
  name: string
  storage: string
  priceInr: number
  description: string
  popular?: boolean
  features: string[]
}

const STORAGE_PLANS: StoragePlan[] = [
  {
    id: 'storage_plan_1',
    name: 'Storage Plan 1',
    storage: '10 GB',
    priceInr: 100,
    description: 'Essential cloud storage for candidate resumes, portfolios, and certificates.',
    features: [
      '10 GB Dedicated Cloud Storage',
      'Candidate files, resumes & documents',
      'High-fidelity preview & document retention',
      'Encrypted document security & zero file compression',
    ],
  },
  {
    id: 'storage_plan_2',
    name: 'Storage Plan 2',
    storage: '20 GB',
    priceInr: 200,
    popular: true,
    description: 'Expanded storage allocation for active candidates with multi-version media.',
    features: [
      '20 GB Dedicated Cloud Storage',
      'Candidate files, resumes & documents',
      'High-fidelity preview & document retention',
      'Encrypted document security & zero file compression',
    ],
  },
  {
    id: 'storage_plan_3',
    name: 'Storage Plan 3',
    storage: '30 GB',
    priceInr: 300,
    description: 'Generous capacity for extensive work samples, portfolios, and project archives.',
    features: [
      '30 GB Dedicated Cloud Storage',
      'Candidate files, resumes & documents',
      'High-fidelity preview & document retention',
      'Encrypted document security & zero file compression',
    ],
  },
  {
    id: 'storage_plan_4',
    name: 'Storage Plan 4',
    storage: '40 GB',
    priceInr: 400,
    description: 'Maximum dedicated cloud drive allocation for comprehensive career dossiers.',
    features: [
      '40 GB Dedicated Cloud Storage',
      'Candidate files, resumes & documents',
      'High-fidelity preview & document retention',
      'Encrypted document security & zero file compression',
    ],
  },
]

export default function PaymentsSubscription({ onNavigateTab, explicitAccountType }: PaymentsSubscriptionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const accountType = userService.getAccountType(explicitAccountType || searchParams.get('accountType'))

  const mappedRole: 'candidate' | 'recruiter' | 'startup' | 'institution' =
    accountType === 'Company'
      ? 'recruiter'
      : accountType === 'Startup'
      ? 'startup'
      : accountType === 'Institution'
      ? 'institution'
      : 'candidate'

  const requiredParam = searchParams.get('required')
  const subtabParam = searchParams.get('subtab')
  const planTypeParam = searchParams.get('planType')

  const initialSubTab: SubTab =
    requiredParam || subtabParam === 'topup'
      ? 'topup'
      : subtabParam === 'subscriptions' && accountType === 'Candidate'
      ? 'subscriptions'
      : subtabParam === 'plans'
      ? 'plans'
      : subtabParam === 'history'
      ? 'history'
      : accountType === 'Candidate' || accountType === 'Company'
      ? 'plans'
      : 'overview'

  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab)
  const [candidateSubTab, setCandidateSubTab] = useState<CandidateSubTab>(
    planTypeParam === 'career' ? 'career' : 'storage'
  )

  useEffect(() => {
    if (requiredParam || subtabParam === 'topup') {
      setActiveSubTab('topup')
    } else if (subtabParam === 'subscriptions' && accountType === 'Candidate') {
      setActiveSubTab('subscriptions')
    } else if (subtabParam === 'plans') {
      setActiveSubTab('plans')
    } else if (subtabParam === 'history') {
      setActiveSubTab('history')
    } else if ((accountType === 'Candidate' || accountType === 'Company') && (!subtabParam || subtabParam === 'overview')) {
      setActiveSubTab('plans')
    } else if (accountType !== 'Candidate' && accountType !== 'Company' && (!subtabParam || subtabParam === 'overview')) {
      setActiveSubTab('overview')
    }
  }, [requiredParam, subtabParam, accountType])

  useEffect(() => {
    if (planTypeParam === 'career') {
      setCandidateSubTab('career')
    } else if (planTypeParam === 'storage') {
      setCandidateSubTab('storage')
    }
  }, [planTypeParam])

  // Subscriptions data
  const { data: subscriptions, isLoading: loadingSubscriptions } = useFetchData(() =>
    userService.getSubscriptions(accountType)
  )

  // Wallet data for live balance and transactions overview
  const { data: walletData, isLoading: loadingWallet, refetch: refetchWallet } = useFetchData(async () => {
    try {
      return await creditService.getWallet()
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleWalletUpdated = () => {
      refetchWallet()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('letgetin:wallet_updated', handleWalletUpdated)
      return () => {
        window.removeEventListener('letgetin:wallet_updated', handleWalletUpdated)
      }
    }
  }, [refetchWallet])

  if (loadingSubscriptions && loadingWallet) {
    return <Loader text={`Loading ${accountType} subscriptions, wallet & billing...`} />
  }

  const balance = walletData?.balance ?? 20
  const balanceInr = balance * 10
  const recentTransactions = walletData?.transactions?.slice(0, 3) || []

  const isStorageSubscribed = Boolean(
    walletData?.subscriptions?.some(
      (s) =>
        (s.planId === 'sub_cand_1' || s.planName?.toLowerCase().includes('storage')) &&
        s.status === 'active'
    )
  )

  const isCareerSubscribed = Boolean(
    walletData?.subscriptions?.some(
      (s) =>
        (s.planId === 'sub_cand_2' || s.planName?.toLowerCase().includes('career')) &&
        s.status === 'active'
    )
  )

  const isPlanSubscribed = (planId: string, planName: string) =>
    Boolean(
      walletData?.subscriptions?.some(
        (s) =>
          (s.planId === planId ||
            s.planName?.toLowerCase().includes(planName.toLowerCase()) ||
            (planId === 'storage_plan_1' && s.planId === 'sub_cand_1')) &&
          s.status === 'active'
      )
    )

  const handleSubTabChange = (tab: SubTab) => {
    setActiveSubTab(tab)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('subtab', tab)
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
    }
  }

  const handleCandidateSubTabChange = (tab: CandidateSubTab) => {
    setCandidateSubTab(tab)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('subtab', 'subscriptions')
      params.set('planType', tab)
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
    }
  }

  const handleSubscribe = (itemName: string, amountInr: number) => {
    const returnUrl = encodeURIComponent(
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : `/profile/identity?tab=payments&subtab=subscriptions&planType=${candidateSubTab}`
    )
    router.push(
      `/payment?item=${encodeURIComponent(itemName)}&amount=${amountInr}&billingCycle=monthly&returnUrl=${returnUrl}`
    )
  }

  const renderStoragePlansGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {STORAGE_PLANS.map((plan) => {
        const isSubscribed = isPlanSubscribed(plan.id, plan.name)
        return (
          <div
            key={plan.id}
            className={`flex flex-col justify-between p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
              isSubscribed
                ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                : plan.popular
                ? 'border-primary/50 bg-surface shadow-xs hover:border-primary hover:shadow-md'
                : 'border-border bg-surface hover:border-primary/40 hover:shadow-xs'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{plan.name}</h4>
                    <p className="text-[11px] font-semibold text-primary-glow">{plan.storage}</p>
                  </div>
                </div>
                {isSubscribed ? (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                ) : plan.popular ? (
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-ink-soft bg-surface-alt border border-border px-2 py-0.5 rounded-full">
                    Available
                  </span>
                )}
              </div>

              <div className="pb-3 border-b border-border/80">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-ink">₹{plan.priceInr}</span>
                  <span className="text-xs font-semibold text-ink-soft">/ mo</span>
                </div>
                <div className="text-xs font-bold text-primary-glow mt-1">
                  {plan.storage} Storage Allocation
                </div>
                <p className="text-[11px] text-ink-soft mt-1 leading-snug">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Plan Entitlements
                </span>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-ink-soft">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5">
              {isSubscribed ? (
                <div className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-surface-alt text-ink-soft border border-border flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Active Plan</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleSubscribe(`${plan.name} (${plan.storage})`, plan.priceInr)
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Subscribe for ₹{plan.priceInr}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Page header — inline to place the credit-balance pill in the same row as the title */}
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
            Payments &amp; subscriptions
          </h1>

          {/* Credit balance pill */}
          <button
            type="button"
            id="credit-balance-pill"
            onClick={() => handleSubTabChange('topup')}
            title="View Credit Top-Ups"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 13px',
              borderRadius: 9999,
              border: 'none',
              background: 'linear-gradient(135deg, #1a73e8 0%, #0b57d0 100%)',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(26,115,232,0.35)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            <Coins style={{ width: 15, height: 15, flexShrink: 0 }} />
            {loadingWallet ? (
              <span style={{ opacity: 0.6 }}>···</span>
            ) : (
              <span>{balance} Credits</span>
            )}
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '6px auto 0', maxWidth: 600, lineHeight: 1.5 }}>
          {`Your ${accountType} payment info, wallet credits, active subscription plans, and purchases`}
        </p>
      </div>

      {/* Platform-Wide Payments & Credits Disabled Notice */}
      {walletData && walletData.paymentsCreditsEnabled === false && (
        <div className="max-w-3xl mx-auto my-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
              Payments & Credits Temporarily Paused
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {walletData.paymentsCreditsDisabledReason || 'New credit purchases, top-ups, paid subscriptions, and billable operations are temporarily paused platform-wide for scheduled administration.'} Your current wallet balance ({balance} Credits) and transaction records remain completely safe and intact.
            </p>
          </div>
        </div>
      )}

      {/* Internal Navigation Subnav Pills (Hidden for Company account as second-level tabs serve as the primary navigation) */}
      {accountType !== 'Company' && (
        <div className="taskmite-subnav justify-center my-4 overflow-x-auto">
          {accountType !== 'Candidate' && (
            <button
              type="button"
              onClick={() => handleSubTabChange('overview')}
              className={`taskmite-subnav-item ${activeSubTab === 'overview' ? 'active' : ''}`}
            >
              <CreditCard className="taskmite-subnav-icon" />
              <span>Overview & Payment Methods</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubTabChange('plans')}
            className={`taskmite-subnav-item ${activeSubTab === 'plans' ? 'active' : ''}`}
          >
            <Sparkles className="taskmite-subnav-icon" />
            <span>
              {accountType === 'Candidate'
                ? 'Candidate Plans & Services'
                : accountType === 'Startup'
                ? 'Startup Subscriptions & Services'
                : 'Institution Subscriptions & Charges'}
            </span>
          </button>

          {accountType === 'Candidate' && (
            <button
              type="button"
              onClick={() => handleSubTabChange('subscriptions')}
              className={`taskmite-subnav-item ${activeSubTab === 'subscriptions' ? 'active' : ''}`}
            >
              <Crown className="taskmite-subnav-icon" />
              <span>Candidate Subscription</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubTabChange('topup')}
            className={`taskmite-subnav-item ${activeSubTab === 'topup' ? 'active' : ''}`}
          >
            <Zap className="taskmite-subnav-icon" />
            <span>Credit Top-Ups</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabChange('history')}
            className={`taskmite-subnav-item ${activeSubTab === 'history' ? 'active' : ''}`}
          >
            <History className="taskmite-subnav-icon" />
            <span>Transaction Ledger</span>
          </button>
        </div>
      )}

      {/* COMPANY ACCOUNT: Single authoritative navigation using the 4 second-level tabs */}
      {accountType === 'Company' ? (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <CreditPurchaseView
            role="recruiter"
            initialTab={
              subtabParam === 'company_plans' || subtabParam === 'features'
                ? 'company_plans'
                : subtabParam === 'topup'
                ? 'topup'
                : subtabParam === 'history'
                ? 'history'
                : 'subscriptions'
            }
            embedded={true}
            hideHeaderBanner={true}
          />
        </div>
      ) : (
        <>
          {/* SUBTAB 1: OVERVIEW & PAYMENT METHODS (Non-Candidate roles only) */}
          {activeSubTab === 'overview' && accountType !== 'Candidate' && (
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
              {/* Integrated Wallet Balance & Credits Card */}
              <div className="bg-gradient-to-br from-primary/10 via-surface to-surface-alt border border-primary/25 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-glow shrink-0">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                          {accountType} Wallet
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> 1 Credit = ₹10
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-ink tracking-tight">{balance}</span>
                        <span className="text-sm font-bold text-primary-glow">Available Credits</span>
                        <span className="text-sm font-semibold text-ink-soft">
                          (≈ ₹{balanceInr.toLocaleString()} INR)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSubTabChange('topup')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Top up Credits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubTabChange('history')}
                      className="px-3.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-ink hover:bg-surface-alt transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-ink-soft" />
                      <span>View Ledger</span>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-primary/15 text-xs text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary-glow shrink-0" />
                    <span>Complimentary Welcome Bonus: <strong>20 Credits (₹200)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Referral Reward: <strong>Earn 10 Credits (₹100)</strong> per user</span>
                  </div>
                </div>
              </div>

              {/* Existing Card 1: Payment methods */}
              <Card
                title="Payment methods"
                description="Save payment methods for secure checkout across LetGetIn subscriptions, credits, and services"
                graphic={<CreditCardIcon />}
                footer={
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleSubTabChange('topup')}
                  >
                    Manage payment methods & Top up
                  </button>
                }
              >
                <CardRow
                  icon={<CreditCardIcon />}
                  label="Corporate / Personal Card"
                  value="Default payment gateway active"
                  chevron={false}
                />
              </Card>

              {/* Existing Card 2: Subscriptions */}
              <Card
                title={`${accountType} Subscriptions`}
                description={`Authoritative subscription packages and plans for ${accountType} accounts`}
                graphic={<FilmIcon />}
                footer={
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleSubTabChange('plans')}
                  >
                    Explore plans & upgrades
                  </button>
                }
              >
                {subscriptions?.map((sub) => (
                  <CardRow
                    key={sub.id}
                    icon={<FilmIcon />}
                    label={sub.title}
                    value={`${sub.cost} (${sub.status})`}
                    onClick={() => handleSubTabChange('plans')}
                  />
                ))}
              </Card>

              {/* Existing Card 3: Recent Purchases & Invoices */}
              <Card
                title="Recent Purchases & Billing Invoices"
                description="Your orders, invoices, credit top-ups, and transaction statements"
                graphic={<ShoppingBagIcon />}
                footer={
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleSubTabChange('history')}
                  >
                    View all transaction statements & invoices
                  </button>
                }
              >
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <CardRow
                      key={tx._id}
                      icon={<ShoppingBagIcon />}
                      label={tx.reason || `${tx.type.toUpperCase()} - ${tx.amount} Credits`}
                      value={`${tx.amount > 0 ? '+' : ''}${tx.amount} Credits (${tx.status})`}
                      onClick={() => handleSubTabChange('history')}
                    />
                  ))
                ) : (
                  <CardRow
                    icon={<ShoppingBagIcon />}
                    label="Initial Promotional Credits Package"
                    value="Complimentary Welcome Grant (+20 Credits)"
                    chevron={false}
                  />
                )}
              </Card>
            </div>
          )}

          {/* SUBTAB 2: PLANS & SERVICES */}
          {activeSubTab === 'plans' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <CreditPurchaseView
                role={mappedRole}
                initialTab={accountType === 'Candidate' ? 'plans' : 'subscriptions'}
                embedded={true}
                hideHeaderBanner={true}
              />
            </div>
          )}

          {/* SUBTAB: CANDIDATE SUBSCRIPTION (Candidate-only) */}
          {activeSubTab === 'subscriptions' && accountType === 'Candidate' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }} className="space-y-6 animate-fade-in">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">Candidate Subscription</h2>
                  <p className="text-xs text-ink-soft">
                    Dedicated subscription options for candidate cloud document storage and premium career capabilities.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1 rounded-full self-start sm:self-auto">
                  Candidate Account Exclusive
                </span>
              </div>

              {/* Nested Sub-Navigation Tabs */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="inline-flex items-center p-1.5 bg-surface-alt border border-border rounded-2xl gap-1.5">
                  <button
                    type="button"
                    id="nested-tab-storage-plus"
                    onClick={() => handleCandidateSubTabChange('storage')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                      candidateSubTab === 'storage'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-ink-soft hover:text-ink hover:bg-surface'
                    }`}
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>LetGetIn Storage Plus</span>
                  </button>

                  <button
                    type="button"
                    id="nested-tab-pro-career-plus"
                    onClick={() => handleCandidateSubTabChange('career')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                      candidateSubTab === 'career'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-ink-soft hover:text-ink hover:bg-surface'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    <span>LetGetIn Pro Career Plus</span>
                  </button>
                </div>
              </div>

              {/* NESTED TAB 1: LETGETIN STORAGE PLUS (4 Storage Plans) */}
              {candidateSubTab === 'storage' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-ink">LetGetIn Storage Plus Plans</h3>
                      <p className="text-xs text-ink-soft">
                        Select a dedicated cloud storage tier to back up and manage candidate resumes, portfolios, and certifications.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Retention
                    </span>
                  </div>

                  {renderStoragePlansGrid()}
                </div>
              )}

              {/* NESTED TAB 2: LETGETIN PRO CAREER PLUS */}
              {candidateSubTab === 'career' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-ink">LetGetIn Storage Plus Plans</h3>
                      <p className="text-xs text-ink-soft">
                        Select a dedicated cloud storage tier to back up and manage candidate resumes, portfolios, and certifications.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Retention
                    </span>
                  </div>

                  {renderStoragePlansGrid()}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: CREDIT TOP-UPS */}
          {activeSubTab === 'topup' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <CreditPurchaseView
                role={mappedRole}
                initialTab="topup"
                embedded={true}
                hideHeaderBanner={true}
              />
            </div>
          )}

          {/* SUBTAB 4: TRANSACTION LEDGER */}
          {activeSubTab === 'history' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <CreditPurchaseView
                role={mappedRole}
                initialTab="history"
                embedded={true}
                hideHeaderBanner={true}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
