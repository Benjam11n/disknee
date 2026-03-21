import { PrismaClient } from '@prisma/client';
import { env } from '../env';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
// This is a basic client without middleware for client-side compatibility

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaDatasourceUrl() {
  const databaseUrl = new URL(env.DATABASE_URL);
  const isSupabasePooler =
    databaseUrl.hostname.includes('.pooler.supabase.com') || databaseUrl.port === '6543';

  if (isSupabasePooler) {
    databaseUrl.searchParams.set('pgbouncer', 'true');
    databaseUrl.searchParams.set('connection_limit', '1');
  }

  return databaseUrl.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getPrismaDatasourceUrl(),
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
