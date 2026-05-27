import levenshtein from 'fast-levenshtein';

export interface DuplicateGroup {
  canonical: string;
  duplicates: string[];
  occurrenceCount: number;
}

export interface SimilarityCluster {
  representative: string;
  similar: string[];
  editDistances: number[];
  suspicionScore: number;
}

interface Profile {
  email: string;
  fullName?: string;
  githubName?: string;
  linkedinName?: string;
}

export class DeduplicationService {
  deduplicateExact(emails: string[]): { unique: string[]; duplicates: DuplicateGroup[] } {
    const normalized = emails.map((email) => email.trim().toLowerCase()).filter(Boolean);
    const map = new Map<string, number>();

    for (const email of normalized) {
      map.set(email, (map.get(email) ?? 0) + 1);
    }

    const unique = Array.from(map.keys());
    const duplicates: DuplicateGroup[] = unique
      .filter((email) => (map.get(email) ?? 0) > 1)
      .map((email) => ({
        canonical: email,
        duplicates: Array.from({ length: (map.get(email) ?? 0) - 1 }, () => email),
        occurrenceCount: map.get(email) ?? 1
      }));

    return { unique, duplicates };
  }

  findFuzzySimilar(emails: string[]): SimilarityCluster[] {
    const normalized = emails.map((email) => email.trim().toLowerCase()).filter(Boolean);
    const clusters: SimilarityCluster[] = [];
    const seen = new Set<string>();

    for (const candidate of normalized) {
      if (seen.has(candidate)) {
        continue;
      }

      const similar: string[] = [];
      const editDistances: number[] = [];

      for (const other of normalized) {
        if (candidate === other) {
          continue;
        }

        const distance = levenshtein.get(candidate, other);
        if (distance <= 2) {
          similar.push(other);
          editDistances.push(distance);
          seen.add(other);
        }
      }

      if (similar.length > 0) {
        clusters.push({
          representative: candidate,
          similar,
          editDistances,
          suspicionScore: Math.min(100, similar.length * 20 + editDistances.reduce((a, b) => a + (3 - b) * 10, 0))
        });
      }

      seen.add(candidate);
    }

    return clusters;
  }

  crossProfileDedup(profiles: Profile[]) {
    const personClusters = this.detectSamePersonMultipleEmails(profiles);
    return {
      suspectedDuplicate: personClusters.length > 0,
      clusters: personClusters
    };
  }

  detectSamePersonMultipleEmails(profiles: Profile[]) {
    const byName = new Map<string, string[]>();

    for (const profile of profiles) {
      const name = (profile.fullName ?? profile.githubName ?? profile.linkedinName ?? '').trim().toLowerCase();
      if (!name) {
        continue;
      }

      const current = byName.get(name) ?? [];
      current.push(profile.email.toLowerCase());
      byName.set(name, current);
    }

    return Array.from(byName.entries())
      .filter(([, emails]) => new Set(emails).size > 1)
      .map(([name, emails]) => ({
        person: name,
        emails: Array.from(new Set(emails))
      }));
  }
}
