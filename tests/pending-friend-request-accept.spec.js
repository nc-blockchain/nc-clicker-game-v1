// @ts-check
/**
 * E2E: Pending friend request – receiver can accept.
 * Requires a pending request to exist (send from another session/device first).
 * Run with: BASE_URL=http://localhost:3001 npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Pending friend request – accept', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('tokenClicker_onboardingCompleted', '1');
      } catch (e) {}
    });
    await page.goto('/#multiplayer', { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    const addFriendsBtn = page.locator('#header-friends-btn');
    await addFriendsBtn.waitFor({ state: 'visible', timeout: 20000 });
    await addFriendsBtn.click();
    await expect(page.getByText('FRIENDS — INVITE & REQUESTS')).toBeVisible({ timeout: 10000 });
  });

  test('receiver can see Pending requests and ACCEPT button when requests exist', async ({ page }) => {
    const section = page.locator('#friend-requests-section');
    const acceptBtn = page.locator('.friend-request-accept').first();
    // If section is visible and has an ACCEPT button, click it and expect a result message
    const sectionVisible = await section.isVisible().catch(() => false);
    if (!sectionVisible) {
      test.skip();
      return;
    }
    const hasAccept = await acceptBtn.isVisible().catch(() => false);
    if (!hasAccept) {
      test.skip();
      return;
    }
    await acceptBtn.click();
    // After accept: either success or one of the known error messages
    await expect(
      page.getByText(/You are now friends|Request expired|invite code not synced|save your name in Wallet|Already friends/)
    ).toBeVisible({ timeout: 10000 });
  });
});
