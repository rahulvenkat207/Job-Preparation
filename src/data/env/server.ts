import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

export const env = createEnv({
  server: {
    // Support Railway's DATABASE_URL or individual DB variables
    DATABASE_URL: z.string().url().optional(),
    DB_PASSWORD: z.string().min(1).optional(),
    DB_HOST: z.string().min(1).optional(),
    DB_PORT: z.string().min(1).optional(),
    DB_USER: z.string().min(1).optional(),
    DB_NAME: z.string().min(1).optional(),
    ARCJET_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    HUME_API_KEY: z.string().min(1),
    HUME_SECRET_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
  },
  createFinalSchema: env => {
    return z.object(env).superRefine((val, ctx) => {
      // Either DATABASE_URL must be provided, or all individual DB variables
      const hasDatabaseUrl = !!val.DATABASE_URL
      const hasAllDbVars = !!(val.DB_HOST && val.DB_NAME && val.DB_PASSWORD && val.DB_PORT && val.DB_USER)
      
      if (!hasDatabaseUrl && !hasAllDbVars) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either DATABASE_URL or all of (DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER) must be provided",
        })
      }
    }).transform(val => {
      const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, DATABASE_URL, ...rest } = val
      
      // Use DATABASE_URL if provided (Railway), otherwise construct from individual variables
      const finalDatabaseUrl = DATABASE_URL || 
        `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      
      return {
        ...rest,
        DATABASE_URL: finalDatabaseUrl,
      }
    })
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
})
