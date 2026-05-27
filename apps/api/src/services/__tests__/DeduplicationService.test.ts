import { describe, expect, it } from 'vitest';
import { DeduplicationService } from '../DeduplicationService.js';

describe('DeduplicationService', () => {
  it('deduplicates exact emails and detects duplicates', () => {
    const service = new DeduplicationService();
    const result = service.deduplicateExact(['a@example.com', 'A@example.com', 'b@example.com']);

    expect(result.unique).toEqual(['a@example.com', 'b@example.com']);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]?.canonical).toBe('a@example.com');
    expect(result.duplicates[0]?.occurrenceCount).toBe(2);
  });

  it('finds fuzzy similar emails with Levenshtein distance <= 2', () => {
    const service = new DeduplicationService();
    const clusters = service.findFuzzySimilar(['john@corp.com', 'j0hn@corp.com', 'alice@corp.com']);

    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0]?.representative).toBe('john@corp.com');
    expect(clusters[0]?.similar).toContain('j0hn@corp.com');
  });
});
