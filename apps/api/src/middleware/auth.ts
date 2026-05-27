import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorization = req.header('authorization');
    let userId = '';

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length);
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        throw new AppError('Auth secret missing', 'AUTH_CONFIGURATION_ERROR', 500);
      }

      const payload = jwt.verify(token, secret) as { sub?: string };
      userId = payload.sub ?? '';
    }

    if (!userId) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    }

    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
};
