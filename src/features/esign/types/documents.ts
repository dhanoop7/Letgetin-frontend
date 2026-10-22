export type ESignDocumentStatus =
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'AWAITING_VERIFICATION'
  | 'EXPIRED';

export type ESignDocumentCategory =
  | 'Employment'
  | 'Legal & NDA'
  | 'Compliance'
  | 'Background Check'
  | 'Benefits & Tax'
  | 'Uploaded Document';

export interface ESignDocumentItem {
  id: string;
  title: string;
  category: ESignDocumentCategory;
  requestedBy: {
    name: string;
    company: string;
    avatar?: string;
  };
  fileSize: string;
  fileFormat: string;
  status: ESignDocumentStatus;
  dateUploaded: string;
  dateSigned?: string;
  lastUpdated: string;
  expiresAt?: string;
  description: string;
  requiresAction: boolean;
  pagesCount: number;
}

export type ESignNotificationType =
  | 'SIGNATURE_REQUIRED'
  | 'CONSENT_REQUEST'
  | 'DOCUMENT_SIGNED'
  | 'VERIFICATION_COMPLETED'
  | 'DOCUMENT_EXPIRED'
  | 'ADDITIONAL_AUTH_REQUEST';

export interface ESignNotificationItem {
  id: string;
  type: ESignNotificationType;
  title: string;
  description: string;
  date: string;
  time: string;
  isRead: boolean;
  relatedDocumentId?: string;
  actionLabel?: string;
  actionTab?: 'overview' | 'my-esign' | 'documents' | 'notifications';
  companyName?: string;
}
