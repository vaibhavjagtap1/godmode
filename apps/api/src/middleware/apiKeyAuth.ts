import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export const apiKeyAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const key = req.header('x-api-key');
    if (!key) {
      throw new AppError('Missing API key', 'API_KEY_REQUIRED', 401);
    }

    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true }
    });

    if (!apiKey) {
      throw new AppError('Invalid API key', 'API_KEY_INVALID', 401);
    }

    req.userId = apiKey.userId;

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        requests: { increment: 1 },
        lastUsed: new Date()
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};
