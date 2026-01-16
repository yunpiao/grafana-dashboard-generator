import { test, expect } from '@playwright/test';
import { LandingPage, ApiConfigPage } from '../../pages';
import { TEST_API_CONFIG } from '../../fixtures/test-data';

test.describe('API Configuration', () => {
  let landingPage: LandingPage;
  let apiConfigPage: ApiConfigPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    apiConfigPage = new ApiConfigPage(page);
    await landingPage.goto();
    await landingPage.clickTryNow();
  });

  test('opens config modal from settings button', async () => {
    await apiConfigPage.openConfig();
    await expect(apiConfigPage.apiKeyInput).toBeVisible();
  });

  test('saves API configuration', async () => {
    await apiConfigPage.openConfig();
    await apiConfigPage.fillConfig(
      TEST_API_CONFIG.apiKey,
      TEST_API_CONFIG.baseURL
    );
    await apiConfigPage.save();
    await apiConfigPage.expectModalClosed();
  });

  test('cancel closes modal without saving', async () => {
    await apiConfigPage.openConfig();
    await apiConfigPage.fillConfig('temp-key');
    await apiConfigPage.cancel();
    await apiConfigPage.expectModalClosed();
  });
});
