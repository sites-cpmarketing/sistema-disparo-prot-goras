export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface List {
  id: string;
  name: string;
  contactCount?: number;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category?: string;
  language?: string;
}

export interface DispatchRequest {
  templateId: string;
  variables?: Record<string, string>;
  recipients: string[];
}

export interface DispatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  templateId: string;
  recipients: string[];
  variables?: Record<string, string>;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  completedAt?: Date;
  errors?: Array<{ phone: string; error: string }>;
}
