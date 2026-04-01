// API Response Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  customFields?: Record<string, string>;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  variables?: string[];
}

export interface DispatchRequest {
  recipients: string[]; // contact IDs
  templateId: string;
  templateName: string;
  variables: Record<string, string>;
  listId?: string;
}

export interface DispatchJob {
  id: string;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  templateId: string;
  templateName: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  variables: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  results: DispatchResult[];
}

export interface DispatchResult {
  contactId: string;
  phone: string;
  status: 'sent' | 'failed';
  message?: string;
  sentAt?: Date;
}

export interface GHLContactsResponse {
  contacts: Contact[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface GHLListsResponse {
  lists: ContactList[];
}

export interface GHLTemplatesResponse {
  templates: WhatsAppTemplate[];
}
