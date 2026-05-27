import fetch from 'node-fetch';

export class LinkedInService {
  async enrich(email: string): Promise<Record<string, unknown> | null> {
    const apiKey = process.env.PROXYCURL_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(`https://nubela.co/proxycurl/api/linkedin/profile/resolve/email?work_email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: 'Bearer ' + apiKey
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as Record<string, unknown>;
      return data;
    } catch {
      return null;
    }
  }
}
