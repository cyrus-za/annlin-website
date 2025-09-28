import { PrismaClient } from '@prisma/client'
import { env } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: env.DATABASE_URL,
  })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Helper function to disconnect from database
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Export types for use in other files
export type { 
  User,
  UserRole,
  ServiceGroup,
  Event,
  EventCategory,
  RecurringPattern,
  Article,
  ArticleCategory,
  ArticleStatus,
  ReadingMaterial,
  ReadingMaterialCategory,
  ReadingMaterialFileType,
  ContactSubmission,
  ContactSubmissionType,
  ContactSubmissionStatus,
  AuditLog
} from '@prisma/client'
