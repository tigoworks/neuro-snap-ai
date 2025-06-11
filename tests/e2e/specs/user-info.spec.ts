import { test, expect } from '@playwright/test';
import { WelcomePage } from '../pages/welcome-page';
import { UserInfoPage } from '../pages/user-info-page';

test.describe('用户信息表单测试', () => {
  let welcomePage: WelcomePage;
  let userInfoPage: UserInfoPage;

  test.beforeEach(async ({ page }) => {
    welcomePage = new WelcomePage(page);
    userInfoPage = new UserInfoPage(page);
    
    // 导航到用户信息页面
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('start-test-button').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2')).toContainText('基本信息');
  });

  test('必填字段验证', async ({ page }) => {
    console.log('测试必填字段验证...');
    
    // 不填写任何内容，直接点击下一步
    await userInfoPage.clickNextButton();
    
    // 验证错误提示
    await page.waitForTimeout(1000);
    const errorMessages = await userInfoPage.getErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
    console.log('✅ 必填字段验证通过，错误数量:', errorMessages.length);
  });

  test('年龄格式验证', async ({ page }) => {
    console.log('测试年龄格式验证...');
    
    // 填写无效年龄
    await userInfoPage.fillName('张三');
    await userInfoPage.selectGender('男');
    await userInfoPage.fillAge('abc'); // 无效年龄
    await userInfoPage.fillCity('北京');
    await userInfoPage.fillOccupation('工程师');
    await userInfoPage.selectEducation('本科');
    
    await userInfoPage.clickNextButton();
    
    // 验证错误提示
    await page.waitForTimeout(1000);
    const errorMessages = await userInfoPage.getErrorMessages();
    const hasAgeError = errorMessages.some(msg => msg.includes('年龄'));
    expect(hasAgeError).toBeTruthy();
    console.log('✅ 年龄格式验证通过');
  });

  test('手机号格式验证', async ({ page }) => {
    console.log('测试手机号格式验证...');
    
    // 填写有效信息但无效手机号
    await userInfoPage.fillForm({
      name: '张三',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '工程师',
      education: '本科',
      phone: '123' // 无效手机号
    });
    
    await userInfoPage.clickNextButton();
    
    // 验证错误提示
    await page.waitForTimeout(1000);
    const errorMessages = await userInfoPage.getErrorMessages();
    const hasPhoneError = errorMessages.some(msg => msg.includes('手机号'));
    expect(hasPhoneError).toBeTruthy();
    console.log('✅ 手机号格式验证通过');
  });

  test('正确填写表单能成功跳转', async ({ page }) => {
    console.log('测试正确填写表单...');
    
    // 填写完整且正确的信息
    await userInfoPage.fillForm({
      name: '张三',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '软件工程师',
      education: '本科',
      phone: '13800138000'
    });
    
    await userInfoPage.clickNextButton();
    
    // 等待跳转到五问题页面
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待API加载
    
    // 验证跳转到五问题页面
    const pageTitle = await page.locator('h2').textContent();
    expect(pageTitle).toContain('五问法');
    console.log('✅ 成功跳转到五问题页面');
  });

  test('返回按钮功能', async ({ page }) => {
    console.log('测试返回按钮功能...');
    
    // 点击返回按钮
    await userInfoPage.clickBack();
    
    // 验证返回到欢迎页面
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('welcome-title')).toBeVisible();
    console.log('✅ 返回按钮功能正常');
  });

  test('不填手机号也能通过（可选字段）', async ({ page }) => {
    console.log('测试可选字段...');
    
    // 不填写手机号
    await userInfoPage.fillForm({
      name: '李四',
      gender: '女',
      age: '30',
      city: '上海',
      occupation: '设计师',
      education: '硕士'
      // 不填写phone
    });
    
    await userInfoPage.clickNextButton();
    
    // 等待跳转成功
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 验证成功跳转
    const pageTitle = await page.locator('h2').textContent();
    expect(pageTitle).toContain('五问法');
    console.log('✅ 可选字段测试通过');
  });
}); 