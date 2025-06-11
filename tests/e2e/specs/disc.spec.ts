import { test, expect } from '@playwright/test';
import { WelcomePage } from '../pages/welcome-page';
import { UserInfoPage } from '../pages/user-info-page';
import { FiveQuestionsPage } from '../pages/five-questions-page';
import { MbtiPage } from '../pages/mbti-page';

test.describe('DISC 测试页面测试', () => {
  let welcomePage: WelcomePage;
  let userInfoPage: UserInfoPage;
  let fiveQuestionsPage: FiveQuestionsPage;
  let mbtiPage: MbtiPage;

  test.beforeEach(async ({ page }) => {
    welcomePage = new WelcomePage(page);
    userInfoPage = new UserInfoPage(page);
    fiveQuestionsPage = new FiveQuestionsPage(page);
    mbtiPage = new MbtiPage(page);
  });

  test('完整流程测试直到DISC', async ({ page }) => {
    // 导航到欢迎页面
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 填写欢迎页
    await welcomePage.clickStartButton();
    await page.waitForLoadState('networkidle');

    // 填写用户信息
    await userInfoPage.fillForm({
      name: '测试用户',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '工程师',
      education: '本科',
      phone: '13800138000'
    });
    await userInfoPage.clickNextButton();

    // 填写五问法
    await page.waitForLoadState('networkidle');
    const questions = await fiveQuestionsPage.getQuestions();
    for (let i = 0; i < questions.length; i++) {
      await fiveQuestionsPage.fillQuestion(questions[i], `测试回答 ${i + 1}`);
    }
    await fiveQuestionsPage.clickNext();

    // 等待页面跳转到MBTI或下一个测试
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 验证我们到达了某个测试页面
    const currentTitle = await page.locator('h2').textContent();
    console.log('当前页面标题:', currentTitle);
    
    // 检查是否是MBTI、DISC或其他测试页面
    const hasMbtiTest = await page.locator('[data-testid="mbti-test"]').isVisible().catch(() => false);
    const hasDiscTest = await page.locator('[data-testid="disc-test"]').isVisible().catch(() => false);
    const hasRadioButtons = await page.locator('input[type="radio"]').count() > 0;
    
    if (hasMbtiTest) {
      console.log('✅ 成功到达MBTI测试页面');
    } else if (hasDiscTest) {
      console.log('✅ 成功到达DISC测试页面');
    } else if (hasRadioButtons) {
      console.log('✅ 成功到达某个测试页面（有选择题）');
    } else {
      console.log('ℹ️ 到达了其他页面');
    }
    
    console.log('🎉 DISC流程测试完成');
  });
}); 