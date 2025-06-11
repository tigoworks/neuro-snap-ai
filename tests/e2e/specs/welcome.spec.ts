import { test, expect } from '@playwright/test';
import { WelcomePage } from '../pages/welcome-page';

test.describe('欢迎页面测试', () => {
  let welcomePage: WelcomePage;

  test.beforeEach(async ({ page }) => {
    welcomePage = new WelcomePage(page);
  });

  test('完整测试流程', async ({ page }) => {
    // 1. 访问首页
    console.log('1. 访问首页...');
    await page.goto('/');
    
    // 2. 验证页面标题
    console.log('2. 验证页面标题...');
    const pageTitle = await page.getByTestId('welcome-title').textContent();
    expect(pageTitle).toContain('了解你自己');
    
    // 3. 验证开始测试按钮存在
    console.log('3. 验证开始测试按钮...');
    const startButton = page.getByTestId('start-test-button');
    await expect(startButton).toBeVisible();
    
    // 4. 点击开始测试按钮
    console.log('4. 点击开始测试按钮...');
    await startButton.click();
    
    // 5. 等待页面加载并验证跳转
    console.log('5. 验证页面跳转...');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2')).toContainText('基本信息');
    
    console.log('✅ 欢迎页面测试完成');
  });
}); 