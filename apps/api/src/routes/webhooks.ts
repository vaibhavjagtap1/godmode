import { Plan } from '@prisma/client';
import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

const router = Router();

const limitsByPlan: Record<Plan, number> = {
  FREE: 5,
  PLUS: 100,
  PRO: 200,
  ENTERPRISE: 1000000
};

router.post('/webhooks/stripe', async (req, res, next) => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.header('stripe-signature');
    if (!secret || !signature || !req.rawBody) {
      throw new AppError('Invalid webhook configuration', 'WEBHOOK_CONFIGURATION_ERROR', 400);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
    const object = (event.data.object ?? {}) as unknown as Record<string, unknown>;
    const metadata = (object.metadata ?? {}) as Record<string, unknown>;
    const customerId = String(object.customer ?? '');
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
