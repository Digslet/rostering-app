// src/db.ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ManagerLevel, Prisma, PrismaClient } from './generated/prisma/client';

// Re-export types for the rest of the application
export { ManagerLevel, Prisma };

// 1. Correctly initialize the PG Pool required by the Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

// 2. Prevent multiple instances during hot-reloading in development
declare global {
  var __prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const globalPrisma = globalThis.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = globalPrisma;
}

// 3. The Soft-Delete Guardian (TypeScript Safe)
export const withSoftDeletes = Prisma.defineExtension({
  name: 'soft-deletes',
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const safeArgs = args as any; // Bypass TS union narrowing limitation
        
        if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
          safeArgs.where = { ...(safeArgs.where || {}), archivedAt: null };
        }
        return query(safeArgs);
      }
    }
  }
});

// Cache tenant models to avoid crashing on global models like 'User'
const tenantModels = new Set([
  'Department', 
  'Location', 
  'Employee', 
  'EmployeeLocationAffiliation', 
  'ManagementRole', 
  'EmployeeRole', 
  'ShiftDefinition', 
  'StaffingRequirement', 
  'LeaveCategory', 
  'RosterPattern', 
  'PatternItem', 
  'AssignedPattern', 
  'ShiftInstance', 
  'LeaveRequest', 
  'ShiftAdvertisement', 
  'ShiftClaim', 
  'EmployeeAvailability'
]);

// 4. The Multi-Tenant Injector (TypeScript Safe)
export const withTenant = (organizationId: string) => Prisma.defineExtension({
  name: 'tenant-enforcer',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!tenantModels.has(model)) return query(args);
        
        const safeArgs = args as any;

        if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(operation)) {
          safeArgs.where = { ...(safeArgs.where || {}), organizationId };
        }
        
        if (['create', 'update', 'upsert'].includes(operation) && safeArgs.data) {
          safeArgs.data.organizationId = organizationId;
        }
        
        return query(safeArgs);
      }
    }
  }
});

// 5. The Automated Audit Logger
export const withAuditLog = (clerkUserId: string, organizationId: string) => Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'automated-audit-log',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);
          
          const isMutation = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'].includes(operation);
          if (!isMutation) return query(args);

          const result = await query(args);
          
          try {
            await globalPrisma.auditLog.create({
              data: {
                organizationId,
                actorId: clerkUserId, 
                action: `${model}.${operation}`,
                targetId: (result as any)?.id || 'bulk_operation', 
                details: JSON.parse(JSON.stringify(args)) 
              }
            });
          } catch (e) { 
            console.error(`Audit Failed: ${model}.${operation}`, e); 
          }
          
          return result;
        }
      }
    }
  });
});