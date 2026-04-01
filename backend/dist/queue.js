"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchQueue = void 0;
class DispatchQueue {
    constructor(ghlClient) {
        this.queue = [];
        this.jobs = new Map();
        this.processing = false;
        this.rateLimitDelay = 100; // 100ms between messages
        this.ghlClient = ghlClient;
        this.startProcessing();
    }
    async enqueue(request) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
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
        this.queue.push({ ...request, templateId: jobId });
        return jobId;
    }
    startProcessing() {
        setInterval(async () => {
            if (!this.processing && this.queue.length > 0) {
                await this.processNext();
            }
        }, 1000);
    }
    async processNext() {
        if (this.queue.length === 0)
            return;
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
                    const success = await this.ghlClient.sendWhatsAppMessage(recipient, job.templateId, request.variables);
                    if (success) {
                        job.sentCount++;
                    }
                    else {
                        job.failedCount++;
                        job.errors?.push({
                            phone: recipient,
                            error: 'Failed to send message',
                        });
                    }
                    // Rate limiting
                    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
                }
                catch (error) {
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
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    getHistory(limit = 50) {
        const allJobs = Array.from(this.jobs.values());
        return allJobs.slice(-limit).reverse();
    }
}
exports.DispatchQueue = DispatchQueue;
