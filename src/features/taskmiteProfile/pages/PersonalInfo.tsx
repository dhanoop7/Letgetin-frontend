'use client'

import React, { useState } from 'react'
import { PageHeader, Card, CardRow } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Loader } from '../components/common/Loader'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import { GlobeIcon } from '../components/common/Icons'

interface PersonalInfoProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

export default function PersonalInfo({ onNavigateTab, explicitAccountType }: PersonalInfoProps) {
  const { showToast } = useToast()
  const { data: profile, isLoading, setData } = useFetchData(() =>
    userService.getUserProfile(explicitAccountType)
  )

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [fieldToEdit, setFieldToEdit] = useState<string>('')
  const [fieldValue, setFieldValue] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenEdit = (fieldName: string, currentVal: string) => {
    setFieldToEdit(fieldName)
    setFieldValue(currentVal)
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      const fieldKeyMap: Record<string, string> = {
        Name: 'name',
        Nickname: 'nickname',
        Birthday: 'birthday',
        Gender: 'gender',
        Email: 'email',
        Phone: 'phone',
      }

      const key = fieldKeyMap[fieldToEdit]
      if (key) {
        const updated = await userService.updateUserProfile({ [key]: fieldValue })
        setData(updated)
        showToast(`${fieldToEdit} updated successfully in LetGetIn!`, 'success')
      }
      setEditModalOpen(false)
    } catch {
      showToast(`Failed to update ${fieldToEdit}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loader text="Loading personal and account info..." />
  }

  const accountType = profile?.accountType || 'Candidate'
  const isOrg = accountType !== 'Candidate'

  return (
    <>
      <PageHeader
        title={isOrg ? `${accountType} Organization & Account Info` : 'Personal info'}
        subtitle={`Basic identity info, like your name and contact details, that you use on LetGetIn as a ${accountType}`}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card
          title={isOrg ? 'Organization & Profile Identity' : 'Profile'}
          description="Some info may be visible to other members across LetGetIn networks and services."
        >
          <div className="profile-photo-row">
            <div>
              <p className="field-label">Avatar</p>
              <p className="field-value">Profile icon representing your account</p>
            </div>
            <div className="avatar-sm">{profile?.avatarText || 'U'}</div>
          </div>
          <CardRow
            label={isOrg ? 'Organization Name' : 'Full Name'}
            value={profile?.name || ''}
            onClick={() => handleOpenEdit('Name', profile?.name || '')}
          />
          <CardRow
            label="Display Nickname"
            value={profile?.nickname || ''}
            onClick={() => handleOpenEdit('Nickname', profile?.nickname || '')}
          />
          <CardRow
            label={isOrg ? 'Founding / Incorporated Date' : 'Birthday'}
            value={profile?.birthday || ''}
            onClick={() => handleOpenEdit('Birthday', profile?.birthday || '')}
          />
          <CardRow
            label={isOrg ? 'Account Classification' : 'Gender'}
            value={profile?.gender || ''}
            onClick={() => handleOpenEdit('Gender', profile?.gender || '')}
          />
          <CardRow
            label={`Password — Last changed ${profile?.passwordLastChanged}`}
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('security')
              } else {
                showToast('Password management is in Security section', 'info')
              }
            }}
          />
        </Card>

        <Card title="Contact info">
          <CardRow
            label={isOrg ? 'Primary Work Email' : 'Email Address'}
            value={profile?.email}
            onClick={() => handleOpenEdit('Email', profile?.email || '')}
          />
          <CardRow
            label="Phone Number"
            value={profile?.phone}
            onClick={() => handleOpenEdit('Phone', profile?.phone || '')}
          />
        </Card>

        <Card
          title="Choose what others see"
          description="You decide what personal and organization info you make visible to others across LetGetIn"
          graphic={<GlobeIcon />}
          footer={
            <button
              type="button"
              className="link-btn"
              onClick={() => showToast('Visibility settings saved for your account', 'info')}
            >
              Configure Public Visibility
            </button>
          }
        />
      </div>

      <Modal
        isOpen={editModalOpen}
        title={`Edit ${fieldToEdit}`}
        onClose={() => setEditModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <Input
          label={fieldToEdit}
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          placeholder={`Enter new ${fieldToEdit}`}
        />
      </Modal>
    </>
  )
}
