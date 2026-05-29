import dns from 'node:dns/promises';
import whois from 'node-whois';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const disposableDomains = new Set<string>(require('disposable-email-domains'));

interface DomainIntelligence {
  domain: string;
  registrar: string | null;
  domainAge: string;
  domainAgeDays: number;
  createdDate: string | null;
  mailProvider: string;
  isDisposable: boolean;
  mxRecords: string[];
}

export class DomainService {
  async enrich(domain: string): Promise<DomainIntelligence> {
    try {
      const whoisLookup = new Promise<Record<string, unknown>>((resolve) => {
        whois.lookup(domain, {}, (error, data) => {
          if (error || !data) {
            resolve({});
            return;
          }

          const text = String(data);
          const createdLine = text.split('\n').find((line) => /creation date|created on|created:/i.test(line)) ?? '';
          const registrarLine = text.split('\n').find((line) => /^registrar:/i.test(line)) ?? '';
          resolve({
            creationDate: createdLine.split(':').slice(1).join(':').trim(),
            registrar: registrarLine.split(':').slice(1).join(':').trim()
          });
        });
      });

      const [mxRecords, whoisData] = await Promise.all([
        dns.resolveMx(domain).catch(() => []),
        whoisLookup
      ]);

      const createdRaw = String((whoisData as Record<string, unknown>).creationDate ?? (whoisData as Record<string, unknown>).createdDate ?? '');
      const createdDate = createdRaw ? new Date(createdRaw) : null;
      const ageDays = createdDate ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000))) : 0;

      const exchanges = mxRecords.map((mx) => mx.exchange);
      const mailProvider = this.detectMailProvider(exchanges);

      return {
        domain,
        registrar: String((whoisData as Record<string, unknown>).registrar ?? '') || null,
        domainAge: ageDays > 0 ? `${ageDays} days` : 'Unknown',
        domainAgeDays: ageDays,
        createdDate: createdDate ? createdDate.toISOString().slice(0, 10) : null,
        mailProvider,
        isDisposable: disposableDomains.has(domain),
        mxRecords: exchanges
      };
    } catch {
      return {
        domain,
        registrar: null,
        domainAge: 'Unknown',
        domainAgeDays: 0,
        createdDate: null,
        mailProvider: 'Unknown',
        isDisposable: disposableDomains.has(domain),
        mxRecords: []
      };
    }
  }

  private detectMailProvider(mxRecords: string[]): string {
    const joined = mxRecords.join(' ').toLowerCase();
    if (joined.includes('google')) {
      return 'Google Workspace';
    }
    if (joined.includes('outlook') || joined.includes('protection.outlook')) {
      return 'Microsoft 365';
    }
    if (joined.includes('zoho')) {
      return 'Zoho Mail';
    }
    return mxRecords.length > 0 ? 'Custom Provider' : 'Unknown';
  }
}
