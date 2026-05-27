import { Plan } from '@prisma/client';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePlan } from '../middleware/planGuard.js';
import { BulkJobService } from '../services/BulkJobService.js';
import { DeduplicationService } from '../services/DeduplicationService.js';
import { EmailValidator } from '../services/enrichment/EmailValidator.js';
import { AppError } from '../lib/errors.js';

const router = Router();
const bulk = new BulkJobService();
const dedupe = new DeduplicationService();
const validator = new EmailValidator();

router.post('/bulk', requireAuth, requirePlan([Plan.PRO, Plan.ENTERPRISE]), async (req, res, next) => {
  try {
    const emails = Array.isArray(req.body?.emails) ? req.body.emails.map((email: unknown) => String(email)) : [];
    const validEmails = emails.filter((email: string) => validator.validate(email).valid);

    if (validEmails.length === 0) {
      throw new AppError('No valid emails found', 'NO_VALID_EMAILS', 400);
    }

    const deduped = dedupe.deduplicateExact(validEmails);
    const job = await bulk.enqueue(req.userId ?? '', deduped.unique);
    res.status(202).json({
      ...job,
      deduplication: {
        uniqueCount: deduped.unique.length,
        duplicateGroups: deduped.duplicates,
        fuzzyClusters: dedupe.findFuzzySimilar(deduped.unique)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/bulk/:jobId', requireAuth, requirePlan([Plan.PRO, Plan.ENTERPRISE]), async (req, res, next) => {
  try {
    const status = await bulk.getStatus(req.params.jobId);
    if (!status) {
      throw new AppError('Job not found', 'JOB_NOT_FOUND', 404);
    }
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get('/bulk/:jobId/export', requireAuth, requirePlan([Plan.PRO, Plan.ENTERPRISE]), async (req, res, next) => {
  try {
    const status = await bulk.getStatus(req.params.jobId);
    if (!status) {
      throw new AppError('Job not found', 'JOB_NOT_FOUND', 404);
    }
    res.json(status.result);
  } catch (error) {
    next(error);
  }
});

export default router;
