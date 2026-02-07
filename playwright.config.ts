import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  timeout: 30000,

  use: {
    baseURL: 'http://app.localhost.adapt:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'web-chromium',
      testDir: './e2e/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://app.localhost.adapt:3000',
      },
    },
    {
      name: 'admin-chromium',
      testDir: './e2e/admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://admin.localhost.adapt:3001',
      },
    },
    {
      name: 'web-mobile',
      testDir: './e2e/web',
      use: {
        ...devices['iPhone 14'],
        baseURL: 'http://app.localhost.adapt:3000',
      },
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter @adapt/api dev',
      port: 4000,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'pnpm --filter @adapt/web dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'pnpm --filter @adapt/admin dev',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
