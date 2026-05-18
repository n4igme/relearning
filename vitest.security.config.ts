import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig(async () => {
  const react = await import('@vitejs/plugin-react')
  const reactPlugin = react.default || react

  return {
    plugins: [reactPlugin()],
    test: {
      environment: 'node',
      globals: true,
      include: ['__tests__/unit/security.test.ts'],
      testTimeout: 10000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  }
})
