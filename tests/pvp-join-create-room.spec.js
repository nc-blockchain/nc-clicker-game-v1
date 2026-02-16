// @ts-check
/**
 * E2E: PVP Join & Create room (see scripts/PRD-PVP-JOIN-CREATE-ROOM.md).
 * Run with local server: npm run serve then BASE_URL=http://localhost:3001 npm run test:e2e
 * Windows: $env:BASE_URL='http://localhost:3001'; npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

test.describe('PVP Join & Create room', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('tokenClicker_onboardingCompleted', '1');
      } catch (e) {}
    });
  });

  test('Multiplayer page shows CREATE ROOM and OPEN ROOMS section', async ({ page }) => {
    await page.goto(`${baseUrl}/#multiplayer`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    await expect(page.locator('#pvp-open-create-room-btn')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/OPEN ROOMS|tap to join/)).toBeVisible({ timeout: 5000 });
  });

  test('Clicking CREATE ROOM opens modal with wager and submit button', async ({ page }) => {
    await page.goto(`${baseUrl}/#multiplayer`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    const createBtn = page.locator('#pvp-open-create-room-btn');
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();
    const modal = page.locator('#pvp-create-room-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('#pvp-create-modal-title')).toContainText('CREATE');
    await expect(modal.locator('.pvp-stake-btn').first()).toBeVisible();
    await expect(page.locator('#pvp-create-room-btn')).toBeVisible();
    await expect(page.locator('#pvp-create-room-modal-cancel')).toBeVisible();
  });

  test('Selecting a wager enables CREATE ROOM button', async ({ page }) => {
    await page.goto(`${baseUrl}/#multiplayer`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    await page.locator('#pvp-open-create-room-btn').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#pvp-open-create-room-btn').click();
    await expect(page.locator('#pvp-create-room-modal')).toBeVisible({ timeout: 5000 });
    const createRoomBtn = page.locator('#pvp-create-room-btn');
    await expect(createRoomBtn).toBeVisible();
    const stake5 = page.locator('.pvp-stake-btn[data-stake="5"]');
    await stake5.click();
    await expect(createRoomBtn).toBeEnabled();
  });

  test('Invite card and JOIN & PLAY exist in DOM (join flow structure)', async ({ page }) => {
    await page.goto(`${baseUrl}/#multiplayer`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    const card = page.locator('#pvp-invited-card');
    await expect(card).toBeAttached();
    await expect(page.locator('#pvp-invited-join-btn')).toHaveText(/JOIN & PLAY|JOIN/);
  });

  test('Open rooms list container exists', async ({ page }) => {
    await page.goto(`${baseUrl}/#multiplayer`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.location.hash = 'multiplayer';
      window.dispatchEvent(new Event('hashchange'));
    });
    await expect(page.locator('#pvp-rooms-list')).toBeAttached();
    await expect(page.locator('#pvp-refresh-btn')).toBeVisible({ timeout: 5000 });
  });
});
