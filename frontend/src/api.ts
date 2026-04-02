import axios from 'axios';
import { Contact, ContactList, WhatsAppTemplate, DispatchRequest, DispatchJob } from './types';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Auth
  validateGHLKey: async (apiKey: string, locationId: string) => {
    const response = await client.post('/auth/validate-ghl-key', {
      apiKey,
      locationId,
    });
    return response.data;
  },

  // Contacts
  getContacts: async (search?: string): Promise<{ contacts: Contact[] }> => {
    const response = await client.get('/contacts', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  // Lists
  getLists: async (): Promise<{ lists: ContactList[] }> => {
    const response = await client.get('/lists');
    return response.data;
  },

  getListContacts: async (listId: string): Promise<{ contacts: Contact[] }> => {
    const response = await client.get(`/lists/${listId}/contacts`);
    return response.data;
  },

  // Templates
  getTemplates: async (): Promise<{ templates: WhatsAppTemplate[] }> => {
    const response = await client.get('/whatsapp/templates');
    return response.data;
  },

  // Custom Templates
  getCustomTemplates: async (): Promise<{ templates: any[] }> => {
    const response = await client.get('/custom-templates');
    return response.data;
  },

  createCustomTemplate: async (name: string, body: string): Promise<any> => {
    const response = await client.post('/custom-templates', { name, body });
    return response.data;
  },

  deleteCustomTemplate: async (id: string): Promise<void> => {
    await client.delete(`/custom-templates/${id}`);
  },

  // Dispatch
  previewDispatch: async (
    templateId: string,
    recipients: string[],
    variables: Record<string, string>
  ) => {
    const response = await client.post('/dispatch/preview', {
      templateId,
      recipients,
      variables,
    });
    return response.data;
  },

  sendDispatch: async (request: DispatchRequest): Promise<{ jobId: string; status: string }> => {
    const response = await client.post('/dispatch/send', request);
    return response.data;
  },

  getDispatchStatus: async (jobId: string): Promise<DispatchJob> => {
    const response = await client.get(`/dispatch/status/${jobId}`);
    return response.data;
  },

  getDispatchHistory: async (limit?: number): Promise<{ history: DispatchJob[] }> => {
    const response = await client.get('/dispatch/history', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },
};
