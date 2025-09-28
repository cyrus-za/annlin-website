import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { env } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  neonPool: Pool | undefined
}

// Create Neon connection pool
const neonPool = globalForPrisma.neonPool ?? new Pool({ 
  connectionString: env.server.DATABASE_URL 
})

if (env.NODE_ENV !== 'production') globalForPrisma.neonPool = neonPool

// Create Prisma adapter for Neon
const adapter = new PrismaNeon(neonPool as any)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    transactionOptions: {
      timeout: 10000, // 10 seconds
      maxWait: 5000,  // 5 seconds
    },
  })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Custom error types for better error handling
export class DatabaseConnectionError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = 'DatabaseConnectionError'
  }
}

export class DatabaseOperationError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = 'DatabaseOperationError'
  }
}

export class DatabaseTimeoutError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = 'DatabaseTimeoutError'
  }
}

// Retry configuration
interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Exponential backoff with jitter
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  const jitter = Math.random() * 0.1 * exponentialDelay
  return exponentialDelay + jitter
}

// Generic retry function with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  operationName: string = 'Database operation'
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === options.maxRetries) {
        break
      }
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw new DatabaseOperationError(
          `${operationName} failed with non-retryable error`,
          error
        )
      }
      
      const delay = calculateDelay(attempt, options.baseDelay, options.maxDelay)
      console.warn(`${operationName} failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms...`, error)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new DatabaseOperationError(
    `${operationName} failed after ${options.maxRetries + 1} attempts`,
    lastError
  )
}

// Check if an error is retryable
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const errorMessage = error.toString().toLowerCase()
  
  // Network and connection errors that are typically retryable
  const retryablePatterns = [
    'connection',
    'timeout',
    'network',
    'econnreset',
    'enotfound',
    'econnrefused',
    'etimedout',
    'socket',
    'pool',
    'server closed the connection',
    'connection terminated',
  ]
  
  return retryablePatterns.some(pattern => errorMessage.includes(pattern))
}

// Enhanced database connection check with retry logic
export async function checkDatabaseConnection(retryOptions?: Partial<RetryOptions>): Promise<boolean> {
  try {
    await withRetry(
      async () => {
        await prisma.$connect()
        // Test with a simple query
        await prisma.$queryRaw`SELECT 1 as test`
      },
      { ...DEFAULT_RETRY_OPTIONS, ...retryOptions },
      'Database connection check'
    )
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Database health check with detailed information
export async function getDatabaseHealth(): Promise<{
  isConnected: boolean
  latency?: number
  error?: string
  poolInfo?: {
    idle: number
    total: number
    waiting: number
  }
}> {
  const startTime = Date.now()
  
  try {
    await prisma.$connect()
    
    // Test query to measure latency
    await prisma.$queryRaw`SELECT 1 as health_check`
    
    const latency = Date.now() - startTime
    
    // Get Neon pool information
    const poolInfo = {
      idle: neonPool.idleCount,
      total: neonPool.totalCount,
      waiting: neonPool.waitingCount,
    }
    
    return {
      isConnected: true,
      latency,
      poolInfo,
    }
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Safe database operation wrapper with error handling
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database operation',
  retryOptions?: Partial<RetryOptions>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await withRetry(
      operation,
      { ...DEFAULT_RETRY_OPTIONS, ...retryOptions },
      operationName
    )
    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`${operationName} failed:`, error)
    return { success: false, error: errorMessage }
  }
}

// Transaction wrapper with retry logic
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  retryOptions?: Partial<RetryOptions>
): Promise<T> {
  return withRetry(
    () => prisma.$transaction(operation),
    { ...DEFAULT_RETRY_OPTIONS, ...retryOptions },
    'Database transaction'
  )
}

// Helper function to disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    // Also end the Neon pool connections
    await neonPool.end()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
    throw new DatabaseConnectionError('Failed to disconnect from database', error)
  }
}

// Graceful shutdown handler
export async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Initiating graceful database shutdown...')
  
  try {
    // Wait for ongoing operations to complete (with timeout)
    await Promise.race([
      new Promise(resolve => setTimeout(resolve, 5000)), // 5 second timeout
      disconnectDatabase(),
    ])
    
    console.log('✅ Database shutdown completed')
  } catch (error) {
    console.error('❌ Error during database shutdown:', error)
    throw error
  }
}

// Database migration status check
export async function checkMigrationStatus(): Promise<{
  isUpToDate: boolean
  pendingMigrations?: string[]
  error?: string
}> {
  try {
    // Check if _prisma_migrations table exists and get migration status
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      WHERE finished_at IS NULL
    `
    
    const pendingMigrations = migrations.map((m: { migration_name: string }) => m.migration_name)
    
    return {
      isUpToDate: pendingMigrations.length === 0,
      pendingMigrations: pendingMigrations.length > 0 ? pendingMigrations : undefined,
    }
  } catch (error) {
    // If _prisma_migrations table doesn't exist, migrations haven't been run
    if (error instanceof Error && error.message.includes('_prisma_migrations')) {
      return {
        isUpToDate: false,
        error: 'Database not initialized - run migrations first',
      }
    }
    
    return {
      isUpToDate: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Export types for use in other files (will be available after database initialization)
// export type { 
//   User,
//   UserRole,
//   Account,
//   Session,
//   VerificationToken,
//   UserInvitation,
//   UserInvitationStatus,
//   ServiceGroup,
//   Event,
//   EventCategory,
//   RecurringPattern,
//   Article,
//   ArticleCategory,
//   ArticleStatus,
//   ReadingMaterial,
//   ReadingMaterialCategory,
//   ReadingMaterialFileType,
//   ContactSubmission,
//   ContactSubmissionType,
//   ContactSubmissionStatus,
//   AuditLog
// } from '@prisma/client'
