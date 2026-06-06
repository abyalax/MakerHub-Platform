import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

export default defineConfig({
  test: {
    hookTimeout: 60000, // Increase hook timeout for Nuxt setup
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.test.ts'],
          environment: 'nuxt',
          hookTimeout: 60000, // Explicit timeout for Nuxt environment
        },
      }),
    ],
  },
});
