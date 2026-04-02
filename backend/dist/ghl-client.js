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
        // Step 1: fetch location details to find WhatsApp integration IDs
        let locationData = {};
        try {
            const locResp = await this.http.get(`/locations/${this.locationId}`);
            locationData = locResp.data?.location || locResp.data || {};
            console.log('[templates] Location keys:', Object.keys(locationData));
            console.log('[templates] Location social:', JSON.stringify(locationData.social || locationData.integrations || locationData.settings).substring(0, 500));
        }
        catch (e) {
            console.error('[templates] Could not fetch location:', e?.response?.status);
        }
        // Step 2: try templates with different originId candidates
        const originCandidates = [
            undefined, // no originId
            this.locationId, // locationId itself
            locationData.companyId, // company ID
            locationData.id, // location.id
        ].filter(Boolean);
        const uniqueCandidates = [...new Set(originCandidates)];
        for (const originId of uniqueCandidates) {
            const params = { limit: '100', skip: '0' };
            if (originId)
                params.originId = originId;
            try {
                const r = await this.http.get(`/locations/${this.locationId}/templates`, { params });
                const raw = r.data?.templates || r.data?.data || [];
                console.log(`[templates] originId=${originId} → totalCount=${r.data?.totalCount}, found=${raw.length}`);
                if (Array.isArray(raw) && raw.length > 0) {
                    console.log('[templates] SUCCESS! Sample:', JSON.stringify(raw[0]).substring(0, 300));
                    return raw.map((t) => ({
                        id: t.id || t.name,
                        name: t.name,
                        category: t.category || 'MARKETING',
                        status: t.status || 'APPROVED',
                        language: t.language || 'pt_BR',
                        variables: t.variables || extractVariables(t.body || t.template?.body || ''),
                        body: t.body || t.template?.body || t.message || '',
                    }));
                }
            }
            catch (e) {
                console.error(`[templates] originId=${originId} error:`, e?.response?.status, JSON.stringify(e?.response?.data));
            }
        }
        // Step 3: try completely different endpoints
        const altEndpoints = [
            `/conversations/templates?locationId=${this.locationId}`,
            `/locations/${this.locationId}/whatsapp/templates`,
        ];
        for (const url of altEndpoints) {
            try {
                const r = await this.http.get(url);
                console.log(`[templates] ${url} → status 200, data:`, JSON.stringify(r.data).substring(0, 300));
            }
            catch (e) {
                console.error(`[templates] ${url} → error:`, e?.response?.status);
            }
        }
        return [];
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
