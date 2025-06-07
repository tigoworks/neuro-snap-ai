import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { UserInfo } from '../data/test-data';

export class UserInfoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到用户信息页面
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * 填写姓名
   */
  async fillName(name: string): Promise<void> {
    await this.page.getByLabel('姓名').fill(name);
    // 触发 blur 事件以确保字段被标记为已触碰
    await this.page.getByLabel('姓名').blur();
  }

  /**
   * 选择性别
   */
  async selectGender(gender: string): Promise<void> {
    await this.page.getByText(gender, { exact: true }).click();
  }

  /**
   * 填写年龄
   */
  async fillAge(age: string): Promise<void> {
    await this.page.getByLabel('年龄').fill(age);
  }

  /**
   * 填写城市
   */
  async fillCity(city: string): Promise<void> {
    await this.page.getByLabel('城市').fill(city);
  }

  /**
   * 填写职业
   */
  async fillOccupation(occupation: string): Promise<void> {
    await this.page.getByLabel('职业').fill(occupation);
  }

  /**
   * 选择学历
   */
  async selectEducation(education: string): Promise<void> {
    await this.page.getByLabel('学历').selectOption(education);
  }

  /**
   * 填写手机号
   */
  async fillPhone(phone: string): Promise<void> {
    await this.page.getByLabel('手机号').fill(phone);
  }

  /**
   * 填写用户信息表单
   */
  async fillForm(userInfo: UserInfo): Promise<void> {
    await this.fillName(userInfo.name);
    await this.selectGender(userInfo.gender);
    await this.fillAge(userInfo.age);
    await this.fillCity(userInfo.city);
    await this.fillOccupation(userInfo.occupation);
    await this.selectEducation(userInfo.education);
    if (userInfo.phone) {
      await this.fillPhone(userInfo.phone);
    }
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    // 确保所有字段都被标记为已触碰
    await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      });
    });
    
    await this.page.getByRole('button', { name: '开始测试' }).click();
    await this.waitForPageLoad();
  }

  /**
   * 获取表单数据
   */
  async getFormData(): Promise<UserInfo> {
    return {
      name: await this.page.getByLabel('姓名').inputValue(),
      gender: await this.page.getByRole('radio', { name: '男' }).isChecked() ? '男' : '女',
      age: await this.page.getByLabel('年龄').inputValue(),
      city: await this.page.getByLabel('城市').inputValue(),
      occupation: await this.page.getByLabel('职业').inputValue(),
      education: await this.page.getByLabel('学历').inputValue(),
      phone: await this.page.getByLabel('手机号').inputValue()
    };
  }

  /**
   * 获取错误消息
   */
  async getErrorMessages(): Promise<string[]> {
    const errorElements = await this.page.getByRole('alert').all();
    const messages = await Promise.all(errorElements.map(el => el.textContent()));
    return messages.filter((msg): msg is string => msg !== null);
  }

  /**
   * 等待页面加载完成
   */
  async waitForReady(): Promise<void> {
    await this.waitForPageLoad();
    // 增加等待时间，确保页面完全加载
    await this.page.waitForTimeout(1000);
    // 等待所有必要的表单元素
    await Promise.all([
      this.page.getByLabel('姓名').waitFor(),
      this.page.getByText('男', { exact: true }).waitFor(),
      this.page.getByLabel('年龄').waitFor(),
      this.page.getByLabel('城市').waitFor(),
      this.page.getByLabel('职业').waitFor(),
      this.page.getByTestId('education-select').waitFor()
    ]);
  }

  /**
   * 导航到欢迎页面
   */
  async navigateToWelcomePage(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * 点击开始测试按钮
   */
  async clickStartButton(): Promise<void> {
    await this.page.getByRole('button', { name: '开始测试' }).click();
  }

  /**
   * 提交表单
   */
  async submitForm(): Promise<void> {
    await this.submit();
  }
} 