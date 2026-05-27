import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/usage', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId ?? '' } });
    res.json({
      searchesUsed: user?.searchesUsed ?? 0,
      searchLimit: user?.searchLimit ?? 0,
      plan: user?.plan ?? 'FREE'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile/export/:id', requireAuth, async (req, res, next) => {
  try {
    const search = await prisma.search.findFirst({ where: { id: req.params.id, userId: req.userId } });
    res.json(search?.resultJson ?? {});
  } catch (error) {
    next(error);
  }
});

export default router;
