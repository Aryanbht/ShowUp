import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function getDatabaseUrl() {
  let url = process.env.DATABASE_URL || ''
  if (!url) return undefined

  // If using Supabase pooler on direct session port 5432, rewrite to transaction mode port 6543
  // to support hundreds of concurrent serverless lambdas without connection exhaustion.
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace(':5432', ':6543')
  }

  // Ensure PgBouncer flag is present on port 6543
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true'
  }

  // Allow up to 3 parallel connections per lambda to execute Promise.all queries concurrently without serialization
  if (url.includes('connection_limit=1')) {
    url = url.replace('connection_limit=1', 'connection_limit=3')
  } else if (!url.includes('connection_limit')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=3'
  }

  return url
}

const dbUrl = getDatabaseUrl()

const logOptions =
  process.env.DEBUG_PRISMA === 'true'
    ? ['query', 'warn', 'error']
    : process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error']

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: logOptions,
  })

globalForPrisma.prisma = prisma

export default prisma
