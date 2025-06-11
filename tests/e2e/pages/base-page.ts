import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 等待页面加载完成
   */
  protected async waitForPageLoad(): Promise<void> {
    let retries = 0;
    while (retries < this.maxRetries) {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle');
      console.log('✅ 页面加载完成');
        return;
    } catch (error) {
        retries++;
        console.error(`❌ 页面加载失败 (尝试 ${retries}/${this.maxRetries}):`, error);
        if (retries === this.maxRetries) {
      throw error;
        }
        await this.page.waitForTimeout(this.retryDelay);
      }
    }
  }

  /**
   * 等待元素可见
   */
  protected async waitForElement(selector: string, timeout: number = 30000): Promise<void> {
    let retries = 0;
    while (retries < this.maxRetries) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      console.log(`✅ 元素 ${selector} 已可见`);
        return;
    } catch (error) {
        retries++;
        console.error(`❌ 等待元素 ${selector} 失败 (尝试 ${retries}/${this.maxRetries}):`, error);
        if (retries === this.maxRetries) {
      throw error;
        }
        await this.page.waitForTimeout(this.retryDelay);
      }
    }
  }

  /**
   * 点击元素
   */
  protected async click(selector: string): Promise<void> {
    let retries = 0;
    while (retries < this.maxRetries) {
    try {
      await this.waitForElement(selector);
      await this.page.click(selector);
      console.log(`✅ 点击元素 ${selector} 成功`);
        return;
    } catch (error) {
        retries++;
        console.error(`❌ 点击元素 ${selector} 失败 (尝试 ${retries}/${this.maxRetries}):`, error);
        if (retries === this.maxRetries) {
      throw error;
        }
        await this.page.waitForTimeout(this.retryDelay);
      }
    }
  }

  /**
   * 填写输入框
   */
  protected async fill(selector: string, value: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.fill(selector, value);
      console.log(`✅ 填写元素 ${selector} 成功`);
    } catch (error) {
      console.error(`❌ 填写元素 ${selector} 失败:`, error);
      throw error;
    }
  }

  /**
   * 选择下拉框选项
   */
  protected async selectOption(selector: string, value: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.selectOption(selector, value);
      console.log(`✅ 选择元素 ${selector} 的选项 ${value} 成功`);
    } catch (error) {
      console.error(`❌ 选择元素 ${selector} 的选项失败:`, error);
      throw error;
    }
  }

  /**
   * 获取元素文本
   */
  protected async getText(selector: string): Promise<string> {
    try {
      await this.waitForElement(selector);
      const text = await this.page.textContent(selector);
      console.log(`✅ 获取元素 ${selector} 的文本成功`);
      return text || '';
    } catch (error) {
      console.error(`❌ 获取元素 ${selector} 的文本失败:`, error);
      throw error;
    }
  }

  /**
   * 截图
   */
  protected async takeScreenshot(name: string): Promise<void> {
    try {
      await this.page.screenshot({ path: `./test-results/${name}.png` });
      console.log(`✅ 截图 ${name} 保存成功`);
    } catch (error) {
      console.error(`❌ 截图 ${name} 保存失败:`, error);
      throw error;
    }
  }

  /**
   * 获取输入框的值
   */
  protected async getInputValue(selector: string): Promise<string> {
    try {
      await this.waitForElement(selector);
      const value = await this.page.inputValue(selector);
      console.log(`✅ 获取元素 ${selector} 的值成功`);
      return value;
    } catch (error) {
      console.error(`❌ 获取元素 ${selector} 的值失败:`, error);
      throw error;
    }
  }
} 