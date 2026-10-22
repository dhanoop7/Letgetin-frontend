'use client'

import React, { useState } from 'react'
import { PageHeader, Card, CardRow } from '../components/common/Card'
import { Loader } from '../components/common/Loader'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { userService } from '../services/userService'
import { useFetchData } from '../hooks/useFetchData'
import { useToast } from '../hooks/useToast'
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
} from '../components/common/Icons'
import type { HelpArticle } from '../types/user.types'

interface HelpProps {
  onNavigateTab?: (tab: string) => void
  explicitAccountType?: string | null
}

export default function Help({ onNavigateTab, explicitAccountType }: HelpProps) {
  const { showToast } = useToast()
  const { data: articles, isLoading } = useFetchData(() => userService.getHelpArticles())
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      showToast('Please type your feedback message', 'error')
      return
    }
    showToast('Thank you! Your feedback has been sent to the LetGetIn team.', 'success')
    setFeedbackText('')
    setFeedbackModalOpen(false)
  }

  if (isLoading) {
    return <Loader text="Loading help center..." />
  }

  return (
    <>
      <PageHeader
        title="Help & Support"
        subtitle="Answers to common questions, platform guidelines, and dedicated support"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card
          title="Help with common issues"
          description="A curated list of help articles with answers and tips for your LetGetIn account"
          footer={
            <button
              type="button"
              className="link-btn"
              onClick={() => showToast('Opening knowledge base documentation...', 'info')}
            >
              Visit the full documentation hub
            </button>
          }
        >
          {articles?.map((article: HelpArticle) => (
            <CardRow
              key={article.id}
              icon={<DocumentTextIcon />}
              label={article.title}
              value={article.category}
              onClick={() => showToast(`Viewing documentation: ${article.title}`, 'info')}
            />
          ))}
        </Card>

        <Card title="Guided steps & assistance">
          <CardRow
            icon={<ShieldCheckIcon />}
            label="Run Privacy Checkup"
            value="Verify and customize your profile data privacy"
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('data')
              } else {
                showToast('Privacy checkup is available in Data & Personalization', 'info')
              }
            }}
          />
          <CardRow
            icon={<MegaphoneIcon />}
            label="Send Feedback & Suggestions"
            value="Help us improve LetGetIn for your workflow"
            onClick={() => setFeedbackModalOpen(true)}
          />
        </Card>
      </div>

      <Modal
        isOpen={feedbackModalOpen}
        title="Send Platform Feedback"
        onClose={() => setFeedbackModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendFeedback}>
              Submit Feedback
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Tell us about your experience or report any issues with your profile settings.
          </p>
          <textarea
            style={{
              width: '100%',
              minHeight: 110,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
            placeholder="Type your feedback here..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </div>
      </Modal>
    </>
  )
}
