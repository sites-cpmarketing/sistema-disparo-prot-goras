import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GHLClient } from './ghl-client.js';
import { DispatchQueue } from './queue.js';
import { DispatchRequest } from './types.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const allowedOrigin = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
app.use(cors({
  origin: allowedOrigin || '*',
  credentials: true,
}));

// Global variables
let ghlClient: GHLClient | null = null;
let dispatchQueue: DispatchQueue | null = null;

// Custom templates (in-memory storage)
interface CustomTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  createdAt: string;
}
let customTemplates: CustomTemplate[] = [];

// Custom lists (in-memory storage)
interface CustomList {
  id: string;
  name: string;
  contactIds: string[];
  createdAt: string;
}
let customLists: CustomList[] = [];

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth Routes
app.post('/api/auth/validate-ghl-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, locationId } = req.body;

    if (!apiKey || !locationId) {
      return res.status(400).json({ error: 'Missing apiKey or locationId' });
    }

    const client = new GHLClient(apiKey, locationId);
    const isValid = await client.validateApiKey();

    if (isValid) {
      // Store the client for this session
      ghlClient = client;
      dispatchQueue = new DispatchQueue(client);
      res.json({ valid: true, message: 'API key is valid' });
    } else {
      res.status(401).json({ valid: false, error: 'Invalid API key' });
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contacts Routes
app.get('/api/contacts', async (req: Request, res: Response) => {
  try {
    if (!ghlClient) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const search = req.query.search as string | undefined;
    const contacts = await ghlClient.getContacts(search);
    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Lists Routes — returns custom lists only
app.get('/api/lists', (req: Request, res: Response) => {
  const lists = customLists.map((l) => ({
    id: l.id,
    name: l.name,
    memberCount: l.contactIds.length,
  }));
  res.json({ lists });
});

app.get('/api/lists/:listId/contacts', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching contacts by list:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Custom Lists CRUD
app.post('/api/custom-lists', (req: Request, res: Response) => {
  const { name, contactIds } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const list: CustomList = {
    id: `list_${Date.now()}`,
    name,
    contactIds: contactIds || [],
    createdAt: new Date().toISOString(),
  };
  customLists.push(list);
  res.status(201).json(list);
});

app.put('/api/custom-lists/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = customLists.find((l) => l.id === id);
  if (!list) return res.status(404).json({ error: 'List not found' });
  if (req.body.name) list.name = req.body.name;
  if (Array.isArray(req.body.contactIds)) list.contactIds = req.body.contactIds;
  res.json(list);
});

app.delete('/api/custom-lists/:id', (req: Request, res: Response) => {
  const before = customLists.length;
  customLists = customLists.filter((l) => l.id !== req.params.id);
  if (customLists.length === before) return res.status(404).json({ error: 'List not found' });
  res.json({ success: true });
});

// WhatsApp Templates Routes — merges GHL templates with custom templates
app.get('/api/whatsapp/templates', async (req: Request, res: Response) => {
  try {
    let ghlTemplates: any[] = [];
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
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Custom Templates CRUD
app.get('/api/custom-templates', (req: Request, res: Response) => {
  res.json({ templates: customTemplates });
});

app.post('/api/custom-templates', (req: Request, res: Response) => {
  const { name, body } = req.body;
  if (!name || !body) {
    return res.status(400).json({ error: 'name and body are required' });
  }
  const variables = (body.match(/\{\{(\w+)\}\}/g) || []).map((m: string) =>
    m.replace(/\{\{|\}\}/g, '')
  );
  const template: CustomTemplate = {
    id: `custom_${Date.now()}`,
    name,
    body,
    variables: [...new Set<string>(variables)],
    createdAt: new Date().toISOString(),
  };
  customTemplates.push(template);
  res.status(201).json(template);
});

app.delete('/api/custom-templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const before = customTemplates.length;
  customTemplates = customTemplates.filter((t) => t.id !== id);
  if (customTemplates.length === before) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ success: true });
});

// Dispatch Routes
app.post('/api/dispatch/preview', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

app.post('/api/dispatch/send', async (req: Request, res: Response) => {
  try {
    if (!ghlClient || !dispatchQueue) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const dispatchRequest: DispatchRequest = req.body;

    if (!dispatchRequest.templateId || !dispatchRequest.recipients || dispatchRequest.recipients.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const jobId = await dispatchQueue.enqueue(dispatchRequest);
    res.json({ jobId, status: 'enqueued' });
  } catch (error) {
    console.error('Error enqueuing dispatch:', error);
    res.status(500).json({ error: 'Failed to enqueue dispatch' });
  }
});

app.get('/api/dispatch/status/:jobId', (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

app.get('/api/dispatch/history', (req: Request, res: Response) => {
  try {
    if (!dispatchQueue) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const history = dispatchQueue.getHistory(limit);

    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Error handler
app.use((error: any, req: Request, res: Response, next: any) => {
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
server.on('error', (error: any) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: any) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
