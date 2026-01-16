import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PlanEditorPage extends BasePage {
  readonly planContainer: Locator;
  readonly categoryCards: Locator;
  readonly panelCards: Locator;
  readonly confirmButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.planContainer = page.locator('[class*="plan"]');
    this.categoryCards = page.locator('[class*="category"]');
    this.panelCards = page.locator('[class*="panel"]');
    this.confirmButton = page.getByRole('button', { name: /confirm|generate/i });
    this.backButton = page.getByRole('button', { name: /back/i });
  }

  async expectPlanVisible() {
    await expect(this.confirmButton).toBeVisible({ timeout: 30000 });
  }

  async confirmPlan() {
    await this.confirmButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }
}
