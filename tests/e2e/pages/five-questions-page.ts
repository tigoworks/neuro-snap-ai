import { expect, Locator, Page } from '@playwright/test';

export class FiveQuestionsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly pageContainer: Locator;
  readonly textareas: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly errorMessages: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2');
    this.pageContainer = page.getByTestId('five-questions');
    this.textareas = page.locator('textarea');
    this.backButton = page.getByTestId('back-button');
    this.nextButton = page.getByTestId('start-button');
    this.errorMessages = page.locator('.error-message');
    this.loadingIndicator = page.locator(':text("加载题目中...")');
  }

  async verifyPage() {
    await expect(this.pageTitle).toContainText('五问法');
    await expect(this.pageContainer).toBeVisible();
  }

  async waitForQuestionsToLoad() {
    // Wait for loading to disappear and textareas to appear
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.textareas.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillAllQuestions(baseAnswer: string = '这是我的回答') {
    await this.waitForQuestionsToLoad();
    
    const textareaElements = await this.textareas.all();
    console.log(`Found ${textareaElements.length} questions to fill`);
    
    for (let i = 0; i < textareaElements.length; i++) {
      const answer = `${baseAnswer} ${i + 1}。我认为这个问题很有意思，让我思考了很多关于自己的特点和行为模式。`;
      await textareaElements[i].fill(answer);
      console.log(`✅ Filled question ${i + 1}`);
    }
  }

  async clickNext() {
    await this.nextButton.click({ force: true });
  }

  async clickBack() {
    await this.backButton.click({ force: true });
  }

  async getErrors(): Promise<string[]> {
    const errorElements = await this.errorMessages.all();
    const errors = [];
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) errors.push(text);
    }
    return errors;
  }

  async getQuestions(): Promise<string[]> {
    await this.waitForQuestionsToLoad();
    const textareaElements = await this.textareas.all();
    return textareaElements.map((_, index) => `question_${index + 1}`);
  }

  async fillQuestion(questionCode: string, answer: string): Promise<void> {
    await this.waitForQuestionsToLoad();
    const questionIndex = parseInt(questionCode.replace('question_', '')) - 1;
    const textareaElements = await this.textareas.all();
    
    if (questionIndex >= 0 && questionIndex < textareaElements.length) {
      await textareaElements[questionIndex].fill(answer);
      console.log(`✅ Filled question ${questionIndex + 1} with: ${answer}`);
    } else {
      throw new Error(`Question ${questionCode} not found`);
    }
  }
} 