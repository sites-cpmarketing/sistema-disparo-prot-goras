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
  recipients: string[];
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
  createdAt: string;
  updatedAt: string;
}
