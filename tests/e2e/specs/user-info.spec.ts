import { test, expect } from '@playwright/test';
import { UserInfoPage } from '../pages/user-info-page';
import { UserInfo } from '../data/test-data';

test.describe('用户信息页面测试', () => {
  let userInfoPage: UserInfoPage;

  test.beforeEach(async ({ page }) => {
    userInfoPage = new UserInfoPage(page);
    console.log("开始新的测试用例...");
    console.log("导航到欢迎页面...");
    await page.goto('/');
    console.log("点击开始测试按钮...");
    await page.click('[data-testid="start-test-button"]');
    console.log("等待用户信息页面加载...");
    await userInfoPage.waitForReady();
  });

  test.afterEach(async ({ page }) => {
    // 清理页面状态
    await page.reload();
  });

  test('应该能够填写并提交有效的用户信息', async ({ page }) => {
    console.log("开始测试：填写并提交有效的用户信息");
    const validData: UserInfo = {
      name: '张三',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '软件工程师',
      education: '本科',
      phone: '13800138000'
    };

    console.log("开始填写姓名...");
    await userInfoPage.fillName(validData.name);
    console.log("开始选择性别...");
    await userInfoPage.selectGender(validData.gender);
    console.log("开始填写年龄...");
    await userInfoPage.fillAge(validData.age);
    console.log("开始填写城市...");
    await userInfoPage.fillCity(validData.city);
    console.log("开始填写职业...");
    await userInfoPage.fillOccupation(validData.occupation);
    console.log("开始选择学历...");
    await userInfoPage.selectEducation(validData.education);
    console.log("开始填写手机号...");
    await userInfoPage.fillPhone(validData.phone);

    console.log("提交表单...");
    await userInfoPage.submit();
    
    // 增加等待时间，确保页面有足够时间加载
    console.log("等待五问法页面加载...");
    await page.waitForTimeout(2000); // 等待2秒
    await expect(page.locator('[data-testid="five-questions"]')).toBeVisible({ timeout: 10000 });
    console.log("测试完成：表单提交成功");
  });

  test('应该验证必填字段', async ({ page }) => {
    console.log("开始测试：验证必填字段");
    console.log("直接点击提交按钮...");
    await userInfoPage.submit();
    console.log("获取错误信息...");
    const errorMessages = await userInfoPage.getErrorMessages();
    console.log("错误信息列表:", errorMessages);
    console.log("验证错误信息...");
    expect(errorMessages).toContain(" 请输入您的姓名");
    expect(errorMessages).toContain(" 请选择您的性别");
    expect(errorMessages).toContain(" 请输入您的年龄");
    expect(errorMessages).toContain(" 请输入您所在的城市");
    expect(errorMessages).toContain(" 请输入您的职业");
    expect(errorMessages).toContain(" 请选择您的学历");
    console.log("测试完成：必填字段验证成功");
  });

  test('应该处理无效数据', async ({ page }) => {
    console.log("开始测试：处理无效数据");
    await userInfoPage.fillName("");
    await userInfoPage.fillAge("0");
    await userInfoPage.fillPhone("123");
    await userInfoPage.submit();
    
    const errorMessages = await userInfoPage.getErrorMessages();
    expect(errorMessages).toContain(" 请输入您的姓名");
    expect(errorMessages).toContain(" 请输入有效的年龄");
    expect(errorMessages).toContain(" 请输入有效的手机号码");
  });

  test('应该保存部分填写的进度', async ({ page }) => {
    console.log("开始测试：保存部分填写的进度");
    console.log("填写部分信息...");
    await userInfoPage.fillName("李四");
    await userInfoPage.selectGender("女");
    await userInfoPage.fillAge("30");
    
    console.log("刷新页面...");
    await page.reload();
    await userInfoPage.waitForReady();
    
    const formData = await userInfoPage.getFormData();
    expect(formData.name).toBe("李四");
    expect(formData.gender).toBe("女");
    expect(formData.age).toBe("30");
  });

  test('应该验证表单数据', async ({ page }) => {
    console.log("开始测试：验证表单数据");
    console.log("填写完整的表单数据...");
    const validData: UserInfo = {
      name: '张三',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '软件工程师',
      education: '本科',
      phone: '13800138000'
    };

    await userInfoPage.fillName(validData.name);
    await userInfoPage.selectGender(validData.gender);
    await userInfoPage.fillAge(validData.age);
    await userInfoPage.fillCity(validData.city);
    await userInfoPage.fillOccupation(validData.occupation);
    await userInfoPage.selectEducation(validData.education);
    await userInfoPage.fillPhone(validData.phone);

    console.log("获取表单数据...");
    const formData = await userInfoPage.getFormData();
    console.log("表单数据:", formData);
    console.log("验证表单数据...");
    expect(formData).toEqual(validData);
    console.log("测试完成：表单数据验证成功");
  });
}); 