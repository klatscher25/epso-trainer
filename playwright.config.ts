import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/epso-trainer/',
    trace: 'off',
    serviceWorkers: 'allow',
    ...devices['iPhone 15'],
  },
  projects: [{ name: 'iphone-webkit', use: { ...devices['iPhone 15'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/epso-trainer/',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
