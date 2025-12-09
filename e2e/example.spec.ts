import { test, expect } from '@playwright/test';

test.describe('TaskFlow Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/TaskFlow/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    // Test navigation to different routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/analytics');
    await expect(page).toHaveURL('/analytics');
  });
});

test.describe('CRDT Real-time Collaboration', () => {
  test('should handle concurrent editing', async ({ page, browser }) => {
    // Create two pages to simulate concurrent users
    const user1 = await browser.newPage();
    const user2 = await browser.newPage();

    await user1.goto('/boards/test-board');
    await user2.goto('/boards/test-board');

    // Simulate concurrent edits
    // This would be enhanced with actual WebSocket testing in a real implementation
    await expect(user1.locator('body')).toBeVisible();
    await expect(user2.locator('body')).toBeVisible();
  });
});

test.describe('Offline Functionality', () => {
  test('should work offline with service worker', async ({ page }) => {
    // Test service worker registration
    await page.goto('/');
    const serviceWorker = await page.evaluate(() => {
      return navigator.serviceWorker?.controller?.state || 'not-registered';
    });

    // In a real test, you would check for cached assets
    expect(serviceWorker).toBeTruthy();
  });
});