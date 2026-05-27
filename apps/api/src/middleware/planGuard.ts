import { Plan } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export const enforceSearchLimit = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    }

    if (user.searchesUsed >= user.searchLimit) {
      throw new AppError('Search limit exceeded', 'PLAN_LIMIT_EXCEEDED', 429);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requirePlan = (plans: Plan[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new AppError('Authentication required', 'AUTH_REQUIRED', 401);
      }

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) {
        throw new AppError('User not found', 'USER_NOT_FOUND', 404);
      }

      if (!plans.includes(user.plan)) {
        throw new AppError('Upgrade required', 'PLAN_UPGRADE_REQUIRED', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
