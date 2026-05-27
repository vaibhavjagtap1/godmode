import { Plan } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const limitsByPlan: Record<Plan, number> = {
  FREE: 5,
  PLUS: 100,
  PRO: 200,
  ENTERPRISE: 1000000
};

router.post('/webhooks/stripe', async (req, res, next) => {
  try {
    const event = req.body as { type: string; data?: { object?: Record<string, unknown> } };
    const object = event.data?.object ?? {};
    const metadata = (object.metadata ?? {}) as Record<string, unknown>;
    const customerId = String(event.data?.object?.customer ?? '');
    if (!customerId) {
      return res.status(200).json({ received: true });
    }

    const plan = event.type === 'customer.subscription.deleted'
      ? Plan.FREE
      : String(metadata.plan ?? 'FREE').toUpperCase() as Plan;

    await prisma.user.updateMany({
      where: { stripeId: customerId },
      data: {
        plan,
        searchLimit: limitsByPlan[plan] ?? 5
      }
    });

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
