"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ghl_client_js_1 = require("./ghl-client.js");
const queue_js_1 = require("./queue.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
const allowedOrigin = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
app.use((0, cors_1.default)({
    origin: allowedOrigin || '*',
    credentials: true,
}));
// Global variables
let ghlClient = null;
let dispatchQueue = null;
let customTemplates = [];
let customLists = [];
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Auth Routes
app.post('/api/auth/validate-ghl-key', async (req, res) => {
    try {
        const { apiKey, locationId } = req.body;
        if (!apiKey || !locationId) {
            return res.status(400).json({ error: 'Missing apiKey or locationId' });
        }
        const client = new ghl_client_js_1.GHLClient(apiKey, locationId);
        const isValid = await client.validateApiKey();
        if (isValid) {
            // Store the client for this session
            ghlClient = client;
            dispatchQueue = new queue_js_1.DispatchQueue(client);
            res.json({ valid: true, message: 'API key is valid' });
        }
        else {
            res.status(401).json({ valid: false, error: 'Invalid API key' });
        }
    }
    catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Contacts Routes
app.get('/api/contacts', async (req, res) => {
    try {
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const search = req.query.search;
        const contacts = await ghlClient.getContacts(search);
        res.json({ contacts });
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});
// Lists Routes — returns custom lists only
app.get('/api/lists', (req, res) => {
    const lists = customLists.map((l) => ({
        id: l.id,
        name: l.name,
        memberCount: l.contactIds.length,
    }));
    res.json({ lists });
});
app.get('/api/lists/:listId/contacts', async (req, res) => {
    try {
        const { listId } = req.params;
        const list = customLists.find((l) => l.id === listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Fetch all contacts and filter by IDs in the list
        const all = await ghlClient.getContacts();
        const contacts = all.filter((c) => list.contactIds.includes(c.id));
        res.json({ contacts });
    }
    catch (error) {
        console.error('Error fetching contacts by list:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});
// Custom Lists CRUD
app.post('/api/custom-lists', (req, res) => {
    const { name, contactIds } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name is required' });
    const list = {
        id: `list_${Date.now()}`,
        name,
        contactIds: contactIds || [],
        createdAt: new Date().toISOString(),
    };
    customLists.push(list);
    res.status(201).json(list);
});
app.put('/api/custom-lists/:id', (req, res) => {
    const { id } = req.params;
    const list = customLists.find((l) => l.id === id);
    if (!list)
        return res.status(404).json({ error: 'List not found' });
    if (req.body.name)
        list.name = req.body.name;
    if (Array.isArray(req.body.contactIds))
        list.contactIds = req.body.contactIds;
    res.json(list);
});
app.delete('/api/custom-lists/:id', (req, res) => {
    const before = customLists.length;
    customLists = customLists.filter((l) => l.id !== req.params.id);
    if (customLists.length === before)
        return res.status(404).json({ error: 'List not found' });
    res.json({ success: true });
});
// WhatsApp Templates Routes — merges GHL templates with custom templates
app.get('/api/whatsapp/templates', async (req, res) => {
    try {
        let ghlTemplates = [];
        if (ghlClient) {
            ghlTemplates = await ghlClient.getWhatsAppTemplates();
        }
        // Custom templates formatted as WhatsAppTemplate
        const custom = customTemplates.map((t) => ({
            id: t.id,
            name: t.name,
            category: 'CUSTOM',
            status: 'APPROVED',
            language: 'pt_BR',
            variables: t.variables,
            body: t.body,
            isCustom: true,
        }));
        res.json({ templates: [...ghlTemplates, ...custom] });
    }
    catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});
// Custom Templates CRUD
app.get('/api/custom-templates', (req, res) => {
    res.json({ templates: customTemplates });
});
app.post('/api/custom-templates', (req, res) => {
    const { name, body } = req.body;
    if (!name || !body) {
        return res.status(400).json({ error: 'name and body are required' });
    }
    const variables = (body.match(/\{\{(\w+)\}\}/g) || []).map((m) => m.replace(/\{\{|\}\}/g, ''));
    const template = {
        id: `custom_${Date.now()}`,
        name,
        body,
        variables: [...new Set(variables)],
        createdAt: new Date().toISOString(),
    };
    customTemplates.push(template);
    res.status(201).json(template);
});
app.delete('/api/custom-templates/:id', (req, res) => {
    const { id } = req.params;
    const before = customTemplates.length;
    customTemplates = customTemplates.filter((t) => t.id !== id);
    if (customTemplates.length === before) {
        return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ success: true });
});
// Dispatch Routes
app.post('/api/dispatch/preview', async (req, res) => {
    try {
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { templateId, variables, recipients } = req.body;
        if (!templateId || !recipients || recipients.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Return a preview of the message
        res.json({
            preview: {
                template: templateId,
                recipientCount: recipients.length,
                variables,
            },
        });
    }
    catch (error) {
        console.error('Error generating preview:', error);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
});
app.post('/api/dispatch/send', async (req, res) => {
    try {
        if (!ghlClient || !dispatchQueue) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const dispatchRequest = req.body;
        if (!dispatchRequest.templateId || !dispatchRequest.recipients || dispatchRequest.recipients.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const jobId = await dispatchQueue.enqueue(dispatchRequest);
        res.json({ jobId, status: 'enqueued' });
    }
    catch (error) {
        console.error('Error enqueuing dispatch:', error);
        res.status(500).json({ error: 'Failed to enqueue dispatch' });
    }
});
app.get('/api/dispatch/status/:jobId', (req, res) => {
    try {
        if (!dispatchQueue) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { jobId } = req.params;
        const job = dispatchQueue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});
app.get('/api/dispatch/history', (req, res) => {
    try {
        if (!dispatchQueue) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const limit = parseInt(req.query.limit) || 50;
        const history = dispatchQueue.getHistory(limit);
        res.json({ history });
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
const server = app.listen(port, () => {
    console.log(`✅ Backend running on port ${port}`);
    console.log(`📍 API URL: http://localhost:${port}`);
    console.log(`🚀 Ready to accept requests`);
});
// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1);
});
