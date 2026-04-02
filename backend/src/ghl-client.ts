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
        tags: c.tags || [],
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  // Uses GHL contact tags as "lists" — each unique tag is a list
  async getLists(): Promise<List[]> {
    try {
      const contacts = await this.getContacts();
      const tagMap = new Map<string, number>();

      contacts.forEach((c: any) => {
        (c.tags || []).forEach((tag: string) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagMap.entries()).map(([name, count]) => ({
        id: name,
        name,
        contactCount: count,
      }));
    } catch (error) {
      console.error('Error fetching tags as lists:', error);
      return [];
    }
  }

  // Returns contacts that have the given tag
  async getContactsByList(tag: string): Promise<Contact[]> {
    try {
      const contacts = await this.getContacts();
      return contacts.filter((c: any) => (c.tags || []).includes(tag));
    } catch (error) {
      console.error('Error fetching contacts by tag:', error);
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    // GHL v2 does not expose WhatsApp templates via REST API.
    // Templates are managed directly in the app (custom templates).
    return [];
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
      console.error(`Error sending WhatsApp to contact ${contactId}:`, error);
      return false;
    }
  }
}

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}
