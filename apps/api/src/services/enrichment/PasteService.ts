import fetch from 'node-fetch';

export class PasteService {
  async searchByGoogleCse(email: string): Promise<Array<Record<string, unknown>>> {
    const key = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_ID;
    if (!key || !cx) {
      return [];
    }

    const query = `\"${email}\" site:pastebin.com OR site:rentry.co OR site:ghostbin.com OR site:controlc.com`;
    try {
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        return [];
      }
      const data = (await response.json()) as { items?: Array<Record<string, unknown>> };
      return (data.items ?? []).map((item) => ({
        source: 'Google CSE',
        url: String(item.link ?? ''),
        title: String(item.title ?? ''),
        snippet: String(item.snippet ?? '').slice(0, 150)
      }));
    } catch {
      return [];
    }
  }
}
