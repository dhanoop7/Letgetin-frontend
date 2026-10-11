'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ESignTabNav, ESignTabId } from './ESignTabNav';
import { ESignWorkspace } from './ESignWorkspace';
import { MyESignView } from './MyESignView';
import { ESignDocumentsView } from './ESignDocumentsView';
import { ESignNotificationsView } from './ESignNotificationsView';
import { DEMO_ESIGN_DOCUMENTS, DEMO_ESIGN_NOTIFICATIONS } from '../data/mockESignData';

const VALID_TABS: ESignTabId[] = ['overview', 'my-esign', 'documents', 'notifications'];

export const ESignPageContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<ESignTabId>(() => {
    if (rawTab === 'consent') return 'my-esign';
    if (rawTab && VALID_TABS.includes(rawTab as ESignTabId)) {
      return rawTab as ESignTabId;
    }
    return 'overview';
  });

  useEffect(() => {
    if (rawTab === 'consent') {
      setActiveTab('my-esign');
    } else if (rawTab && VALID_TABS.includes(rawTab as ESignTabId)) {
      setActiveTab(rawTab as ESignTabId);
    }
  }, [rawTab]);

  const pendingDocumentsCount = DEMO_ESIGN_DOCUMENTS.filter(
    (d) => d.status === 'PENDING_SIGNATURE'
  ).length;

  const unreadNotificationsCount = DEMO_ESIGN_NOTIFICATIONS.filter(
    (n) => !n.isRead
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Horizontal E-Sign Tab Navigation */}
      <ESignTabNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingDocumentsCount={pendingDocumentsCount}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* 2. Active Tab Content Area */}
      <div className="w-full transition-all duration-200">
        {/* Tab 1: Overview (Consent & Authorization Workspace with Blue Header) */}
        {activeTab === 'overview' && <ESignWorkspace headerVariant="blue" />}

        {/* Tab 2: My E-Sign (Electronic Signature Functionality Only) */}
        {activeTab === 'my-esign' && <MyESignView />}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <ESignDocumentsView
            onNavigateToConsent={() => setActiveTab('overview')}
            onNavigateToMyESign={() => setActiveTab('my-esign')}
          />
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <ESignNotificationsView
            onNavigateTab={(tab) => {
              if (VALID_TABS.includes(tab)) {
                setActiveTab(tab);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
