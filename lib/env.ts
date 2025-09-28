import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url("Invalid DATABASE_URL"),
  DIRECT_URL: z.url("Invalid DIRECT_URL").optional(),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url("Invalid BETTER_AUTH_URL"),
  
  // Email
  RESEND_API_KEY: z.string().startsWith("re_", "Invalid Resend API key format"),
  FROM_EMAIL: z.email("Invalid FROM_EMAIL"),
  
  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.url("Invalid NEXT_PUBLIC_APP_URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Optional Admin Setup
  ADMIN_EMAIL: z.email("Invalid ADMIN_EMAIL").optional(),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters").optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
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
