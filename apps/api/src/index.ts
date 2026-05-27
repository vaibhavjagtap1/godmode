import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './lib/env.js';
import { asAppError } from './lib/errors.js';
import lookupRoutes from './routes/lookup.js';
import searchesRoutes from './routes/searches.js';
import bulkRoutes from './routes/bulk.js';
import keyRoutes from './routes/keys.js';
import profileRoutes from './routes/profile.js';
import webhookRoutes from './routes/webhooks.js';
import { unauthenticatedRateLimit } from './middleware/rateLimit.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));
app.use(unauthenticatedRateLimit);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'behindtheemail-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/docs', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'BehindTheEmail API', version: '1.0.0' },
    paths: {
      '/api/v1/lookup': { post: { summary: 'Run lookup' } },
      '/api/v1/searches': { get: { summary: 'Get searches' } }
    }
  });
});

app.use('/api/v1', lookupRoutes);
app.use('/api/v1', searchesRoutes);
app.use('/api/v1', bulkRoutes);
app.use('/api/v1', keyRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api', webhookRoutes);

app.post('/optout', async (req, res, next) => {
  try {
    const { CacheService } = await import('./services/CacheService.js');
    const { prisma } = await import('./lib/prisma.js');
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!email) {
      throw new Error('Email is required');
    }

    const cacheService = new CacheService();
    await prisma.optOut.upsert({
      where: { emailHash: cacheService.hashEmail(email) },
      create: { emailHash: cacheService.hashEmail(email) },
      update: {}
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const appError = asAppError(error);
  res.status(appError.statusCode).json(appError.toJSON());
});

app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});
