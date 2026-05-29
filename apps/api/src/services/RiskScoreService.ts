import { RiskFactor } from '../lib/types.js';

interface RiskInput {
  breachCount: number;
  pasteFound: boolean;
  isDisposable: boolean;
  suspectedDuplicate: boolean;
  domainAgeDays: number;
  contactLeaked: boolean;
  nameConsistency: 'HIGH' | 'MEDIUM' | 'LOW';
  sensitiveAccount: boolean;
}

export class RiskScoreService {
  compute(input: RiskInput): { score: number; level: string; breakdown: RiskFactor[] } {
    const breakdown: RiskFactor[] = [];
    const breachPoints = Math.min(input.breachCount * 8, 40);
    breakdown.push({ factor: 'Data breaches', points: breachPoints, detail: `${input.breachCount} breaches found` });

    const pastePoints = input.pasteFound ? 20 : 0;
    breakdown.push({ factor: 'Paste exposure', points: pastePoints, detail: input.pasteFound ? 'Public paste mentions found' : 'No paste exposure' });

    const disposablePoints = input.isDisposable ? 15 : 0;
    breakdown.push({ factor: 'Disposable email', points: disposablePoints, detail: input.isDisposable ? 'Disposable domain detected' : 'Non-disposable domain' });

    const duplicatePoints = input.suspectedDuplicate ? 15 : 0;
    breakdown.push({ factor: 'Duplicate identity', points: duplicatePoints, detail: input.suspectedDuplicate ? 'Duplicate signals detected' : 'No duplicate signals' });

    const domainAgePoints = input.domainAgeDays < 180 ? 10 : 0;
    breakdown.push({ factor: 'Domain age', points: domainAgePoints, detail: input.domainAgeDays < 180 ? 'Domain is newer than 180 days' : 'Domain older than 180 days' });

    const contactLeakPoints = input.contactLeaked ? 10 : 0;
    breakdown.push({ factor: 'Contact leak', points: contactLeakPoints, detail: input.contactLeaked ? 'Leaked contact data found' : 'No contact leak data found' });

    const consistencyPoints = input.nameConsistency === 'LOW' ? 10 : 0;
    breakdown.push({ factor: 'Name consistency', points: consistencyPoints, detail: `Consistency level ${input.nameConsistency}` });

    const sensitivePoints = input.sensitiveAccount ? 5 : 0;
    breakdown.push({ factor: 'Sensitive accounts', points: sensitivePoints, detail: input.sensitiveAccount ? 'Sensitive platform account detected' : 'No sensitive accounts found' });

    const score = Math.min(100, breakdown.reduce((total, item) => total + item.points, 0));
    const level = score <= 20 ? 'LOW' : score <= 50 ? 'MEDIUM' : score <= 75 ? 'HIGH' : 'CRITICAL';

    return { score, level, breakdown };
  }
}
