import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { ContactLeakService } from './enrichment/ContactLeakService.js';
import { DomainService } from './enrichment/DomainService.js';
import { EmailValidator } from './enrichment/EmailValidator.js';
import { GitHubService } from './enrichment/GitHubService.js';
import { GoogleFootprintService } from './enrichment/GoogleFootprintService.js';
import { HIBPService } from './enrichment/HIBPService.js';
import { HoleheService } from './enrichment/HoleheService.js';
import { LinkedInService } from './enrichment/LinkedInService.js';
import { PasteService } from './enrichment/PasteService.js';
import { CacheService } from './CacheService.js';
import { DeduplicationService } from './DeduplicationService.js';
import { RiskScoreService } from './RiskScoreService.js';
import { LookupOptions } from '../lib/types.js';

const defaultOptions: LookupOptions = {
  includePastes: true,
  includeContactLeaks: true,
  includeDuplicateCheck: true,
  includeGoogleFootprint: true
};

export class LookupPipelineService {
  private validator = new EmailValidator();
  private domainService = new DomainService();
  private linkedinService = new LinkedInService();
  private holeheService = new HoleheService();
  private githubService = new GitHubService();
  private hibpService = new HIBPService();
  private pasteService = new PasteService();
  private contactLeakService = new ContactLeakService();
  private googleFootprintService = new GoogleFootprintService();
  private dedupeService = new DeduplicationService();
  private riskService = new RiskScoreService();
  private cacheService = new CacheService();

  async lookup(userId: string, email: string, optionsInput?: Partial<LookupOptions>) {
    const startedAt = Date.now();
    const options = { ...defaultOptions, ...optionsInput };

    const parsed = this.validator.validate(email);
    if (!parsed.valid) {
      throw new AppError('Invalid email format', 'INVALID_EMAIL', 400);
    }

    const optOut = await prisma.optOut.findUnique({ where: { emailHash: this.cacheService.hashEmail(email) } });
    if (optOut) {
      throw new AppError('Email is opted out', 'EMAIL_OPTED_OUT', 403);
    }

    const cached = await this.cacheService.get(email);
    if (cached) {
      return cached;
    }

    const settled = await Promise.allSettled([
      this.domainService.enrich(parsed.domain),
      this.linkedinService.enrich(email),
      this.holeheService.search(email),
      this.githubService.enrich(email),
      this.hibpService.breaches(email),
      options.includePastes ? this.hibpService.pastes(email) : Promise.resolve([]),
      options.includePastes ? this.pasteService.searchByGoogleCse(email) : Promise.resolve([]),
      options.includeGoogleFootprint ? this.googleFootprintService.gravatar(email) : Promise.resolve(null)
    ]);

    const [domainRes, linkedinRes, socialRes, githubRes, breachesRes, hibpPastesRes, csePastesRes, googleRes] = settled;

    const socialAccounts = socialRes.status === 'fulfilled' ? socialRes.value : [];
    const sensitiveAccount = socialAccounts.some((account) => account.sensitive);
    const breaches = breachesRes.status === 'fulfilled' ? breachesRes.value : [];
    const pastes = [...(hibpPastesRes.status === 'fulfilled' ? hibpPastesRes.value : []), ...(csePastesRes.status === 'fulfilled' ? csePastesRes.value : [])];

    const nameConsistency = githubRes.status === 'fulfilled' && linkedinRes.status === 'fulfilled' && githubRes.value?.name && linkedinRes.value?.full_name && githubRes.value.name !== linkedinRes.value.full_name ? 'LOW' : 'HIGH';
    const identityName =
      linkedinRes.status === 'fulfilled'
        ? String(linkedinRes.value?.full_name ?? '') || (githubRes.status === 'fulfilled' ? githubRes.value?.name ?? null : null)
        : githubRes.status === 'fulfilled'
          ? githubRes.value?.name ?? null
          : null;

    const dedupe = options.includeDuplicateCheck
      ? this.dedupeService.crossProfileDedup([
          {
            email,
            fullName: (linkedinRes.status === 'fulfilled' ? String(linkedinRes.value?.full_name ?? '') : '') || undefined,
            githubName: githubRes.status === 'fulfilled' ? githubRes.value?.name ?? undefined : undefined
          }
        ])
      : { suspectedDuplicate: false, clusters: [] };

    const riskScore = this.riskService.compute({
      breachCount: breaches.length,
      pasteFound: pastes.length > 0,
      isDisposable: domainRes.status === 'fulfilled' ? domainRes.value.isDisposable : false,
      suspectedDuplicate: dedupe.suspectedDuplicate,
      domainAgeDays: domainRes.status === 'fulfilled' ? domainRes.value.domainAgeDays : 0,
      contactLeaked: false,
      nameConsistency,
      sensitiveAccount
    });

    const result = {
      meta: {
        email,
        domain: parsed.domain,
        lookupId: `lkp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
        durationMs: Date.now() - startedAt,
        cachedResult: false,
        generatedAt: new Date().toISOString()
      },
      identity: {
        fullName: identityName,
        confidence: 'MEDIUM',
        identityFlags: {
          nameConsistency,
          suspectedDuplicate: dedupe.suspectedDuplicate,
          anomalies: dedupe.suspectedDuplicate ? ['Potential duplicate profile patterns found'] : []
        }
      },
      professional: linkedinRes.status === 'fulfilled' ? linkedinRes.value : null,
      domain: domainRes.status === 'fulfilled' ? domainRes.value : null,
      socialAccounts,
      github: githubRes.status === 'fulfilled' ? githubRes.value : null,
      breaches: {
        total: breaches.length,
        items: breaches
      },
      pastes: {
        found: pastes.length > 0,
        total: pastes.length,
        items: pastes.map((paste) => ({
          ...paste,
          snippet: this.contactLeakService.sanitizeSnippet(String((paste as Record<string, unknown>).snippet ?? ''))
        }))
      },
      contactLeaks: {
        found: false,
        items: []
      },
      googleFootprint: googleRes.status === 'fulfilled' ? googleRes.value : null,
      riskScore
    };

    await Promise.all([
      this.cacheService.set(email, result),
      prisma.user.update({ where: { id: userId }, data: { searchesUsed: { increment: 1 } } }),
      prisma.search.create({
        data: {
          userId,
          email,
          resultJson: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue,
          riskScore: riskScore.score,
          riskLevel: riskScore.level,
          breachCount: breaches.length,
          cached: false
        }
      })
    ]);

    return result;
  }
}
