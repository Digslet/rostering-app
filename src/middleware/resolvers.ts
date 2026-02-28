import { createMiddleware } from '@tanstack/react-start';
import { AppError } from '../lib/errors';
import { requireTenantAuth } from './auth';

export const requireLocationWrite = createMiddleware()
  .middleware([requireTenantAuth])
  .server(async ({ next, context }) => {
    const metadata: any = context.clerkMetadata;
    const explicitlyManagedLocs = metadata?.manage?.locations || [];
    const managedDepts = metadata?.manage?.departments || [];

    const verifyLocationWriteAccess = async (targetLocationId: string) => {
      if (explicitlyManagedLocs.includes(targetLocationId)) return true;
      if (managedDepts.length > 0) {
        const isValid = await context.db.location.findFirst({
          where: { id: targetLocationId, departmentId: { in: managedDepts } },
          select: { id: true }
        });
        if (isValid) return true;
      }
      throw new AppError('You lack permission to modify this ward.', 'FORBIDDEN', 403);
    };

    return next({ context: { ...context, verifyLocationWriteAccess } });
  });