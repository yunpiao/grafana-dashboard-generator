import { test, expect } from '@playwright/test';
import { LandingPage, DashboardGeneratorPage, ApiConfigPage } from '../../pages';
import { SAMPLE_METRICS, TEST_API_CONFIG } from '../../fixtures/test-data';

test.describe('Dashboard Generation Flow', () => {
  let landingPage: LandingPage;
  let generatorPage: DashboardGeneratorPage;
  let apiConfigPage: ApiConfigPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    generatorPage = new DashboardGeneratorPage(page);
    apiConfigPage = new ApiConfigPage(page);

    await landingPage.goto();
    await landingPage.clickTryNow();
    await generatorPage.expectMainAppVisible();
  });

  test('displays metrics input on main app', async () => {
    await expect(generatorPage.metricsTextarea).toBeVisible();
  });

  test('can input metrics text', async () => {
    await generatorPage.inputMetrics(SAMPLE_METRICS);
    await expect(generatorPage.metricsTextarea).toHaveValue(SAMPLE_METRICS);
  });

  test('shows error without API key configured', async () => {
    await generatorPage.inputMetrics(SAMPLE_METRICS);
    await generatorPage.clickGeneratePlan();
    await generatorPage.expectError();
  });
});
