import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages';

test.describe('Landing Page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
  });

  test('displays hero section correctly', async () => {
    await landingPage.expectLandingVisible();
  });

  test('Try Now button enters main app', async () => {
    await landingPage.clickTryNow();
    await expect(landingPage.page.getByRole('textbox')).toBeVisible();
  });

  test('Generate Dashboard button enters main app', async () => {
    await landingPage.clickGenerateDashboard();
    await expect(landingPage.page.getByRole('textbox')).toBeVisible();
  });

  test('How It Works scrolls to section', async () => {
    await landingPage.scrollToHowItWorks();
  });
});
