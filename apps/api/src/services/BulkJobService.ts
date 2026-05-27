import crypto from 'node:crypto';
import { Queue, Worker } from 'bullmq';
import { env } from '../lib/env.js';
import { redis } from '../lib/redis.js';
import { LookupPipelineService } from './LookupPipelineService.js';

interface BulkJobPayload {
  email: string;
  userId: string;
  batchId: string;
}

const bulkQueueName = 'bulk-lookup';
const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379)
};
const queue = new Queue<BulkJobPayload, unknown, string>(bulkQueueName, { connection });
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

    const key = `bulk:${job.data.batchId}:results`;
    const current = await redis.get(key);
    const parsed = current ? (JSON.parse(current) as Array<{ email: string; result: unknown }>) : [];
    parsed.push({ email: job.data.email, result });
    await redis.set(key, JSON.stringify(parsed), 'EX', 24 * 60 * 60);
  },
  { connection }
);

export class BulkJobService {
  async enqueue(userId: string, emails: string[]) {
    const batchId = crypto.randomUUID();
    const jobs = await queue.addBulk(
      emails.map((email) => ({
        name: 'lookup',
        data: { email, userId, batchId }
      }))
    );

    return {
      jobId: batchId,
      queued: jobs.length
    };
  }

  async getStatus(jobId: string) {
    const jobs = await queue.getJobs(['completed', 'failed', 'waiting', 'active', 'delayed'], 0, -1, true);
    const batchJobs = jobs.filter((job) => job.data.batchId === jobId);
    if (batchJobs.length === 0) {
      return null;
    }
    const completedCount = (await Promise.all(batchJobs.map((job) => job.getState()))).filter((state) => state === 'completed').length;
    return {
      jobId,
      state: completedCount === batchJobs.length ? 'completed' : 'in_progress',
      progress: Math.round((completedCount / batchJobs.length) * 100),
      result: await this.getResults(jobId)
    };
  }

  private async getResults(jobId: string) {
    const raw = await redis.get(`bulk:${jobId}:results`);
    return raw ? (JSON.parse(raw) as Array<{ email: string; result: unknown }>) : [];
  }
}
