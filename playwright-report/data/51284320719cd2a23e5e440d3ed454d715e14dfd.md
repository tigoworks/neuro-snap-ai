# Test info

- Name: 用户信息页面测试 >> 应该能够填写并提交有效的用户信息
- Location: /Users/kirby/project/neuro-snap-ai/tests/e2e/specs/user-info.spec.ts:24:7

# Error details

```
Error: locator.waitFor: Error: strict mode violation: getByText('学历') resolved to 2 elements:
    1) <label for="education-select" class="block text-sm font-medium text-gray-700 mb-1">学历</label> aka getByText('学历', { exact: true })
    2) <option value="">请选择您的学历</option> aka getByTestId('education-select')

Call log:
  - waiting for getByText('学历') to be visible

    at UserInfoPage.waitForReady (/Users/kirby/project/neuro-snap-ai/tests/e2e/pages/user-info-page.ts:138:33)
    at /Users/kirby/project/neuro-snap-ai/tests/e2e/specs/user-info.spec.ts:16:5
```

# Page snapshot

```yaml
- img
- heading "了解你自己， 解锁你的潜力画像" [level=1]
- paragraph: 通过这份全面的性格测试，探索你的内在世界，获取专属个性分析报告，发现你的潜能。
- img
- heading "全面性格测评" [level=3]
- paragraph: 包含MBTI、五大人格、DISC等多维度测试
- img
- heading "AI个性分析" [level=3]
- paragraph: 提交后获取AI生成的专属性格分析报告
- paragraph: 预计完成时间：约8-10分钟
- button "开始测试":
  - text: 开始测试
  - img
- alert
```

# Test source

```ts
   38 |     await this.page.getByLabel('年龄').fill(age);
   39 |   }
   40 |
   41 |   /**
   42 |    * 填写城市
   43 |    */
   44 |   async fillCity(city: string): Promise<void> {
   45 |     await this.page.getByLabel('城市').fill(city);
   46 |   }
   47 |
   48 |   /**
   49 |    * 填写职业
   50 |    */
   51 |   async fillOccupation(occupation: string): Promise<void> {
   52 |     await this.page.getByLabel('职业').fill(occupation);
   53 |   }
   54 |
   55 |   /**
   56 |    * 选择学历
   57 |    */
   58 |   async selectEducation(education: string): Promise<void> {
   59 |     await this.page.getByLabel('学历').selectOption(education);
   60 |   }
   61 |
   62 |   /**
   63 |    * 填写手机号
   64 |    */
   65 |   async fillPhone(phone: string): Promise<void> {
   66 |     await this.page.getByLabel('手机号').fill(phone);
   67 |   }
   68 |
   69 |   /**
   70 |    * 填写用户信息表单
   71 |    */
   72 |   async fillForm(userInfo: UserInfo): Promise<void> {
   73 |     await this.fillName(userInfo.name);
   74 |     await this.selectGender(userInfo.gender);
   75 |     await this.fillAge(userInfo.age);
   76 |     await this.fillCity(userInfo.city);
   77 |     await this.fillOccupation(userInfo.occupation);
   78 |     await this.selectEducation(userInfo.education);
   79 |     if (userInfo.phone) {
   80 |       await this.fillPhone(userInfo.phone);
   81 |     }
   82 |   }
   83 |
   84 |   /**
   85 |    * 提交表单
   86 |    */
   87 |   async submit(): Promise<void> {
   88 |     // 确保所有字段都被标记为已触碰
   89 |     await this.page.evaluate(() => {
   90 |       const inputs = document.querySelectorAll('input, select');
   91 |       inputs.forEach(input => {
   92 |         input.dispatchEvent(new Event('blur', { bubbles: true }));
   93 |       });
   94 |     });
   95 |     
   96 |     await this.page.getByRole('button', { name: '开始测试' }).click();
   97 |     await this.waitForPageLoad();
   98 |   }
   99 |
  100 |   /**
  101 |    * 获取表单数据
  102 |    */
  103 |   async getFormData(): Promise<UserInfo> {
  104 |     return {
  105 |       name: await this.page.getByLabel('姓名').inputValue(),
  106 |       gender: await this.page.getByRole('radio', { name: '男' }).isChecked() ? '男' : '女',
  107 |       age: await this.page.getByLabel('年龄').inputValue(),
  108 |       city: await this.page.getByLabel('城市').inputValue(),
  109 |       occupation: await this.page.getByLabel('职业').inputValue(),
  110 |       education: await this.page.getByLabel('学历').inputValue(),
  111 |       phone: await this.page.getByLabel('手机号').inputValue()
  112 |     };
  113 |   }
  114 |
  115 |   /**
  116 |    * 获取错误消息
  117 |    */
  118 |   async getErrorMessages(): Promise<string[]> {
  119 |     const errorElements = await this.page.getByRole('alert').all();
  120 |     const messages = await Promise.all(errorElements.map(el => el.textContent()));
  121 |     return messages.filter((msg): msg is string => msg !== null);
  122 |   }
  123 |
  124 |   /**
  125 |    * 等待页面加载完成
  126 |    */
  127 |   async waitForReady(): Promise<void> {
  128 |     await this.waitForPageLoad();
  129 |     // 增加等待时间，确保页面完全加载
  130 |     await this.page.waitForTimeout(1000);
  131 |     // 等待所有必要的表单元素
  132 |     await Promise.all([
  133 |       this.page.getByText('姓名').waitFor(),
  134 |       this.page.getByText('男').waitFor(),
  135 |       this.page.getByText('年龄').waitFor(),
  136 |       this.page.getByText('城市').waitFor(),
  137 |       this.page.getByText('职业').waitFor(),
> 138 |       this.page.getByText('学历').waitFor()
      |                                 ^ Error: locator.waitFor: Error: strict mode violation: getByText('学历') resolved to 2 elements:
  139 |     ]);
  140 |   }
  141 |
  142 |   /**
  143 |    * 导航到欢迎页面
  144 |    */
  145 |   async navigateToWelcomePage(): Promise<void> {
  146 |     await this.page.goto('/');
  147 |     await this.waitForPageLoad();
  148 |   }
  149 |
  150 |   /**
  151 |    * 点击开始测试按钮
  152 |    */
  153 |   async clickStartButton(): Promise<void> {
  154 |     await this.page.getByRole('button', { name: '开始测试' }).click();
  155 |   }
  156 |
  157 |   /**
  158 |    * 提交表单
  159 |    */
  160 |   async submitForm(): Promise<void> {
  161 |     await this.submit();
  162 |   }
  163 | } 
```