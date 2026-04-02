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
// Lists Routes
app.get('/api/lists', async (req, res) => {
    try {
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const lists = await ghlClient.getLists();
        res.json({ lists });
    }
    catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
});
app.get('/api/lists/:listId/contacts', async (req, res) => {
    try {
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { listId } = req.params;
        const contacts = await ghlClient.getContactsByList(listId);
        res.json({ contacts });
    }
    catch (error) {
        console.error('Error fetching contacts by list:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});
// WhatsApp Templates Routes
app.get('/api/whatsapp/templates', async (req, res) => {
    try {
        if (!ghlClient) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const templates = await ghlClient.getWhatsAppTemplates();
        res.json({ templates });
    }
    catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
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
