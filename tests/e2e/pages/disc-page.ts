import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class DiscPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 选择答案
   */
  async selectAnswer(questionId: string, answer: string): Promise<void> {
    console.log(`选择问题 ${questionId} 的答案: ${answer}`);
    await this.page.getByTestId(`${questionId}-${answer}`).click();
  }

  /**
   * 点击下一步按钮
   */
  async clickNextButton(): Promise<void> {
    console.log('点击下一步按钮');
    await this.page.getByRole('button', { name: '下一步' }).click();
  }

  /**
   * 获取错误信息
   */
  async getErrorText(): Promise<string> {
    const errorElement = this.page.locator('p.error-message');
    await errorElement.waitFor({ state: 'visible', timeout: 5000 });
    return await errorElement.textContent() || '';
  }

  /**
   * 验证页面是否加载完成
   */
  async waitForReady(): Promise<void> {
    console.log('等待 DISC 页面加载...');
    await this.page.waitForSelector('[data-testid="disc-test"]', { 
      state: 'visible', 
      timeout: 30000 
    });
    console.log('DISC 页面加载完成');
  }
} 