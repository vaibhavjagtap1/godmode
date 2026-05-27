import { Queue, Worker } from 'bullmq';
import { env } from '../lib/env.js';
import { LookupPipelineService } from './LookupPipelineService.js';

interface BulkJobPayload {
  email: string;
  userId: string;
}

const bulkQueueName = 'bulk-lookup';
const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379)
};
const queue = new Queue<BulkJobPayload, unknown, string>(bulkQueueName, { connection });
const results = new Map<string, Array<{ email: string; result: unknown }>>();

const pipeline = new LookupPipelineService();

new Worker<BulkJobPayload>(
  bulkQueueName,
  async (job) => {
    const result = await pipeline.lookup(job.data.userId, job.data.email, {
      includePastes: true,
      includeContactLeaks: true,
      includeDuplicateCheck: true,
      includeGoogleFootprint: true
    });

    const current = results.get(job.id ?? '') ?? [];
    current.push({ email: job.data.email, result });
    results.set(job.id ?? '', current);
  },
  { connection }
);

export class BulkJobService {
  async enqueue(userId: string, emails: string[]) {
    const jobs = await queue.addBulk(
      emails.map((email) => ({
        name: 'lookup',
        data: { email, userId }
      }))
    );

    return {
      jobId: jobs[0]?.id?.toString() ?? '',
      queued: jobs.length
    };
  }

  async getStatus(jobId: string) {
    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      jobId,
      state,
      progress: job.progress,
      result: results.get(jobId) ?? []
    };
  }
}
