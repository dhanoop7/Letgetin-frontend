'use client'

import React, { useState } from 'react'
import { PageHeader, Card, CardRow } from '../components/common/Card'
import { Loader } from '../components/common/Loader'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import {
  KeyIcon,
  PhoneIcon,
  ShieldCheckIcon,
  MonitorIcon,
  LockIcon,
} from '../components/common/Icons'

interface SecurityProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

export default function Security({ onNavigateTab, explicitAccountType }: SecurityProps) {
  const { showToast } = useToast()
  const { data: issues, isLoading } = useFetchData(() => userService.getSecurityIssues())
  const { data: profile } = useFetchData(() => userService.getUserProfile(explicitAccountType))

  const [twoStepStatus, setTwoStepStatus] = useState(false)
  const [lessSecureApps, setLessSecureApps] = useState(false)

  const handleToggleTwoStep = () => {
    setTwoStepStatus((prev) => {
      const next = !prev
      showToast(
        `2-Step Verification turned ${next ? 'On' : 'Off'} for your account`,
        next ? 'success' : 'warning'
      )
      return next
    })
  }

  const handleToggleLessSecure = () => {
    setLessSecureApps((prev) => {
      const next = !prev
      showToast(
        `Less secure app access turned ${next ? 'On' : 'Off'}`,
        next ? 'warning' : 'info'
      )
      return next
    })
  }

  if (isLoading) {
    return <Loader text="Loading security settings..." />
  }

  return (
    <>
      <PageHeader
        title="Security"
        subtitle="Settings and authoritative recommendations to help you keep your LetGetIn account secure"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card
          title="Security recommendations found"
          description="Protect your account now by keeping these security protections verified"
          graphic={<ShieldCheckIcon />}
          footer={
            <button
              type="button"
              className="link-btn"
              onClick={() => showToast('Security checkup passed. All recent logins verified.', 'success')}
            >
              Run Security Checkup
            </button>
          }
        >
          {issues?.map((issue) => (
            <CardRow
              key={issue.id}
              icon={<ShieldCheckIcon />}
              label={issue.title}
              value={issue.severity.toUpperCase()}
              onClick={() => handleToggleTwoStep()}
            />
          ))}
        </Card>

        <Card title="How you sign in to LetGetIn">
          <CardRow
            icon={<KeyIcon />}
            label="Password"
            value={`Last changed ${profile?.passwordLastChanged || 'recently'}`}
            onClick={() => showToast('Password change verification code sent to your registered email.', 'info')}
          />
          <CardRow
            icon={<PhoneIcon />}
            label="2-Step Verification"
            value={
              <span className="toggle-row">
                <span
                  className={`status-dot ${twoStepStatus ? 'status-on' : 'status-off'}`}
                />
                <span>{twoStepStatus ? 'On' : 'Off'}</span>
              </span> as unknown as string
            }
            onClick={handleToggleTwoStep}
          />
          <CardRow
            icon={<LockIcon />}
            label="Third-party app API access"
            value={
              <span className="toggle-row">
                <span
                  className={`status-dot ${lessSecureApps ? 'status-on' : 'status-off'}`}
                />
                <span>{lessSecureApps ? 'Allowed' : 'Blocked'}</span>
              </span> as unknown as string
            }
            onClick={handleToggleLessSecure}
          />
        </Card>

        <Card
          title="Your active devices"
          description="Where you're currently signed in to your LetGetIn account"
          graphic={<MonitorIcon />}
        >
          <CardRow
            icon={<MonitorIcon />}
            label="Current Active Device"
            value="Windows (Browser Session) — This device"
            chevron={false}
          />
        </Card>
      </div>
    </>
  )
}
