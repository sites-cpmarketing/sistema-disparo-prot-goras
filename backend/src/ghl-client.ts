import axios from 'axios';
import { Contact, List, WhatsAppTemplate } from './types.js';

export class GHLClient {
  private apiKey: string;
  private locationId: string;
  private baseURL = 'https://rest.gohighlevel.com/v1';
  private contactsCache: Map<string, Contact[]> = new Map();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/locations/${this.locationId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  async getContacts(search?: string): Promise<Contact[]> {
    try {
      // Check cache
      const cacheKey = `contacts_${search || 'all'}`;
      const cached = this.contactsCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const params: any = {
        locationId: this.locationId,
      };
      if (search) {
        params.query = search;
      }

      const response = await axios.get(`${this.baseURL}/contacts/`, {
        params,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const contacts = response.data.contacts || [];
      this.contactsCache.set(cacheKey, contacts);

      // Clear cache after 30 minutes
      setTimeout(() => this.contactsCache.delete(cacheKey), this.cacheExpiry);

      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getLists(): Promise<List[]> {
    try {
      const response = await axios.get(`${this.baseURL}/lists/`, {
        params: { locationId: this.locationId },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.lists || [];
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw error;
    }
  }

  async getContactsByList(listId: string): Promise<Contact[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/lists/${listId}/contacts`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.contacts || [];
    } catch (error) {
      console.error('Error fetching contacts by list:', error);
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/locations/${this.locationId}/whatsapp/templates`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.templates || [];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  async sendWhatsAppMessage(
    to: string,
    templateId: string,
    variables?: Record<string, string>
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/locations/${this.locationId}/whatsapp/send`,
        {
          phoneNumber: to,
          templateId,
          variables,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error(`Error sending WhatsApp message to ${to}:`, error);
      return false;
    }
  }
}
