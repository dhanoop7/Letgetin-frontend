import type { ReactNode } from 'react'
import { FolderIcon } from './Icons'
import './EmptyState.css'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

/**
 * Reusable EmptyState UI component for displaying zero-data / empty list fallbacks.
 */
export function EmptyState({ icon = <FolderIcon />, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {action}
    </div>
  )
}
