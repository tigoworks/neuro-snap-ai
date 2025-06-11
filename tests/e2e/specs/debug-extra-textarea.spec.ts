import { test, expect, Page } from '@playwright/test';

test.describe('调试额外textarea问题', () => {
  test('检查是否有缓存或重复数据导致额外textarea', async ({ page }) => {
    console.log('=== 开始调试额外textarea问题 ===');
    
    // 清理浏览器缓存和localStorage
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') localStorage.clear();
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      });
    } catch (error) {
      console.log('无法清理存储，继续测试...');
    }
    
    // Step 1: 导航到欢迎页面
    console.log('Step 1: 导航到欢迎页面');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 验证欢迎页面
    await expect(page.locator('h1')).toContainText('了解你自己');
    
    // 使用更可靠的按钮选择器
    const startButton = page.getByRole('button', { name: '开始测试' });
    await expect(startButton).toBeVisible();
    await startButton.click();
    console.log('✅ 欢迎页面通过，点击开始测试');
    
    // Step 2: 填写用户信息
    console.log('Step 2: 填写用户信息');
    await page.waitForLoadState('networkidle');
    
    // 等待用户信息页面加载
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
    
    // 等待题目从API加载
    console.log('等待题目从API加载...');
    await page.waitForSelector('textarea', { timeout: 15000 });
    
    // 获取所有textarea并分析它们的属性
    const textareas = await page.locator('textarea').all();
    console.log(`找到 ${textareas.length} 个textarea`);
    
    // 详细分析每个textarea
    for (let i = 0; i < textareas.length; i++) {
      const name = await textareas[i].getAttribute('name');
      const placeholder = await textareas[i].getAttribute('placeholder');
      const className = await textareas[i].getAttribute('class');
      
      console.log(`Textarea ${i + 1}:`, {
        name: name || 'NO_NAME',
        placeholder,
        hasValidName: !!name && name.length > 0,
        className: className?.substring(0, 50) + '...'
      });
      
      // 修复：添加安全检查和更简单的选择器
      try {
        // 使用更直接的选择器找到对应的label
        const questionContainer = textareas[i].locator('xpath=ancestor::div[contains(@class, "border-b")]');
        const labelText = await questionContainer.locator('label').first().textContent({ timeout: 5000 });
        console.log(`  对应问题: ${labelText?.substring(0, 50)}...`);
      } catch (error: any) {
        console.log(`  ⚠️ 无法找到第${i + 1}个textarea对应的问题标签:`, error.message);
        // 继续处理下一个，不中断测试
      }
    }
    
    // 检查DOM结构，看是否有重复的问题元素
    const questionDivs = await page.locator('[data-testid="five-questions"] > div > form > div').all();
    console.log(`\n问题容器数量: ${questionDivs.length}`);
    
    for (let i = 0; i < questionDivs.length; i++) {
      try {
        // 修复：先检查是否包含label，只处理真正的问题容器
        const labelCount = await questionDivs[i].locator('label').count();
        const textareaCount = await questionDivs[i].locator('textarea').count();
        
        if (labelCount > 0) {
          // 只有包含label的容器才是真正的问题容器
          const labelText = await questionDivs[i].locator('label').textContent({ timeout: 5000 });
          console.log(`问题容器 ${i + 1}: "${labelText?.substring(0, 40)}...", textarea数量: ${textareaCount}`);
        } else {
          console.log(`容器 ${i + 1}: 空容器或布局元素（无label），textarea数量: ${textareaCount}`);
        }
      } catch (error: any) {
        console.log(`⚠️ 处理容器 ${i + 1} 时出错:`, error.message);
      }
    }
    
    // 修复：使用更精确的选择器，只选择包含问题的容器
    const actualQuestionDivs = await page.locator('[data-testid="five-questions"] > div > form > div:has(label)').all();
    console.log(`\n实际问题容器数量: ${actualQuestionDivs.length}`);
    
    // 检查是否有重复的key导致React渲染问题
    const uniqueLabels = new Set();
    const duplicateLabels = [];
    
    for (let i = 0; i < actualQuestionDivs.length; i++) {
      try {
        const labelText = await actualQuestionDivs[i].locator('label').textContent({ timeout: 5000 });
        if (uniqueLabels.has(labelText)) {
          duplicateLabels.push(labelText);
        } else {
          uniqueLabels.add(labelText);
        }
      } catch (error: any) {
        console.log(`⚠️ 检查重复标签时出错:`, error.message);
      }
    }
    
    if (duplicateLabels.length > 0) {
      console.log('❌ 发现重复的问题标签:', duplicateLabels);
    } else {
      console.log('✅ 没有发现重复的问题标签');
    }
    
    // 检查React组件的key属性（通过DOM分析）
    const questionKeys = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid="five-questions"] form > div[class*="border-b"]');
      return Array.from(elements).map((el, index) => {
        const textarea = el.querySelector('textarea');
        return {
          index,
          textareaName: textarea?.getAttribute('name') || 'NO_NAME',
          hasKey: el.hasAttribute('data-key') || el.getAttribute('key'),
          elementText: el.querySelector('label')?.textContent?.substring(0, 30) + '...'
        };
      });
    });
    
    console.log('\nReact元素分析:', questionKeys);
    
    // 检查是否有空的question_code导致渲染问题
    const emptyNameTextareas = questionKeys.filter(item => item.textareaName === 'NO_NAME' || item.textareaName === '');
    if (emptyNameTextareas.length > 0) {
      console.log('❌ 发现没有name属性的textarea:', emptyNameTextareas);
    } else {
      console.log('✅ 所有textarea都有有效的name属性');
    }
    
    console.log('=== 调试完成 ===');
  });
}); 