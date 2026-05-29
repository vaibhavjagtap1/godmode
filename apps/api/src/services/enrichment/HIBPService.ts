import fetch from 'node-fetch';

export class HIBPService {
  async breaches(email: string): Promise<Record<string, unknown>[]> {
    const apiKey = process.env.HIBP_API_KEY;
    if (!apiKey) {
      return [];
    }

    const headers = {
      'hibp-api-key': apiKey,
      'user-agent': 'BehindTheEmail'
    };

    try {
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, { headers });
      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as Record<string, unknown>[];
      return data;
    } catch {
      return [];
    }
  }

  async pastes(email: string): Promise<Record<string, unknown>[]> {
    const apiKey = process.env.HIBP_API_KEY;
    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch(`https://haveibeenpwned.com/api/v3/pasteaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'BehindTheEmail'
        }
      });

      if (response.status === 404 || !response.ok) {
        return [];
      }

      return (await response.json()) as Record<string, unknown>[];
    } catch {
      return [];
    }
  }
}
