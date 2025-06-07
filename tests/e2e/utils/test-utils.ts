import { Page, expect } from '@playwright/test';

export class TestUtils {
  /**
   * 等待页面加载完成
   */
  static async waitForPageLoad(page: Page, pageName: string = '页面'): Promise<void> {
    try {
      console.log(`等待${pageName}加载...`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      console.log(`${pageName}加载完成`);
    } catch (error) {
      console.error(`❌ ${pageName}加载失败:`, error);
      await page.screenshot({ path: `error-${pageName}-load.png` });
      throw error;
    }
  }

  /**
   * 等待元素可见
   */
  static async waitForElement(page: Page, selector: string, elementName: string = '元素', timeout: number = 30000): Promise<void> {
    try {
      console.log(`等待${elementName}可见...`);
      await page.waitForSelector(selector, { state: 'visible', timeout });
      console.log(`${elementName}已可见`);
    } catch (error) {
      console.error(`❌ ${elementName}等待失败:`, error);
      throw error;
    }
  }

  /**
   * 点击元素
   */
  static async click(page: Page, selector: string, elementName: string = '元素'): Promise<void> {
    try {
      console.log(`点击${elementName}...`);
      await this.waitForElement(page, selector, elementName);
      await page.click(selector);
      console.log(`${elementName}点击成功`);
    } catch (error) {
      console.error(`❌ ${elementName}点击失败:`, error);
      throw error;
    }
  }

  /**
   * 填写输入框
   */
  static async fill(page: Page, selector: string, value: string, elementName: string = '输入框'): Promise<void> {
    try {
      console.log(`填写${elementName}...`);
      await this.waitForElement(page, selector, elementName);
      await page.fill(selector, value);
      console.log(`${elementName}填写成功`);
    } catch (error) {
      console.error(`❌ ${elementName}填写失败:`, error);
      throw error;
    }
  }

  /**
   * 选择下拉框选项
   */
  static async selectOption(page: Page, selector: string, value: string, elementName: string = '下拉框'): Promise<void> {
    try {
      console.log(`选择${elementName}选项...`);
      await this.waitForElement(page, selector, elementName);
      await page.selectOption(selector, value);
      console.log(`${elementName}选项选择成功`);
    } catch (error) {
      console.error(`❌ ${elementName}选项选择失败:`, error);
      throw error;
    }
  }

  /**
   * 获取元素文本
   */
  static async getText(page: Page, selector: string, elementName: string = '元素'): Promise<string> {
    try {
      console.log(`获取${elementName}文本...`);
      await this.waitForElement(page, selector, elementName);
      const text = await page.textContent(selector);
      console.log(`${elementName}文本获取成功`);
      return text || '';
    } catch (error) {
      console.error(`❌ ${elementName}文本获取失败:`, error);
      throw error;
    }
  }

  /**
   * 验证元素可见性
   */
  static async expectVisible(page: Page, selector: string, elementName: string = '元素'): Promise<void> {
    try {
      console.log(`验证${elementName}可见性...`);
      await expect(page.locator(selector)).toBeVisible();
      console.log(`${elementName}可见性验证成功`);
    } catch (error) {
      console.error(`❌ ${elementName}可见性验证失败:`, error);
      throw error;
    }
  }

  /**
   * 验证元素文本
   */
  static async expectText(page: Page, selector: string, expectedText: string, elementName: string = '元素'): Promise<void> {
    try {
      console.log(`验证${elementName}文本...`);
      const text = await this.getText(page, selector, elementName);
      expect(text).toBe(expectedText);
      console.log(`${elementName}文本验证成功`);
    } catch (error) {
      console.error(`❌ ${elementName}文本验证失败:`, error);
      throw error;
    }
  }

  /**
   * 截图
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    try {
      console.log(`保存截图：${name}`);
      await page.screenshot({ path: `./test-results/${name}.png` });
      console.log('截图保存成功');
    } catch (error) {
      console.error('截图保存失败:', error);
      throw error;
    }
  }
} 