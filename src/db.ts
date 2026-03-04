// src/db.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { ManagerLevel, Prisma, PrismaClient } from './generated/prisma/client';

export { ManagerLevel, Prisma };


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});


const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var __prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const globalPrisma = globalThis.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = globalPrisma;
}

// 2. The Soft-Delete Guardian 
export const withSoftDeletes = Prisma.defineExtension({
  name: 'soft-deletes',
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const safeArgs = (args) as Record<string, any>;
        
        if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
          safeArgs.where = { ...safeArgs.where, archivedAt: null };
        }
        return query(safeArgs as any);
      }
    }
  }
});

const tenantModels = new Set([
  'Department', 'Location', 'Employee', 'EmployeeLocationAffiliation', 
  'ManagementRole', 'EmployeeRole', 'ShiftDefinition', 'StaffingRequirement', 
  'LeaveCategory', 'RosterPattern', 'PatternItem', 'AssignedPattern', 
  'ShiftInstance', 'LeaveRequest', 'ShiftAdvertisement', 'ShiftClaim', 
  'EmployeeAvailability'
]);

// 3. The Multi-Tenant Injector (HARDENED)
export const withTenant = (organizationId: string) => Prisma.defineExtension({
  name: 'tenant-enforcer',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!tenantModels.has(model)) return query(args);
        
        const safeArgs = (args) as Record<string, any>;

        // Scope all READS and targeted MASS-MUTATIONS to the tenant
        if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(operation)) {
          safeArgs.where = { ...safeArgs.where, organizationId };
        }
        
        // Scope standard INSERTS/UPDATES
        if (['create', 'update'].includes(operation) && safeArgs.data) {
          safeArgs.data.organizationId = organizationId;
        }

        // Scope UPSERTS (Safe from undefined payloads)
        if (operation === 'upsert') {
          if (safeArgs.create) safeArgs.create.organizationId = organizationId;
          if (safeArgs.update) safeArgs.update.organizationId = organizationId;
        }

        // Scope BULK INSERTS (Array iteration safety)
        if (operation === 'createMany' && Array.isArray(safeArgs.data)) {
          safeArgs.data = safeArgs.data.map((item: any) => ({
            ...item,
            organizationId
          }));
        }
        
        return query(safeArgs as any);
      }
    }
  }
});

// 4. The Automated Audit Logger (HARDENED)
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
                // Safe JSON serialization fallback
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