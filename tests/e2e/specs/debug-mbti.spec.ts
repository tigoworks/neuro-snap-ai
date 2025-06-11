import { test, expect, Page } from '@playwright/test';

test.describe('MBTI 调试测试', () => {
  test('详细调试五问法到MBTI的跳转', async ({ page }) => {
    console.log('=== 开始详细调试测试 ===');
    
    // Step 1: 导航到欢迎页面
    console.log('Step 1: 导航到欢迎页面');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 验证欢迎页面
    await expect(page.locator('h1')).toContainText('了解你自己');
    
    // 修复：使用更可靠的按钮选择器
    const startButton = page.getByRole('button', { name: '开始测试' });
    await expect(startButton).toBeVisible();
    await startButton.click();
    console.log('✅ 欢迎页面通过，点击开始测试');
    
    // Step 2: 填写用户信息
    console.log('Step 2: 填写用户信息');
    await page.waitForLoadState('networkidle');
    
    // 修复：增加更长的等待时间和更具体的等待条件
    await page.waitForFunction(
      () => document.querySelector('h2')?.textContent?.includes('基本信息'),
      { timeout: 10000 }
    );
    
    await expect(page.locator('h2')).toContainText('基本信息');
    
    await page.getByTestId('name-input').fill('调试用户');
    await page.locator('label[for="gender-male"]').click();
    await page.getByTestId('age-input').fill('30');
    await page.getByTestId('city-input').fill('上海');
    await page.getByTestId('occupation-input').fill('测试工程师');
    await page.getByTestId('education-select').selectOption('本科');
    await page.getByTestId('phone-input').fill('13900139000');
    await page.getByTestId('start-button').click();
    console.log('✅ 用户信息填写完成');
    
    // Step 3: 五问法页面
    console.log('Step 3: 五问法页面');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 验证五问法页面加载
    await expect(page.locator('h2')).toContainText('五问法');
    await expect(page.getByTestId('five-questions')).toBeVisible();
    console.log('✅ 五问法页面加载成功');
    
    // 捕获网络请求，查看API返回数据
    const apiResponses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/survey-questions?model=fiveq')) {
        try {
          const data = await response.json();
          apiResponses.push(data);
          console.log('🔍 API响应数据:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.log('⚠️ 无法解析API响应:', error);
        }
      }
    });
    
    // 等待题目从API加载
    console.log('等待题目从API加载...');
    await page.waitForSelector('textarea', { timeout: 15000 });
    
    // 检查API数据
    if (apiResponses.length > 0) {
      const apiData = apiResponses[0];
      console.log(`📊 API返回了 ${apiData.questions?.length || 0} 个问题`);
      
      apiData.questions?.forEach((q: any, index: number) => {
        console.log(`问题 ${index + 1}:`, {
          question_code: q.question_code,
          content: q.content?.substring(0, 50) + '...',
          type: q.type,
          required: q.required
        });
      });
    }
    
    // 获取所有textarea并填写
    const textareas = await page.locator('textarea').all();
    console.log(`找到 ${textareas.length} 个textarea`);
    
    for (let i = 0; i < textareas.length; i++) {
      const answer = `这是第${i + 1}个问题的详细回答。我会认真思考这个问题并给出真实的答案。`;
      await textareas[i].fill(answer);
      console.log(`✅ 填写了第 ${i + 1} 个问题`);
    }
    
    // 检查是否有错误
    const errorCount = await page.locator('.error-message').count();
    if (errorCount > 0) {
      console.log('❌ 发现错误信息');
      const errors = await page.locator('.error-message').allTextContents();
      console.log('错误详情:', errors);
    } else {
      console.log('✅ 没有发现错误信息');
    }
    
    // 监听页面导航事件
    let navigationHappened = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigationHappened = true;
        console.log('🔄 页面导航发生:', frame.url());
      }
    });
    
    // 监听控制台日志
    page.on('console', msg => {
      if (msg.type() === 'log' && (
        msg.text().includes('Rendering stage') ||
        msg.text().includes('五问题提交数据') ||
        msg.text().includes('Moving to next stage')
      )) {
        console.log('🎯 页面日志:', msg.text());
      }
    });
    
    // 提交五问法表单
    console.log('准备提交五问法表单...');
    await page.getByTestId('start-button').click({ force: true });
    console.log('✅ 点击了提交按钮');
    
    // 等待页面状态变化
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 增加等待时间
    
    // 检查提交后的状态
    const currentUrl = page.url();
    const currentTitle = await page.locator('h2').textContent();
    console.log('提交后的URL:', currentUrl);
    console.log('提交后的标题:', currentTitle);
    console.log('页面导航是否发生:', navigationHappened);
    
    // 详细检查当前页面内容
    const pageContent = await page.locator('body').textContent();
    console.log('页面内容预览:', pageContent?.substring(0, 300) + '...');
    
    // 检查是否有MBTI测试元素
    const hasMbtiTest = await page.locator('[data-testid="mbti-test"]').isVisible().catch(() => false);
    const hasMbtiTitle = currentTitle?.includes('MBTI') || false;
    const hasRadioButtons = await page.locator('input[type="radio"]').count() > 0;
    
    console.log('MBTI测试检查:');
    console.log('- 是否有mbti-test元素:', hasMbtiTest);
    console.log('- 标题是否包含MBTI:', hasMbtiTitle);
    console.log('- 是否有单选按钮:', hasRadioButtons);
    
    if (hasMbtiTest || hasMbtiTitle || hasRadioButtons) {
      console.log('🎉 成功到达MBTI测试页面!');
      
      // 如果是MBTI页面，尝试填写一些题目
      if (hasRadioButtons) {
        const radioButtons = await page.locator('input[type="radio"]').all();
        console.log(`找到 ${radioButtons.length} 个单选按钮`);
        
        // 尝试选择前几个单选项
        for (let i = 0; i < Math.min(radioButtons.length, 10); i++) {
          try {
            await radioButtons[i].click({ force: true, timeout: 2000 });
            console.log(`✅ 选择了第 ${i + 1} 个选项`);
          } catch (error) {
            console.log(`⚠️ 无法点击第 ${i + 1} 个选项:`, error);
          }
        }
      }
    } else {
      console.log('❌ 未到达MBTI页面，仍在:', currentTitle);
      
      // 检查是否有错误信息
      const postSubmitErrors = await page.locator('.error-message, .text-red-500').count();
      if (postSubmitErrors > 0) {
        const errorTexts = await page.locator('.error-message, .text-red-500').allTextContents();
        console.log('提交后发现错误:', errorTexts);
      }
      
      // 检查五问法表单的状态
      const remainingTextareas = await page.locator('textarea').count();
      console.log('提交后剩余的textarea数量:', remainingTextareas);
      
      if (remainingTextareas > 0) {
        console.log('⚠️ 仍在五问法页面，检查表单验证');
        
        // 检查每个textarea的值
        const textareaValues = await page.locator('textarea').evaluateAll(
          (textareas) => textareas.map((ta, index) => ({
            index,
            value: (ta as HTMLTextAreaElement).value,
            name: (ta as HTMLTextAreaElement).name
          }))
        );
        console.log('Textarea状态:', textareaValues);
      }
    }
    
    console.log('=== 调试测试完成 ===');
  });
}); 