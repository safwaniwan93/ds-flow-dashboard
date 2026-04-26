import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Provide a dummy fallback so UI pages don't crash without a real DB during preview
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@db.local:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
