import { test, expect } from '@playwright/test';

/**
 * Example E2E Test Suite
 * Demonstrates testing patterns with Playwright
 */
test.describe('Homepage', async () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/');
    // Check if the page has loaded
    await expect(page).toHaveTitle(/Nuxt/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Check if the page still works on mobile
    await expect(page).toHaveTitle(/Nuxt/);
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
  });
});
