import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(8, "BETTER_AUTH_SECRET must be at least 8 characters"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
  
  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  FROM_EMAIL: z.string().min(1, "FROM_EMAIL is required"),
  
  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().min(1, "NEXT_PUBLIC_APP_URL is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Optional Admin Setup
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Validate environment variables on import
export const env = validateEnv()

// Helper function to check if we're in development
export const isDev = env.NODE_ENV === "development"
export const isProd = env.NODE_ENV === "production"
export const isTest = env.NODE_ENV === "test"
