import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig(async () => {
  const react = await import('@vitejs/plugin-react')
  const reactPlugin = react.default || react

  return {
  plugins: [reactPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-utils/setup/vitest.setup.ts'],
    include: [
      '__tests__/unit/**/*.test.ts',
      '__tests__/unit/**/*.test.tsx',
      '__tests__/integration/**/*.test.ts',
      '__tests__/components/**/*.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/actions/**', 'lib/utils.ts', 'middleware.ts'],
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.test.tsx'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  }
})
