import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const userId = req.header('x-user-id');
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
