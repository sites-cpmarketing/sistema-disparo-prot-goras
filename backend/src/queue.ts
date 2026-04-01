import { DispatchJob, DispatchRequest, DispatchResult } from './types.js';
import { GHLClient } from './ghl-client.js';

const RATE_LIMIT = 80; // messages per second
const BATCH_SIZE = 10; // process 10 messages at a time
const BATCH_DELAY = (BATCH_SIZE / RATE_LIMIT) * 1000; // delay between batches

export class DispatchQueue {
  private jobs: Map<string, DispatchJob> = new Map();
  private queue: string[] = [];
  private processing = false;
  private ghlClient: GHLClient;

  constructor(ghlClient: GHLClient) {
    this.ghlClient = ghlClient;
  }

  async enqueue(request: DispatchRequest): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: DispatchJob = {
      id: jobId,
      status: 'pending',
      templateId: request.templateId,
      templateName: request.templateName,
      recipientCount: request.recipients.length,
      sentCount: 0,
      failedCount: 0,
      variables: request.variables,
      createdAt: new Date(),
      updatedAt: new Date(),
      results: [],
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return jobId;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const jobId = this.queue[0];
      const job = this.jobs.get(jobId);

      if (!job) {
        this.queue.shift();
        continue;
      }

      job.status = 'sending';
      job.updatedAt = new Date();

      try {
        await this.processJob(job);
        job.status = 'completed';
      } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        job.status = 'failed';
      }

      job.updatedAt = new Date();
      this.queue.shift();
    }

    this.processing = false;
  }

  private async processJob(job: DispatchJob): Promise<void> {
    const contacts = job.results; // reuse the results array
    const totalContacts = job.recipientCount;

    // Process in batches to respect rate limit
    for (let i = 0; i < totalContacts; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (result: DispatchResult) => {
          try {
            const response = await this.ghlClient.sendWhatsAppMessage(
              result.phone,
              job.templateId,
              job.variables
            );

            result.status = 'sent';
            result.sentAt = new Date();
            job.sentCount++;
          } catch (error) {
            result.status = 'failed';
            result.message = String(error instanceof Error ? error.message : 'Unknown error');
            job.failedCount++;
          }
        })
      );

      // Respect rate limit
      if (i + BATCH_SIZE < totalContacts) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
  }

  getJob(jobId: string): DispatchJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): DispatchJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getHistory(limit: number = 50): DispatchJob[] {
    return this.getAllJobs().slice(0, limit);
  }

  clearOldJobs(hoursOld: number = 24): void {
    const now = Date.now();
    const oldJobsThreshold = hoursOld * 60 * 60 * 1000;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt.getTime() > oldJobsThreshold) {
        this.jobs.delete(jobId);
      }
    }
  }
}
