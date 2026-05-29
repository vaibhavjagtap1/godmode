import crypto from 'node:crypto';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/keys', requireAuth, async (req, res, next) => {
  try {
    const key = `bte_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const record = await prisma.apiKey.create({
      data: {
        userId: req.userId ?? '',
        keyHash,
        name: String(req.body?.name ?? 'Default key')
      }
    });

    res.status(201).json({
      id: record.id,
      key,
      name: record.name,
      createdAt: record.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/keys', requireAuth, async (req, res, next) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        name: true,
        requests: true,
        lastUsed: true,
        createdAt: true
      }
    });
    res.json(keys);
  } catch (error) {
    next(error);
  }
});

router.delete('/keys/:id', requireAuth, async (req, res, next) => {
  try {
    await prisma.apiKey.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
