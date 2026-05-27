import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';

export class CacheService {
  private ttlMs = 24 * 60 * 60 * 1000;

  hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  }

  async get(email: string): Promise<unknown | null> {
    const emailHash = this.hashEmail(email);
    const cached = await prisma.cache.findUnique({ where: { emailHash } });
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < new Date()) {
      await prisma.cache.delete({ where: { emailHash } });
      return null;
    }

    return cached.resultJson;
  }

  async set(email: string, resultJson: unknown): Promise<void> {
    const emailHash = this.hashEmail(email);
    await prisma.cache.upsert({
      where: { emailHash },
      create: {
        emailHash,
        resultJson: resultJson as object,
        expiresAt: new Date(Date.now() + this.ttlMs)
      },
      update: {
        resultJson: resultJson as object,
        expiresAt: new Date(Date.now() + this.ttlMs)
      }
    });
  }
}
