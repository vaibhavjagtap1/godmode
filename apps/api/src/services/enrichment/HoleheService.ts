import { spawn } from 'node:child_process';

const sensitivePlatforms = new Set(['onlyfans']);

export class HoleheService {
  async search(email: string): Promise<Array<{ platform: string; username: string; profileUrl: string; found: boolean; sensitive: boolean }>> {
    return await new Promise((resolve) => {
      const process = spawn('holehe', [email, '--only-used']);
      let output = '';

      process.stdout.on('data', (chunk) => {
        output += chunk.toString();
      });

      process.on('close', () => {
        const lines = output
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        const accounts = lines.flatMap((line) => {
          try {
            const parsed = JSON.parse(line) as Record<string, unknown>;
            const platform = String(parsed.name ?? parsed.website ?? 'unknown');
            return [{
              platform,
              username: String(parsed.emailrecovery ?? ''),
              profileUrl: String(parsed.domain ?? ''),
              found: Boolean(parsed.exists),
              sensitive: sensitivePlatforms.has(platform.toLowerCase())
            }];
          } catch {
            return [];
          }
        });

        resolve(accounts);
      });

      process.on('error', () => resolve([]));
    });
  }
}
