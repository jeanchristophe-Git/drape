import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vérifier que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔌 Initializing Prisma Client...');
console.log('📊 Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

console.log('✅ Prisma Client initialized successfully');
