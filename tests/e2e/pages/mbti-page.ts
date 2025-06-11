import { Page } from '@playwright/test';

export class MbtiPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 等待 MBTI 测试加载完成
   */
  async waitForTestLoaded(): Promise<void> {
    console.log('等待 MBTI 测试加载完成...');
    await this.page.waitForSelector('[data-testid="mbti-test"]', { 
      state: 'visible', 
      timeout: 30000 
    });
    console.log('MBTI 测试加载完成');
  }

  /**
   * 获取所有问题项
   */
  async getAllQuestionItems() {
    console.log('获取所有问题项...');
    await this.waitForTestLoaded();
    const questions = await this.page.locator('[data-testid="mbti-test"] label').all();
    console.log(`找到 ${questions.length} 个问题项`);
    return questions;
  }

  /**
   * 回答问题
   */
  async answerQuestion(index: number, option: string) {
    console.log(`回答第 ${index + 1} 个问题，选择选项 ${option}`);
    await this.waitForTestLoaded();
    const question = this.page.locator('[data-testid="mbti-test"] label').nth(index);
    const optionInput = question.locator(`input[value="${option}"]`);
    await optionInput.waitFor({ state: 'visible', timeout: 30000 });
    await optionInput.click();
  }

  /**
   * 选择答案
   */
  async selectAnswer(questionCode: string, answer: string): Promise<void> {
    console.log(`选择问题 ${questionCode} 的答案: ${answer}`);
    await this.waitForTestLoaded();
    const option = this.page.locator(`[data-testid="mbti-test"] input[value="${answer}"]`).nth(parseInt(questionCode.replace('mbti_', '')) - 1);
    await option.waitFor({ state: 'visible', timeout: 30000 });
    await option.click();
  }

  /**
   * 点击下一步按钮
   */
  async clickNextButton(): Promise<void> {
    console.log('点击下一步按钮');
    await this.page.getByRole('button', { name: '下一步' }).click();
  }
} 