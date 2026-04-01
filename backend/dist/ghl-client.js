"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHLClient = void 0;
const axios_1 = __importDefault(require("axios"));
class GHLClient {
    constructor(apiKey, locationId) {
        this.baseURL = 'https://rest.gohighlevel.com/v1';
        this.contactsCache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        this.apiKey = apiKey;
        this.locationId = locationId;
    }
    async validateApiKey() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/locations/${this.locationId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('Error validating API key:', error);
            return false;
        }
    }
    async getContacts(search) {
        try {
            // Check cache
            const cacheKey = `contacts_${search || 'all'}`;
            const cached = this.contactsCache.get(cacheKey);
            if (cached) {
                return cached;
            }
            const params = {
                locationId: this.locationId,
            };
            if (search) {
                params.query = search;
            }
            const response = await axios_1.default.get(`${this.baseURL}/contacts/`, {
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
        }
        catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }
    async getLists() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/lists/`, {
                params: { locationId: this.locationId },
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.lists || [];
        }
        catch (error) {
            console.error('Error fetching lists:', error);
            throw error;
        }
    }
    async getContactsByList(listId) {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/lists/${listId}/contacts`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.contacts || [];
        }
        catch (error) {
            console.error('Error fetching contacts by list:', error);
            throw error;
        }
    }
    async getWhatsAppTemplates() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/locations/${this.locationId}/whatsapp/templates`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.templates || [];
        }
        catch (error) {
            console.error('Error fetching WhatsApp templates:', error);
            throw error;
        }
    }
    async sendWhatsAppMessage(to, templateId, variables) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/locations/${this.locationId}/whatsapp/send`, {
                phoneNumber: to,
                templateId,
                variables,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(`Error sending WhatsApp message to ${to}:`, error);
            return false;
        }
    }
}
exports.GHLClient = GHLClient;
