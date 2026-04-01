import axios, { AxiosInstance } from 'axios';
import { Contact, ContactList, WhatsAppTemplate, GHLContactsResponse, GHLListsResponse, GHLTemplatesResponse } from './types.js';

const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class GHLClient {
  private client: AxiosInstance;
  private apiKey: string;
  private locationId: string;
  private cache: Map<string, CacheEntry<any>> = new Map();

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.client = axios.create({
      baseURL: GHL_BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private getCacheKey(method: string, params?: any): string {
    return `${method}:${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.client.get(`/locations/${this.locationId}`);
      return response.status === 200;
    } catch (error) {
      console.error('GHL API validation failed:', error);
      return false;
    }
  }

  async getContacts(search?: string): Promise<Contact[]> {
    try {
      const cacheKey = this.getCacheKey('getContacts', { search });
      const cached = this.getFromCache<Contact[]>(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        locationId: this.locationId,
        limit: '100',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await this.client.get<GHLContactsResponse>(
        `/contacts?${params.toString()}`
      );

      const contacts = response.data.contacts || [];
      this.setCache(cacheKey, contacts);
      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContactsByList(listId: string): Promise<Contact[]> {
    try {
      const cacheKey = this.getCacheKey('getContactsByList', { listId });
      const cached = this.getFromCache<Contact[]>(cacheKey);
      if (cached) return cached;

      const response = await this.client.get<GHLContactsResponse>(
        `/contacts/lists/${listId}/contacts`,
        {
          params: {
            locationId: this.locationId,
            limit: '100',
          },
        }
      );

      const contacts = response.data.contacts || [];
      this.setCache(cacheKey, contacts);
      return contacts;
    } catch (error) {
      console.error('Error fetching contacts by list:', error);
      throw error;
    }
  }

  async getLists(): Promise<ContactList[]> {
    try {
      const cacheKey = this.getCacheKey('getLists');
      const cached = this.getFromCache<ContactList[]>(cacheKey);
      if (cached) return cached;

      const response = await this.client.get<GHLListsResponse>(
        `/contacts/lists`,
        {
          params: {
            locationId: this.locationId,
          },
        }
      );

      const lists = response.data.lists || [];
      this.setCache(cacheKey, lists);
      return lists;
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const cacheKey = this.getCacheKey('getWhatsAppTemplates');
      const cached = this.getFromCache<WhatsAppTemplate[]>(cacheKey);
      if (cached) return cached;

      const response = await this.client.get<GHLTemplatesResponse>(
        `/locations/${this.locationId}/whatsapp/templates`
      );

      const templates = response.data.templates || [];
      this.setCache(cacheKey, templates);
      return templates;
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  async sendWhatsAppMessage(
    phoneNumber: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<{ messageId: string; status: string }> {
    try {
      const response = await this.client.post(
        `/locations/${this.locationId}/whatsapp/send`,
        {
          phoneNumber,
          templateId,
          variables,
        }
      );

      return {
        messageId: response.data.messageId || response.data.id,
        status: response.data.status || 'sent',
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
