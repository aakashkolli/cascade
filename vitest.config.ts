import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    environmentMatchGlobs: [['tests/components/**', 'happy-dom'], ['tests/hooks/**', 'happy-dom']],
    benchmark: {
      include: ['tests/**/*.bench.ts'],
    },
    globals: false,
  },
});
