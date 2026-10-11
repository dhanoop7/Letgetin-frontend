'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileSignature,
  FileText,
  Bell,
} from 'lucide-react';

export type ESignTabId = 'overview' | 'my-esign' | 'documents' | 'notifications';

export interface ESignTabItem {
  id: ESignTabId;
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

interface ESignTabNavProps {
  activeTab: ESignTabId;
  onSelectTab: (tabId: ESignTabId) => void;
  unreadNotificationsCount?: number;
  pendingDocumentsCount?: number;
}

export const ESignTabNav: React.FC<ESignTabNavProps> = ({
  activeTab,
  onSelectTab,
  unreadNotificationsCount = 0,
  pendingDocumentsCount = 0,
}) => {
  const tabs: ESignTabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'my-esign',
      label: 'My E-Sign',
      icon: FileSignature,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      badgeCount: pendingDocumentsCount,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badgeCount: unreadNotificationsCount,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-brand text-white shadow-elegant'
                : 'text-ink-soft hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? 'text-white' : 'text-primary-glow'
              }`}
            />
            <span>{tab.label}</span>

            {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white text-primary'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
