import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

export { AccessLevel, Prisma } from './generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const basePrisma = new PrismaClient({ adapter })

// 2. Define the strict Soft-Delete Guardian with explicit awaits
const softDeleteArgs = {
  async findMany({ args, query }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await query(args)
  },
  
  async findFirst({ args, query }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await query(args)
  },
  
  async count({ args, query }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await query(args)
  },
  
  async findUnique({ args, query, modelName }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await (basePrisma as any)[modelName].findFirst(args)
  },

  async findUniqueOrThrow({ args, query, modelName }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await (basePrisma as any)[modelName].findFirstOrThrow(args)
  },

  async findFirstOrThrow({ args, query }: any) {
    if (args.where?.archivedAt !== undefined) return await query(args)
    args.where = { ...args.where, archivedAt: null }
    return await query(args)
  }
}

// 3. Extend the client (Applying the Guardian ONLY to specific models)
const extendedPrisma = basePrisma.$extends({
  query: {
    organization: softDeleteArgs,
    department: softDeleteArgs,
    ward: softDeleteArgs,
    employee: softDeleteArgs,
    shiftDefinition: softDeleteArgs,
  },
})

// 4. Extract the exact TypeScript type of the fortified client
type FortifiedPrismaClient = typeof extendedPrisma

declare global {
  var __prisma: FortifiedPrismaClient | undefined
}

// 5. Export the secure singleton
export const prisma = globalThis.__prisma || extendedPrisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}