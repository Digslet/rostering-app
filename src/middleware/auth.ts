// src/middleware/auth.ts
import { createMiddleware } from '@tanstack/react-start';
import { auth } from '@clerk/tanstack-react-start/server'; // Changed from getAuth
import { globalPrisma,withAuditLog, withSoftDeletes, withTenant } from '../db';
import { AppError } from '../lib/errors';
import { globalErrorHandler } from '../middleware/errorhandler';

export const requireTenantAuth = createMiddleware()
  .middleware([globalErrorHandler])
  .server(async ({ next }) => {
    
    // TanStack Start specific auth call (no request object needed)
    const session = await auth(); 

    if (!session.userId) {
      throw new AppError('Unauthorized.', 'UNAUTHORIZED', 401);
    }
    
    if (!session.orgId) {
      throw new AppError('Select an active workspace.', 'FORBIDDEN', 403);
    }

    // Generate the highly secure, request-scoped client
    const secureDb = globalPrisma
      .$extends(withSoftDeletes)
      .$extends(withTenant(session.orgId))
      .$extends(withAuditLog(session.userId, session.orgId)); 

    return next({ 
      context: { 
        userId: session.userId, 
        orgId: session.orgId, 
        db: secureDb,
        clerkMetadata: session.sessionClaims.org_metadata || {}
      } 
    });
  });