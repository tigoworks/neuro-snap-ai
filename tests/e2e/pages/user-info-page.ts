import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { UserInfo } from '../data/test-data';

export class UserInfoPage extends BasePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly nameInput: Locator;
  readonly genderMaleLabel: Locator;
  readonly genderFemaleLabel: Locator;
  readonly ageInput: Locator;
  readonly cityInput: Locator;
  readonly occupationInput: Locator;
  readonly educationSelect: Locator;
  readonly phoneInput: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = page.locator('h2');
    this.nameInput = page.getByTestId('name-input');
    this.genderMaleLabel = page.locator('label[for="gender-male"]');
    this.genderFemaleLabel = page.locator('label[for="gender-female"]');
    this.ageInput = page.getByTestId('age-input');
    this.cityInput = page.getByTestId('city-input');
    this.occupationInput = page.getByTestId('occupation-input');
    this.educationSelect = page.getByTestId('education-select');
    this.phoneInput = page.getByTestId('phone-input');
    this.backButton = page.getByTestId('back-button');
    this.nextButton = page.getByTestId('start-button');
    this.errorMessages = page.locator('.error-message, .text-red-500');
  }

  /**
   * 导航到用户信息页面
   */
  async navigate(): Promise<void> {
    console.log('开始导航到用户信息页面...');
    
    // 1. 首先导航到欢迎页面
    console.log('步骤1: 导航到欢迎页面');
    await this.page.goto('/');
    await this.waitForPageLoad();
    
    // 2. 等待欢迎页面加载完成
    console.log('步骤2: 等待欢迎页面加载');
    await this.page.waitForSelector('[data-testid="start-test-button"]', { state: 'visible' });
    
    // 3. 点击"开始测试"按钮
    console.log('步骤3: 点击开始测试按钮');
    const startButton = this.page.getByTestId('start-test-button');
    await startButton.click();
    
    // 4. 等待页面跳转
    console.log('步骤4: 等待页面跳转');
    await this.page.waitForLoadState('networkidle');
    
    // 5. 验证是否成功跳转到用户信息页面
    console.log('步骤5: 验证页面跳转');
    try {
      // 等待用户信息页面的特征元素出现
      await this.page.waitForSelector('[data-testid="name-input"]', { state: 'visible', timeout: 10000 });
      console.log('✅ 成功跳转到用户信息页面');
      
      // 打印当前页面URL和标题，用于调试
      const currentUrl = this.page.url();
      console.log('当前页面URL:', currentUrl);
      
      // 验证页面标题
      const pageTitle = await this.page.textContent('h2');
      console.log('页面标题:', pageTitle);
      
      // 验证是否在用户信息页面
      if (!pageTitle?.includes('基本信息')) {
        throw new Error('页面标题不匹配，可能未正确跳转到用户信息页面');
      }
    } catch (error) {
      console.error('❌ 页面跳转失败:', error);
      throw new Error('未能成功跳转到用户信息页面');
    }
    
    // 6. 等待用户信息页面的所有关键元素加载完成
    console.log('步骤6: 等待所有表单元素加载');
    await this.waitForReady();
    console.log('✅ 用户信息页面导航完成');
  }

  /**
   * 填写姓名
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * 选择性别
   */
  async selectGender(gender: string): Promise<void> {
    if (gender === '男') {
      await this.genderMaleLabel.click();
    } else {
      await this.genderFemaleLabel.click();
    }
  }

  /**
   * 填写年龄
   */
  async fillAge(age: string): Promise<void> {
    // 如果是无效的年龄数据（如 "abc"），需要特殊处理
    if (isNaN(Number(age)) && age !== '') {
      // 对于 type="number" 输入框，先移除 type 属性，然后输入文本
      await this.ageInput.evaluate((input: HTMLInputElement) => {
        input.removeAttribute('type');
      });
      await this.ageInput.fill(age);
      // 恢复 type 属性
      await this.ageInput.evaluate((input: HTMLInputElement) => {
        input.setAttribute('type', 'number');
      });
    } else {
      await this.ageInput.fill(age);
    }
  }

  /**
   * 填写城市
   */
  async fillCity(city: string): Promise<void> {
    await this.cityInput.fill(city);
  }

  /**
   * 填写职业
   */
  async fillOccupation(occupation: string): Promise<void> {
    await this.occupationInput.fill(occupation);
  }

  /**
   * 选择学历
   */
  async selectEducation(education: string): Promise<void> {
    await this.educationSelect.selectOption(education);
  }

  /**
   * 填写手机号
   */
  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }

  /**
   * 点击下一步按钮
   */
  async clickNextButton(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * 填写用户信息表单
   */
  async fillForm(userData: {
    name: string;
    gender: '男' | '女';
    age: string;
    city: string;
    occupation: string;
    education: string;
    phone?: string;
  }): Promise<void> {
    console.log('开始填写表单...');
    
    // 填写姓名
    if (userData.name) {
      console.log('填写姓名:', userData.name);
      await this.nameInput.fill(userData.name);
    }
    
    // 选择性别
    if (userData.gender) {
      console.log('选择性别:', userData.gender);
      await this.selectGender(userData.gender);
    }
    
    // 填写年龄
    if (userData.age) {
      console.log('填写年龄:', userData.age);
      await this.fillAge(userData.age);
    }
    
    // 填写城市
    if (userData.city) {
      console.log('填写城市:', userData.city);
      await this.fillCity(userData.city);
    }
    
    // 填写职业
    if (userData.occupation) {
      console.log('填写职业:', userData.occupation);
      await this.fillOccupation(userData.occupation);
    }
    
    // 选择学历
    if (userData.education) {
      console.log('选择学历:', userData.education);
      await this.selectEducation(userData.education);
    }
    
    // 填写手机号
    if (userData.phone) {
      console.log('填写手机号:', userData.phone);
      await this.fillPhone(userData.phone);
    }
    
    console.log('表单填写完成');
  }

  /**
   * 提交表单
   */
  async submitForm(): Promise<void> {
    console.log('提交表单...');
    await this.nextButton.click();
    console.log('表单已提交');
  }

  /**
   * 获取表单数据
   */
  async getFormData(): Promise<UserInfo> {
    return {
      name: await this.nameInput.inputValue(),
      gender: await this.genderMaleLabel.isChecked() ? '男' : '女',
      age: await this.ageInput.inputValue(),
      city: await this.cityInput.inputValue(),
      occupation: await this.occupationInput.inputValue(),
      education: await this.educationSelect.inputValue(),
      phone: await this.phoneInput.inputValue()
    };
  }

  /**
   * 获取错误信息
   */
  async getErrorMessages(): Promise<string[]> {
    console.log('获取错误信息...');
    const errorElements = await this.errorMessages.all();
    const errorMessages = await Promise.all(
      errorElements.map(element => element.textContent())
    );
    console.log('错误信息:', errorMessages);
    return errorMessages.map(msg => msg || '');
  }

  /**
   * 等待用户信息页面加载完成
   */
  async waitForReady(): Promise<void> {
    // 等待页面加载完成
    await this.page.waitForLoadState('networkidle');
    
    // 等待所有必要的表单元素
    await Promise.all([
      this.nameInput.waitFor({ state: 'visible', timeout: 30000 }),
      this.genderMaleLabel.waitFor({ state: 'visible', timeout: 30000 }),
      this.genderFemaleLabel.waitFor({ state: 'visible', timeout: 30000 }),
      this.ageInput.waitFor({ state: 'visible', timeout: 30000 }),
      this.cityInput.waitFor({ state: 'visible', timeout: 30000 }),
      this.occupationInput.waitFor({ state: 'visible', timeout: 30000 }),
      this.educationSelect.waitFor({ state: 'visible', timeout: 30000 })
    ]);
  }

  /**
   * 运行欢迎页面的测试流程
   */
  async runWelcomePageTest(): Promise<void> {
    console.log('运行欢迎页面的测试流程...');
    // 导航到欢迎页面
    await this.page.goto('/');
    await this.waitForPageLoad();
    // 等待欢迎页面加载
    await this.page.waitForSelector('[data-testid="start-test-button"]', { state: 'visible' });
    // 点击"开始测试"按钮
    await this.page.getByTestId('start-test-button').click();
    // 等待页面跳转
    await this.page.waitForLoadState('networkidle');
    console.log('欢迎页面测试流程完成');
  }

  async verifyPage() {
    await expect(this.pageTitle).toContainText('基本信息');
    await expect(this.nameInput).toBeVisible();
    await expect(this.nextButton).toBeVisible();
  }

  async clickBack() {
    await this.backButton.click();
  }
} 