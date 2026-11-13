import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  fullyParallel: true,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 10000 },
  outputDir: '../../test-results/storybook',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:6007',
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tests/storybook/serve.mjs',
    cwd: process.cwd(),
    url: 'http://127.0.0.1:6007/index.json',
    reuseExistingServer: false,
    timeout: 15000,
  },
});
