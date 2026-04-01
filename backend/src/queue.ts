import { GHLClient } from './ghl-client.js';
import { DispatchRequest, DispatchJob } from './types.js';

export class DispatchQueue {
  private queue: DispatchRequest[] = [];
  private jobs: Map<string, DispatchJob> = new Map();
  private ghlClient: GHLClient;
  private processing = false;
  private rateLimitDelay = 100; // 100ms between messages

  constructor(ghlClient: GHLClient) {
    this.ghlClient = ghlClient;
    this.startProcessing();
  }

  async enqueue(request: DispatchRequest): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: DispatchJob = {
      id: jobId,
      status: 'pending',
      templateId: request.templateId,
      recipients: request.recipients,
      variables: request.variables,
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date(),
      errors: [],
    };

    this.jobs.set(jobId, job);
    this.queue.push({ ...request, templateId: jobId } as any);

    return jobId;
  }

  private startProcessing(): void {
    setInterval(async () => {
      if (!this.processing && this.queue.length > 0) {
        await this.processNext();
      }
    }, 1000);
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) return;

    this.processing = true;
    const request = this.queue.shift();

    if (!request) {
      this.processing = false;
      return;
    }

    const jobId = request.templateId;
    const job = this.jobs.get(jobId);

    if (job) {
      job.status = 'processing';

      for (const recipient of request.recipients) {
        try {
          const success = await this.ghlClient.sendWhatsAppMessage(
            recipient,
            job.templateId,
            request.variables
          );

          if (success) {
            job.sentCount++;
          } else {
            job.failedCount++;
            job.errors?.push({
              phone: recipient,
              error: 'Failed to send message',
            });
          }

          // Rate limiting
          await new Promise((resolve) =>
            setTimeout(resolve, this.rateLimitDelay)
          );
        } catch (error) {
          job.failedCount++;
          job.errors?.push({
            phone: recipient,
            error: String(error),
          });
        }
      }

      job.status = 'completed';
      job.completedAt = new Date();
    }

    this.processing = false;
  }

  getJob(jobId: string): DispatchJob | undefined {
    return this.jobs.get(jobId);
  }

  getHistory(limit: number = 50): DispatchJob[] {
    const allJobs = Array.from(this.jobs.values());
    return allJobs.slice(-limit).reverse();
  }
}
