import { defineNuxtPlugin } from 'nuxt/app';
import * as z from 'zod';

export const envSchema = z.object({});

export type EnvConfig = z.infer<typeof envSchema>;

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config;

  const rawEnv = {
    API_URL: config.public.API_URL,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');

    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      console.error(`   - ${path}: ${issue.message}`);
    });

    throw new Error('Environment validation failed. Check console for details.');
  }

  return {
    provide: {
      env: result.data,
    },
  };
});
