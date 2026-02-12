import { z } from 'zod'

// 1. SAFE STRINGS (Prevent XSS)
// We allow letters, numbers, punctuation, but block potential script tags like < >
export const safeString = z.string()
  .trim()
  .min(1, "Required")
  .max(500, "Too long (max 500 chars)")
  .regex(/^[^<>]*$/, "Invalid characters detected (< or >)") 

// 2. UUIDs (Prevent ID Injection)
// Must be a valid UUID v4. Blocks "1 OR 1=1" SQL attacks.
export const idSchema = z.string()
  .uuid("Invalid ID format")

// 3. DATES (Prevent Time Travel)
// Must be a valid ISO string. We can add "future only" constraints later.
export const dateSchema = z.string()
  .datetime({ offset: true }) // Must be ISO 8601 (2024-01-01T00:00:00Z)
  .transform(str => new Date(str)) // Auto-convert to Date object

// 4. COLOR CODES (For Settings)
export const hexColorSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Color")