'use client'

import React, { useState } from 'react'
import { PageHeader, Card, CardRow, PageGrid } from '../components/common/Card'
import { Loader } from '../components/common/Loader'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import {
  GlobeIcon,
  MapPinIcon,
  PlayVideoIcon,
  CloudDownloadIcon,
  PlanPlugIcon,
  TrashIcon,
} from '../components/common/Icons'

interface DataPersonalizationProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

export default function DataPersonalization({ onNavigateTab, explicitAccountType }: DataPersonalizationProps) {
  const { showToast } = useToast()
  const { data: storage } = useFetchData(() => userService.getStorageUsage())
  const {
    data: activityControls,
    isLoading,
    setData: setActivityData,
  } = useFetchData(() => userService.getActivityControls())

  const [businessPersonalization, setBusinessPersonalization] = useState(false)

  const handleToggleActivity = (id: string, currentStatus: 'On' | 'Off' | 'Paused') => {
    if (!activityControls) return
    const nextStatus = currentStatus === 'On' ? 'Off' : 'On'
    const updated = activityControls.map((item) =>
      item.id === id ? { ...item, status: nextStatus as 'On' | 'Off' } : item
    )
    setActivityData(updated)
    const item = activityControls.find((i) => i.id === id)
    showToast(`${item?.title} turned ${nextStatus}`, 'info')
  }

  const handleBusinessToggle = () => {
    setBusinessPersonalization((prev) => {
      const next = !prev
      showToast(`Business & Org personalization turned ${next ? 'On' : 'Off'}`, 'info')
      return next
    })
  }

  const getActivityIcon = (title: string) => {
    if (title.includes('Web')) return <GlobeIcon />
    if (title.includes('Location')) return <MapPinIcon />
    return <PlayVideoIcon />
  }

  if (isLoading) {
    return <Loader text="Loading data and personalization settings..." />
  }

  return (
    <>
      <PageHeader
        title="Data & personalization"
        subtitle="See the data in your LetGetIn account and choose what activity is saved to personalize your workspace"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card
          title="Activity controls"
          description="The activity saved in your LetGetIn account helps give you more personalized experiences across all LetGetIn features."
        >
          {activityControls?.map((control) => (
            <CardRow
              key={control.id}
              icon={getActivityIcon(control.title)}
              label={control.title}
              value={
                <span className="toggle-row">
                  <span
                    className={`status-dot ${control.status === 'On' ? 'status-on' : 'status-off'}`}
                  />
                  <span>{control.status}</span>
                </span> as unknown as string
              }
              onClick={() => handleToggleActivity(control.id, control.status)}
            />
          ))}
        </Card>

        <Card
          title="Account data & personalization"
          description="LetGetIn can personalize your job recommendations, hiring suggestions, and workflows based on your activity."
        >
          <CardRow
            icon={<PlanPlugIcon />}
            label="Personalized workflows and suggestions"
            value={
              <span className="toggle-row">
                <span
                  className={`status-dot ${businessPersonalization ? 'status-on' : 'status-off'}`}
                />
                <span>{businessPersonalization ? 'On' : 'Off'}</span>
              </span> as unknown as string
            }
            onClick={handleBusinessToggle}
          />
        </Card>

        <PageGrid>
          <Card
            title="Download your data"
            description="Make a copy of your LetGetIn account data, uploaded resumes, drive assets, and job records."
            graphic={<CloudDownloadIcon />}
            footer={
              <button
                type="button"
                className="link-btn"
                onClick={() => showToast('Data export package requested. Check your email shortly.', 'success')}
              >
                Download data archive
              </button>
            }
          />

          <Card
            title="Delete a service or your account"
            description="You can delete specific LetGetIn tools from your account or permanently close your account."
            graphic={<TrashIcon />}
            footer={
              <button
                type="button"
                className="link-btn"
                style={{ color: '#dc2626' }}
                onClick={() => showToast('Account deletion protection is active. Contact customer support to request closure.', 'warning')}
              >
                Delete a service or account
              </button>
            }
          />
        </PageGrid>
      </div>
    </>
  )
}
