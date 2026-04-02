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
            }));
        }
        catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }
    async getLists() {
        try {
            // GHL v2: smart lists are called "contact smart lists"
            const response = await this.http.get('/contacts/smart-lists/', {
                params: { locationId: this.locationId },
            });
            return (response.data.smartLists || response.data.lists || []).map((l) => ({
                id: l.id,
                name: l.name,
                memberCount: l.count ?? l.memberCount ?? 0,
            }));
        }
        catch (error) {
            console.error('Error fetching lists (returning empty):', error);
            // Smart lists may not be available on all plans — return empty instead of crashing
            return [];
        }
    }
    async getContactsByList(listId) {
        try {
            const response = await this.http.get('/contacts/', {
                params: {
                    locationId: this.locationId,
                    smartListId: listId,
                    limit: '100',
                },
            });
            const raw = response.data.contacts || [];
            return raw.map((c) => ({
                id: c.id,
                firstName: c.firstName || '',
                lastName: c.lastName || '',
                email: c.email || '',
                phone: c.phone || '',
                locationId: c.locationId,
            }));
        }
        catch (error) {
            console.error('Error fetching contacts by list:', error);
            throw error;
        }
    }
    async getWhatsAppTemplates() {
        try {
            const response = await this.http.get(`/locations/${this.locationId}/whatsapp/templates`);
            const raw = response.data.templates || response.data || [];
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
            console.error('Error fetching WhatsApp templates:', error);
            throw error;
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
            console.error(`Error sending WhatsApp message to contact ${contactId}:`, error);
            return false;
        }
    }
}
exports.GHLClient = GHLClient;
// Extract {{variable}} placeholders from template body
function extractVariables(body) {
    const matches = body.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}
