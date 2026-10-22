'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ToastProvider, useToast } from './context/ToastContext'
import { ToastContainer } from './components/common/Toast'
import {
  HomeIcon,
  BriefcaseIcon,
  FunnelIcon,
  WrenchIcon,
  HistoryIcon,
  CreditCardIcon,
  GearIcon,
} from './components/common/Icons'
import { userService } from './services/userService'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { AccountType } from './types/user.types'

import Home from './pages/Home'
import PersonalInfo from './pages/PersonalInfo'
import DataPersonalization from './pages/DataPersonalization'
import Security from './pages/Security'
import PeopleSharing from './pages/PeopleSharing'
import PaymentsSubscription from './pages/PaymentsSubscription'
import Help from './pages/Help'

import './styles/taskmite-profile.css'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'info', label: 'Personal Info', icon: BriefcaseIcon },
  { id: 'data', label: 'Data & Personalization', icon: FunnelIcon },
  { id: 'security', label: 'Security', icon: WrenchIcon },
  { id: 'people', label: 'People & Sharing', icon: HistoryIcon },
  { id: 'payments', label: 'Payments & Subscription', icon: CreditCardIcon },
  { id: 'help', label: 'Help', icon: GearIcon },
]

function TaskmiteProfileInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const tabParam = searchParams.get('tab') || 'home'
  const accountTypeParam = searchParams.get('accountType')

  const [activeTab, setActiveTab] = useState<string>(tabParam)
  const [accountType, setAccountType] = useState<AccountType>(
    userService.getAccountType(accountTypeParam)
  )

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    setAccountType(userService.getAccountType(accountTypeParam))
  }, [accountTypeParam, user])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', tabId)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/profile/identity'
    router.replace(`${currentPath}?${params.toString()}`, { scroll: false })
  }

  const handleAccountTypeChange = (newType: AccountType) => {
    setAccountType(newType)
    const params = new URLSearchParams(window.location.search)
    params.set('accountType', newType)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/profile/identity'
    router.replace(`${currentPath}?${params.toString()}`, { scroll: false })
    showToast(`Viewing profile as ${newType} Account`, 'info')
  }

  return (
    <div className="taskmite-profile-wrapper">
      {/* Internal Navigation Subnav Bar */}
      <nav className="taskmite-subnav" aria-label="Profile navigation tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`taskmite-subnav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="taskmite-subnav-icon" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Subpage Content */}
      <main className="taskmite-page-container">
        {activeTab === 'home' && (
          <Home onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'info' && (
          <PersonalInfo onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'data' && (
          <DataPersonalization onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'security' && (
          <Security onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'people' && (
          <PeopleSharing onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'payments' && (
          <PaymentsSubscription onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
        {activeTab === 'help' && (
          <Help onNavigateTab={handleTabChange} explicitAccountType={accountType} />
        )}
      </main>

      <ToastContainer />
    </div>
  )
}

export function TaskmiteProfilePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="p-12 text-center text-sm font-medium text-slate-500">Loading profile workspace...</div>}>
        <TaskmiteProfileInner />
      </Suspense>
    </ToastProvider>
  )
}

export default TaskmiteProfilePage
