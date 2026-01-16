import { test, expect } from '@playwright/test';
import { LandingPage, DashboardGeneratorPage } from '../../pages';

test.describe('Navigation', () => {
  test('can navigate from landing to app and back', async ({ page }) => {
    const landingPage = new LandingPage(page);
    const generatorPage = new DashboardGeneratorPage(page);

    await landingPage.goto();
    await landingPage.expectLandingVisible();

    await landingPage.clickTryNow();
    await generatorPage.expectMainAppVisible();

    await page.locator('header').getByText('Metrics to Grafana Dashboard').click();
    await landingPage.expectLandingVisible();
  });

  test('Start Over resets the form', async ({ page }) => {
    const landingPage = new LandingPage(page);
    const generatorPage = new DashboardGeneratorPage(page);

    await landingPage.goto();
    await landingPage.clickTryNow();

    await generatorPage.inputMetrics('test metrics');
    await expect(generatorPage.metricsTextarea).toHaveValue('test metrics');
  });
});
