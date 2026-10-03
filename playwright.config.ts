import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The demo API runs on a free host that occasionally drops a request.
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
