import axios, { AxiosInstance } from 'axios';
import { Contact, List, WhatsAppTemplate } from './types.js';

export class GHLClient {
  private apiKey: string;
  private locationId: string;
  private http: AxiosInstance;

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.http = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
    });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.http.get(`/locations/${this.locationId}`);
      return response.status === 200;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  async getContacts(search?: string): Promise<Contact[]> {
    try {
      const params: Record<string, string> = {
        locationId: this.locationId,
        limit: '100',
      };
      if (search) {
        params.query = search;
      }

      const response = await this.http.get('/contacts/', { params });
      const raw = response.data.contacts || [];

      return raw.map((c: any) => ({
        id: c.id,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        email: c.email || '',
        phone: c.phone || '',
        locationId: c.locationId,
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getLists(): Promise<List[]> {
    try {
      // GHL v2: smart lists are called "contact smart lists"
      const response = await this.http.get('/contacts/smart-lists/', {
        params: { locationId: this.locationId },
      });
      return (response.data.smartLists || response.data.lists || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        memberCount: l.count ?? l.memberCount ?? 0,
      }));
    } catch (error) {
      console.error('Error fetching lists (returning empty):', error);
      // Smart lists may not be available on all plans — return empty instead of crashing
      return [];
    }
  }

  async getContactsByList(listId: string): Promise<Contact[]> {
    try {
      const response = await this.http.get('/contacts/', {
        params: {
          locationId: this.locationId,
          smartListId: listId,
          limit: '100',
        },
      });
      const raw = response.data.contacts || [];
      return raw.map((c: any) => ({
        id: c.id,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        email: c.email || '',
        phone: c.phone || '',
        locationId: c.locationId,
      }));
    } catch (error) {
      console.error('Error fetching contacts by list:', error);
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      // GHL v2: WhatsApp templates via conversations messages templates
      const response = await this.http.get('/conversations/messages/templates', {
        params: { locationId: this.locationId },
      });
      const raw = response.data.templates || response.data?.data || [];
      return Array.isArray(raw)
        ? raw.map((t: any) => ({
            id: t.id || t.name,
            name: t.name,
            category: t.category || 'MARKETING',
            status: t.status || 'APPROVED',
            language: t.language || 'pt_BR',
            variables: t.variables || extractVariables(t.body || ''),
          }))
        : [];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      // Return empty instead of crashing — templates may not be configured
      return [];
    }
  }

  async sendWhatsAppMessage(
    contactId: string,
    templateId: string,
    variables?: Record<string, string>
  ): Promise<boolean> {
    try {
      const response = await this.http.post('/conversations/messages', {
        type: 'WhatsApp',
        contactId,
        templateId,
        locationId: this.locationId,
        ...(variables && { templateParams: Object.values(variables) }),
      });
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error(`Error sending WhatsApp message to contact ${contactId}:`, error);
      return false;
    }
  }
}

// Extract {{variable}} placeholders from template body
function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}
