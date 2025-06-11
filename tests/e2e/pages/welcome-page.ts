import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class WelcomePage extends BasePage {
  readonly title: Locator;
  readonly description: Locator;
  readonly startButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('welcome-title');
    this.description = page.getByTestId('welcome-description');
    this.startButton = page.getByTestId('start-test-button');
  }

  /**
   * 导航到欢迎页面并等待完全加载
   */
  async navigate(): Promise<void> {
    console.log('开始导航到欢迎页面...');
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await this.waitForPageLoad();
    await this.waitForReady();
    console.log('欢迎页面加载完成');
  }

  /**
   * 等待页面完全加载就绪
   */
  async waitForReady(): Promise<void> {
    console.log('等待页面完全加载...');
    
    // 1. 等待网络请求完成
    await this.page.waitForLoadState('networkidle');
    
    // 2. 等待 DOM 内容加载完成
    await this.page.waitForLoadState('domcontentloaded');
    
    // 3. 等待页面渲染完成
    await this.page.waitForLoadState('load');
    
    // 4. 额外等待时间，确保所有动态内容加载完成
    await this.page.waitForTimeout(2000);
    
    // 5. 等待所有关键元素可见
    console.log('等待关键元素加载...');
    await Promise.all([
      this.title.waitFor({ 
        state: 'visible', 
        timeout: 30000 
      }),
      this.description.waitFor({ 
        state: 'visible', 
        timeout: 30000 
      }),
      this.startButton.waitFor({ 
        state: 'visible', 
        timeout: 30000 
      })
    ]);

    // 6. 验证页面是否真正就绪
    const isReady = await this.verifyPageReady();
    if (!isReady) {
      throw new Error('页面未完全加载就绪');
    }
    
    console.log('页面完全加载就绪');
  }

  /**
   * 验证页面是否真正就绪
   */
  private async verifyPageReady(): Promise<boolean> {
    try {
      // 检查所有关键元素是否真正可见和可交互
      const elements = await Promise.all([
        this.title.isVisible(),
        this.description.isVisible(),
        this.startButton.isVisible()
      ]);
      
      // 确保所有元素都可见
      return elements.every(isVisible => isVisible);
    } catch (error) {
      console.error('页面就绪检查失败:', error);
      return false;
    }
  }

  /**
   * 获取页面标题
   */
  async getTitle(): Promise<string> {
    await this.waitForReady(); // 确保页面已加载
    const title = await this.title.textContent();
    return title || '';
  }

  /**
   * 获取页面描述
   */
  async getDescription(): Promise<string> {
    await this.waitForReady(); // 确保页面已加载
    const description = await this.description.textContent();
    return description || '';
  }

  /**
   * 点击开始测试按钮
   */
  async clickStartButton(): Promise<void> {
    await this.waitForReady(); // 确保页面已加载
    console.log('准备点击开始测试按钮...');
    
    await this.startButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // 确保按钮可点击
    await this.startButton.waitFor({ state: 'attached', timeout: 10000 });
    
    console.log('点击开始测试按钮');
    await this.startButton.click();
    
    // 等待页面跳转开始
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 验证页面元素是否可见
   */
  async verifyElements(): Promise<void> {
    await this.waitForReady(); // 确保页面已加载
    console.log('验证页面元素...');
    
    await Promise.all([
      this.title.waitFor({ state: 'visible', timeout: 30000 }),
      this.description.waitFor({ state: 'visible', timeout: 30000 }),
      this.startButton.waitFor({ state: 'visible', timeout: 30000 })
    ]);
    
    console.log('页面元素验证完成');
  }

  async verifyPage() {
    await expect(this.title).toContainText('了解你自己，解锁你的潜力画像');
    await expect(this.description).toBeVisible();
    await expect(this.startButton).toBeVisible();
  }
} 