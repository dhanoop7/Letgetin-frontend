'use client'

import React, { useState } from 'react'
import { PageHeader, Card, CardRow } from '../components/common/Card'
import { Loader } from '../components/common/Loader'
import { EmptyState } from '../components/common/EmptyState'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import {
  UserCircleIcon,
  SavedInteractionsIcon,
  PhoneIcon,
  BlockIcon,
} from '../components/common/Icons'
import type { ContactItem } from '../types/user.types'

interface PeopleSharingProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

export default function PeopleSharing({ onNavigateTab, explicitAccountType }: PeopleSharingProps) {
  const { showToast } = useToast()
  const { data: contacts, isLoading, setData: setContactsData } = useFetchData(() =>
    userService.getContacts()
  )

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactEmail.trim()) {
      showToast('Name and email are required', 'error')
      return
    }
    const newContact: ContactItem = {
      id: `c_${Date.now()}`,
      name: newContactName.trim(),
      email: newContactEmail.trim(),
      avatarText: newContactName.trim().charAt(0).toUpperCase(),
    }
    const updated = contacts ? [...contacts, newContact] : [newContact]
    setContactsData(updated)
    showToast(`Added ${newContact.name} to contacts!`, 'success')
    setNewContactName('')
    setNewContactEmail('')
    setAddModalOpen(false)
  }

  if (isLoading) {
    return <Loader text="Loading contacts & sharing info..." />
  }

  return (
    <>
      <PageHeader
        title="People & Sharing"
        subtitle="People you collaborate with and the info you make visible on LetGetIn services"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card
          title="Contacts"
          description="Organize your LetGetIn contacts so you can connect and collaborate with team members, candidates, and recruiters"
          footer={
            <button
              type="button"
              className="link-btn"
              onClick={() => setAddModalOpen(true)}
            >
              + Add new contact
            </button>
          }
        >
          {contacts && contacts.length > 0 ? (
            contacts.map((c) => (
              <CardRow
                key={c.id}
                icon={<UserCircleIcon />}
                label={c.name}
                value={c.email}
                onClick={() => showToast(`Contact details: ${c.name} (${c.email})`, 'info')}
                chevron={false}
              />
            ))
          ) : (
            <EmptyState
              icon={<UserCircleIcon />}
              title="No contacts found"
              description="You have no saved contacts in your LetGetIn account."
            />
          )}
        </Card>

        <Card title="Sharing & interactions">
          <CardRow
            icon={<SavedInteractionsIcon />}
            label="Contact info from saved interactions"
            value="Active"
            onClick={() => showToast('Saved interactions preference active', 'info')}
          />
          <CardRow
            icon={<PhoneIcon />}
            label="Contact info from linked accounts"
            value="Active"
            onClick={() => showToast('Linked account sync is enabled', 'info')}
          />
          <CardRow
            icon={<BlockIcon />}
            label="Blocked users and contacts"
            value="0 users"
            onClick={() => showToast('No users currently blocked', 'info')}
          />
        </Card>
      </div>

      <Modal
        isOpen={addModalOpen}
        title="Add New Contact"
        onClose={() => setAddModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddContact}>
              Add Contact
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <Input
            label="Contact Name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            placeholder="e.g. Alex Morgan"
          />
          <Input
            label="Email Address"
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            placeholder="e.g. alex@example.com"
          />
        </div>
      </Modal>
    </>
  )
}
