import { config } from 'dotenv';
import { z } from 'zod';

config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  HIBP_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  DEHASHED_API_KEY: z.string().optional(),
  GOOGLE_CSE_API_KEY: z.string().optional(),
  GOOGLE_CSE_ID: z.string().optional()
});

export const env = schema.parse(process.env);
