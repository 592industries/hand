import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Domain/unit tests do not connect to DeepSpace. This isolated config lets them
// run before registration without weakening the official vitest.config.ts,
// which still requires the real server-minted app id for platform tests.
export default defineConfig({
  define: { __DEEPSPACE_APP_ID__: JSON.stringify('unit-test-only') },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
  },
})

