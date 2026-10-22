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
} from 'lucide-react'
import type { AccountType } from '../types/user.types'

interface PaymentsSubscriptionProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

type SubTab = 'overview' | 'plans' | 'topup' | 'history'

export default function PaymentsSubscription({ onNavigateTab, explicitAccountType }: PaymentsSubscriptionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const accountType = userService.getAccountType(explicitAccountType)

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

  const initialSubTab: SubTab =
    requiredParam || subtabParam === 'topup'
      ? 'topup'
      : subtabParam === 'plans'
      ? 'plans'
      : subtabParam === 'history'
      ? 'history'
      : 'overview'

  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab)

  useEffect(() => {
    if (requiredParam || subtabParam === 'topup') {
      setActiveSubTab('topup')
    } else if (subtabParam === 'plans') {
      setActiveSubTab('plans')
    } else if (subtabParam === 'history') {
      setActiveSubTab('history')
    }
  }, [requiredParam, subtabParam])

  // Subscriptions data
  const { data: subscriptions, isLoading: loadingSubscriptions } = useFetchData(() =>
    userService.getSubscriptions(accountType)
  )

  // Wallet data for live balance and transactions overview
  const { data: walletData, isLoading: loadingWallet } = useFetchData(async () => {
    try {
      return await creditService.getWallet()
    } catch {
      return null
    }
  })

  if (loadingSubscriptions && loadingWallet) {
    return <Loader text={`Loading ${accountType} subscriptions, wallet & billing...`} />
  }

  const balance = walletData?.balance ?? 20
  const balanceInr = balance * 10
  const recentTransactions = walletData?.transactions?.slice(0, 3) || []

  const handleSubTabChange = (tab: SubTab) => {
    setActiveSubTab(tab)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('subtab', tab)
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
    }
  }

  return (
    <>
      <PageHeader
        title="Payments & subscriptions"
        subtitle={`Your ${accountType} payment info, wallet credits, active subscription plans, and purchases`}
      />

      {/* Internal Navigation Subnav Pills */}
      <div className="taskmite-subnav justify-center my-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleSubTabChange('overview')}
          className={`taskmite-subnav-item ${activeSubTab === 'overview' ? 'active' : ''}`}
        >
          <CreditCard className="taskmite-subnav-icon" />
          <span>Overview & Payment Methods</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('plans')}
          className={`taskmite-subnav-item ${activeSubTab === 'plans' ? 'active' : ''}`}
        >
          <Sparkles className="taskmite-subnav-icon" />
          <span>
            {accountType === 'Candidate'
              ? 'Candidate Plans & Services'
              : accountType === 'Company'
              ? 'Company Subscriptions & Rates'
              : accountType === 'Startup'
              ? 'Startup Subscriptions & Services'
              : 'Institution Subscriptions & Charges'}
          </span>
        </button>

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

      {/* SUBTAB 1: OVERVIEW & PAYMENT METHODS */}
      {activeSubTab === 'overview' && (
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
  )
}
