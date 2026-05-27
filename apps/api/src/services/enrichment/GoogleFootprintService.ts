import crypto from 'node:crypto';
import fetch from 'node-fetch';

export class GoogleFootprintService {
  async gravatar(email: string): Promise<Record<string, unknown> | null> {
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');

    try {
      const response = await fetch(`https://www.gravatar.com/${hash}.json`);
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as { entry?: Array<Record<string, unknown>> };
      return data.entry?.[0] ?? null;
    } catch {
      return null;
    }
  }
}
