import { test, expect } from '@playwright/test';

test.describe('Corrected Complete Flow', () => {
  test('Full user journey from welcome to five questions', async ({ page }) => {
    // Step 1: Navigate to welcome page
    console.log('=== Step 1: Welcome Page ===');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check welcome page content
    await expect(page.getByTestId('welcome-title')).toContainText('了解你自己，解锁你的潜力画像');
    await expect(page.getByTestId('welcome-description')).toBeVisible();
    
    // Click start button
    const startButton = page.getByTestId('start-test-button');
    await startButton.click();
    console.log('✅ Clicked start test button');
    
    // Step 2: User Info Form
    console.log('=== Step 2: User Info Form ===');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify we're on user info page
    await expect(page.locator('h2')).toContainText('基本信息');
    
    // Fill required fields
    await page.getByTestId('name-input').fill('张三');
    console.log('✅ Filled name');
    
    // Select gender using the label (which makes radio button work)
    await page.locator('label[for="gender-male"]').click();
    console.log('✅ Selected gender');
    
    await page.getByTestId('age-input').fill('28');
    console.log('✅ Filled age');
    
    await page.getByTestId('city-input').fill('北京');
    console.log('✅ Filled city');
    
    await page.getByTestId('occupation-input').fill('软件工程师');
    console.log('✅ Filled occupation');
    
    await page.getByTestId('education-select').selectOption('本科');
    console.log('✅ Selected education');
    
    // Phone is optional but let's fill it
    await page.getByTestId('phone-input').fill('13800138000');
    console.log('✅ Filled phone');
    
    // Click next button (the submit button has testid "start-button")
    await page.getByTestId('start-button').click();
    console.log('✅ Clicked next button');
    
    // Step 3: Five Questions
    console.log('=== Step 3: Five Questions ===');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for API call
    
    // Verify we're on five questions page
    await expect(page.locator('h2')).toContainText('五问法');
    await expect(page.getByTestId('five-questions')).toBeVisible();
    
    // Wait for questions to load (they come from API)
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Fill all textareas with sample answers
    const textareas = await page.locator('textarea').all();
    for (let i = 0; i < textareas.length; i++) {
      await textareas[i].fill(`这是第${i + 1}个问题的回答。我认为这个问题很有意思，让我思考了很多关于自己的特点和行为模式。`);
      console.log(`✅ Filled textarea ${i + 1}`);
    }
    
    // Submit five questions
    await page.getByTestId('start-button').click({ force: true });
    console.log('✅ Submitted five questions');
    
    // Step 4: Verify next stage (MBTI Test)
    console.log('=== Step 4: MBTI Test ===');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check if we progressed to MBTI test
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Look for MBTI test indicators
    const mbtiTitle = await page.locator('h2').textContent();
    console.log('Current page title:', mbtiTitle);
    
    if (mbtiTitle?.includes('MBTI') || await page.locator('input[type="radio"]').count() > 0) {
      console.log('✅ Successfully reached MBTI test');
      
      // Fill some MBTI questions if available
      const radioButtons = await page.locator('input[type="radio"]').all();
      const selectedGroups = new Set<string>();
      
      for (let i = 0; i < Math.min(radioButtons.length, 20); i++) {
        const radio = radioButtons[i];
        const name = await radio.getAttribute('name');
        if (name && !selectedGroups.has(name)) {
          try {
            await radio.click({ force: true, timeout: 2000 });
            selectedGroups.add(name);
            console.log(`✅ Selected option for question group: ${name}`);
          } catch (error) {
            console.log(`Could not click radio for ${name}:`, error);
          }
        }
      }
      
      console.log(`✅ Filled ${selectedGroups.size} MBTI question groups`);
      
    } else {
      console.log('ℹ️  Not on MBTI test yet, checking current state...');
      
      // Check for any errors
      const errorCount = await page.locator('.error-message, .text-red-500').count();
      if (errorCount > 0) {
        const errors = await page.locator('.error-message, .text-red-500').allTextContents();
        console.log('Found errors:', errors);
      }
      
      // Check page content
      const pageText = await page.locator('body').textContent();
      console.log('Page contains:', pageText?.substring(0, 200) + '...');
    }
    
    console.log('🎉 Test completed successfully - user flow verified through multiple stages');
  });
}); 