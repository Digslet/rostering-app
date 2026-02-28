import { createMiddleware } from '@tanstack/react-start';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../lib/errors';

export const globalErrorHandler = createMiddleware().server(async ({ next }) => {
  try { return await next(); } 
  catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new AppError("This physical space/time overlaps with an existing record.", 'CONFLICT', 409);
      if (error.code === 'P2025') throw new AppError("The target record no longer exists.", 'NOT_FOUND', 404);
    }
    console.error("🚨 CRITICAL BUG:", error); 
    throw new AppError("A system error occurred. IT has been notified.", 'INTERNAL_ERROR', 500);
  }
});