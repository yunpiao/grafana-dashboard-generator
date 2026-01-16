import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  readonly heroTitle: Locator;
  readonly tryNowButton: Locator;
  readonly generateButton: Locator;
  readonly howItWorksButton: Locator;
  readonly navLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.getByRole('heading', { level: 1 });
    this.tryNowButton = page.getByRole('button', { name: /try it now/i });
    this.generateButton = page.getByRole('button', { name: /generate dashboard/i });
    this.howItWorksButton = page.getByRole('button', { name: /see how it works/i });
    this.navLogo = page.locator('header').getByText('Metrics to Grafana Dashboard');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async expectLandingVisible() {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroTitle).toContainText('Metrics to Grafana Dashboard');
  }

  async clickTryNow() {
    await this.tryNowButton.click();
  }

  async clickGenerateDashboard() {
    await this.generateButton.click();
  }

  async scrollToHowItWorks() {
    await this.howItWorksButton.click();
    await expect(this.page.locator('#how-it-works')).toBeInViewport();
  }
}
