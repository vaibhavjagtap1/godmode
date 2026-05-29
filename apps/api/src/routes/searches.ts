import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

const router = Router();

router.get('/searches', requireAuth, async (req, res, next) => {
  try {
    const searches = await prisma.search.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(searches);
  } catch (error) {
    next(error);
  }
});

router.get('/searches/:id', requireAuth, async (req, res, next) => {
  try {
    const search = await prisma.search.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!search) {
      throw new AppError('Search not found', 'SEARCH_NOT_FOUND', 404);
    }
    res.json(search);
  } catch (error) {
    next(error);
  }
});

router.delete('/searches/:id', requireAuth, async (req, res, next) => {
  try {
    await prisma.search.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
