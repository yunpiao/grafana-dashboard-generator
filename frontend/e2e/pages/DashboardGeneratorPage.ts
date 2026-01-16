import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardGeneratorPage extends BasePage {
  readonly stepIndicator: Locator;
  readonly metricsTextarea: Locator;
  readonly generatePlanButton: Locator;
  readonly startOverButton: Locator;
  readonly loadingSpinner: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.stepIndicator = page.locator('[class*="step"]').first();
    this.metricsTextarea = page.getByRole('textbox');
    this.generatePlanButton = page.getByRole('button', { name: /generate|analyze/i });
    this.startOverButton = page.getByRole('button', { name: /start over/i });
    this.loadingSpinner = page.locator('.animate-spin');
    this.errorAlert = page.locator('[class*="error"], [class*="red"]');
  }

  async expectMainAppVisible() {
    await expect(this.metricsTextarea).toBeVisible({ timeout: 10000 });
  }

  async inputMetrics(metrics: string) {
    await this.metricsTextarea.fill(metrics);
  }

  async clickGeneratePlan() {
    await this.generatePlanButton.click();
  }

  async expectLoading() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  async expectError(message?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (message) {
      await expect(this.errorAlert).toContainText(message);
    }
  }

  async startOver() {
    await this.startOverButton.click();
  }
}
