// Environment validation will happen when this module is imported
// For Next.js, we validate server-side using zod
import { z } from 'zod';

let apiBaseUrl: string | undefined;
let storageBaseUrl: string | undefined;

if (typeof window === 'undefined') {
  // Server-side: validate using zod
  const envSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z
      .string()
      .url('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
      .min(1, 'NEXT_PUBLIC_API_BASE_URL is required'),
    NEXT_PUBLIC_STORAGE_BASE_URL: z
      .string()
      .url('NEXT_PUBLIC_STORAGE_BASE_URL must be a valid URL')
      .optional(),
  });

  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_STORAGE_BASE_URL: process.env.NEXT_PUBLIC_STORAGE_BASE_URL,
    });

    apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL;
    storageBaseUrl = env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://localhost:5001';
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const errorMessages = error.errors
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      console.error('❌ Environment validation failed:\n', errorMessages);
      process.exit(1);
    }
    throw error;
  }
} else {
  // Client-side: use process.env directly
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://localhost:5001';
}

export { apiBaseUrl, storageBaseUrl };
