import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { enforceSearchLimit } from '../middleware/planGuard.js';
import { LookupPipelineService } from '../services/LookupPipelineService.js';
import { AppError } from '../lib/errors.js';

const router = Router();
const service = new LookupPipelineService();

router.post('/lookup', requireAuth, enforceSearchLimit, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!email) {
      throw new AppError('Email is required', 'EMAIL_REQUIRED', 400);
    }

    const result = await service.lookup(req.userId ?? '', email, req.body?.options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
