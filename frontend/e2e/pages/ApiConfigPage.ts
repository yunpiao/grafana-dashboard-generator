import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ApiConfigPage extends BasePage {
  readonly settingsButton: Locator;
  readonly modal: Locator;
  readonly apiKeyInput: Locator;
  readonly baseURLInput: Locator;
  readonly modelSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsButton = page.locator('header button').first();
    this.modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('API Configuration') });
    this.apiKeyInput = page.getByPlaceholder(/sk-|api key/i);
    this.baseURLInput = page.getByPlaceholder(/api.openai.com/i);
    this.modelSelect = page.locator('select');
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.closeButton = page.locator('button svg.lucide-x').locator('..');
  }

  async openConfig() {
    await this.settingsButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillConfig(apiKey: string, baseURL?: string, model?: string) {
    await this.apiKeyInput.fill(apiKey);
    if (baseURL) {
      await this.baseURLInput.fill(baseURL);
    }
    if (model) {
      await this.modelSelect.selectOption(model);
    }
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectModalClosed() {
    await expect(this.modal).not.toBeVisible();
  }
}
