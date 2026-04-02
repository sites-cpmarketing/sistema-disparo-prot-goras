"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHLClient = void 0;
const axios_1 = __importDefault(require("axios"));
class GHLClient {
    constructor(apiKey, locationId) {
        this.apiKey = apiKey;
        this.locationId = locationId;
        this.http = axios_1.default.create({
            baseURL: 'https://services.leadconnectorhq.com',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                Version: '2021-07-28',
            },
        });
    }
    async validateApiKey() {
        try {
            const response = await this.http.get(`/locations/${this.locationId}`);
            return response.status === 200;
        }
        catch (error) {
            console.error('Error validating API key:', error);
            return false;
        }
    }
    async getContacts(search) {
        try {
            const params = {
                locationId: this.locationId,
                limit: '100',
            };
            if (search) {
                params.query = search;
            }
            const response = await this.http.get('/contacts/', { params });
            const raw = response.data.contacts || [];
            return raw.map((c) => ({
                id: c.id,
                firstName: c.firstName || '',
                lastName: c.lastName || '',
                email: c.email || '',
                phone: c.phone || '',
                locationId: c.locationId,
                tags: c.tags || [],
            }));
        }
        catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }
    // Uses GHL contact tags as "lists" — each unique tag is a list
    async getLists() {
        try {
            const contacts = await this.getContacts();
            const tagMap = new Map();
            contacts.forEach((c) => {
                (c.tags || []).forEach((tag) => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
                });
            });
            return Array.from(tagMap.entries()).map(([name, count]) => ({
                id: name,
                name,
                contactCount: count,
            }));
        }
        catch (error) {
            console.error('Error fetching tags as lists:', error);
            return [];
        }
    }
    // Returns contacts that have the given tag
    async getContactsByList(tag) {
        try {
            const contacts = await this.getContacts();
            return contacts.filter((c) => (c.tags || []).includes(tag));
        }
        catch (error) {
            console.error('Error fetching contacts by tag:', error);
            throw error;
        }
    }
    async getWhatsAppTemplates() {
        try {
            const response = await this.http.get('/conversations/messages/templates', {
                params: { locationId: this.locationId },
            });
            const raw = response.data.templates || response.data?.data || [];
            return Array.isArray(raw)
                ? raw.map((t) => ({
                    id: t.id || t.name,
                    name: t.name,
                    category: t.category || 'MARKETING',
                    status: t.status || 'APPROVED',
                    language: t.language || 'pt_BR',
                    variables: t.variables || extractVariables(t.body || ''),
                }))
                : [];
        }
        catch (error) {
            console.error('Error fetching WhatsApp templates (returning empty):', error);
            return [];
        }
    }
    async sendWhatsAppMessage(contactId, templateId, variables) {
        try {
            const response = await this.http.post('/conversations/messages', {
                type: 'WhatsApp',
                contactId,
                templateId,
                locationId: this.locationId,
                ...(variables && { templateParams: Object.values(variables) }),
            });
            return response.status === 200 || response.status === 201;
        }
        catch (error) {
            console.error(`Error sending WhatsApp to contact ${contactId}:`, error);
            return false;
        }
    }
}
exports.GHLClient = GHLClient;
function extractVariables(body) {
    const matches = body.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}
