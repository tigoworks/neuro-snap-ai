# 后端API接口详细规范 📋

根据现有Next.js实现，你的后端需要提供以下两个接口，确保返回格式与前端完全兼容：

## 1. 获取测试题目接口 📝

### 请求格式
```
GET /api/survey-questions?model={type}
```

### 查询参数
- `model`: 测试类型，可选值：
  - `fiveq` - 五问法
  - `mbti` - MBTI人格测试  
  - `big5` - 五大人格测试
  - `disc` - DISC行为测试
  - `holland` - 霍兰德职业兴趣测试
  - `motivation` - 动机与价值观测试

### 响应格式
```json
{
  "model": {
    "id": "uuid",
    "name": "测试名称",
    "description": "测试描述"
  },
  "questions": [
    {
      "id": "uuid",
      "question_code": "fiveq_q1", 
      "content": "题目内容",
      "options": [
        {"code": 1, "label": "选项A"},
        {"code": 2, "label": "选项B"}
      ],
      "type": "single",
      "sort_order": 1,
      "required": true
    }
  ]
}
```

### 题目类型详解
```typescript
type QuestionType = 'single' | 'multiple' | 'scale' | 'text' | 'sorting'

// single: 单选题 - options必须提供
// multiple: 多选题 - options必须提供
// scale: 打分题(1-5分) - options为null
// text: 文本填空题 - options为null
// sorting: 拖拽排序题 - options必须提供
```

### 错误响应
```json
// 400 Bad Request - 缺少model参数
{ "error": "Model code is required" }

// 404 Not Found - 模型不存在
{ "error": "Model not found" }

// 404 Not Found - 无题目数据
{ "error": "No questions found for this model" }

// 500 Internal Server Error  
{ "error": "错误消息" }
```

## 2. 提交测试结果接口 📤

### 请求格式
```
POST /api/submit-test
Content-Type: application/json
```

### 请求体格式
```json
{
  "userInfo": {
    "name": "姓名",
    "gender": "male/female", 
    "age": 25,
    "city": "城市",
    "occupation": "职业",
    "education": "学历",
    "phone": "手机号"
  },
  "fiveQuestions": {
    "fiveq_q1": "文本答案",
    "fiveq_q2": "文本答案", 
    "fiveq_q3": "1",  // 单选：选项code(字符串)
    "fiveq_q4": "文本答案",
    "fiveq_q5": ["1", "3"]  // 多选：选项code数组
  },
  "mbti": {
    "mbti_ei_q1": "1",
    "mbti_ei_q2": "2",
    // ... 8个题目的答案
  },
  "bigFive": {
    "big5_o_q1": 4,  // 打分题：数字1-5
    "big5_o_q2": 3,
    // ... 10个题目的答案
  },
  "disc": {
    "disc_d_q1": "1",
    "disc_d_q2": "2", 
    // ... 8个题目的答案
  },
  "holland": {
    "holland_r_q1": 4,  // 打分题：数字1-5
    "holland_r_q2": 5,
    // ... 12个题目的答案  
  },
  "values": {
    "motivation_q1": ["1", "3", "5"],  // 多选
    "motivation_q2": ["2", "4"],       // 多选
    "motivation_q3": {"order": [2, 1, 4, 3, 5]},  // 排序
    "motivation_q4": "1",              // 单选
    "motivation_q5": "文本答案",        // 文本
    "motivation_q6": "3"               // 单选
  }
}
```

### 答案格式说明
根据题目类型，答案格式如下：
- **single (单选)**: 字符串 - 选中选项的code值，如 `"1"`
- **multiple (多选)**: 字符串数组 - 选中选项的code值，如 `["1", "3", "5"]`
- **scale (打分)**: 数字 - 1到5的整数，如 `4`
- **text (文本)**: 字符串 - 用户输入的文本，如 `"我的答案"`
- **sorting (排序)**: 对象 - `{"order": [2, 1, 4, 3, 5]}`，数组表示选项的新排序

### 成功响应
```json
{
  "message": "测试结果保存成功"
}
```

### 错误响应  
```json
// 400 Bad Request - 数据不完整
{ "error": "数据不完整" }

// 500 Internal Server Error
{ "error": "保存用户信息失败" }
{ "error": "获取模型信息失败" }  
{ "error": "获取题目信息失败" }
{ "error": "保存答案失败" }
{ "error": "处理测试提交失败" }
```

## 数据库设计参考 🗄️

基于现有Supabase schema，你的数据库应包含以下核心表：

### survey_model (测试模型表)
```sql
CREATE TABLE survey_model (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,  -- 'fiveq', 'mbti', 'big5', 'disc', 'holland', 'motivation'
  name TEXT,         -- 显示名称
  description TEXT   -- 描述
);
```

### survey_question (题目表)  
```sql
CREATE TABLE survey_question (
  id UUID PRIMARY KEY,
  model_id UUID REFERENCES survey_model(id),
  question_code TEXT,    -- 'fiveq_q1', 'mbti_ei_q1' 等
  content TEXT,          -- 题目内容
  options JSONB,         -- 选项数组 [{"code":1,"label":"选项A"}]
  type TEXT CHECK (type IN ('single','multiple','scale','text','sorting')),
  sort_order INTEGER,    -- 排序
  required BOOLEAN       -- 是否必答
);
```

### user_survey (用户信息表)
```sql  
CREATE TABLE user_survey (
  id UUID PRIMARY KEY,
  name TEXT,
  gender TEXT,
  age INTEGER,
  city TEXT,
  occupation TEXT, 
  education TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### user_survey_answer (答案表)
```sql
CREATE TABLE user_survey_answer (
  id UUID PRIMARY KEY,
  user_survey_id UUID REFERENCES user_survey(id),
  question_id UUID REFERENCES survey_question(id), 
  model_id UUID REFERENCES survey_model(id),
  answer JSONB,          -- 存储各种格式的答案
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 实现要点 ⚠️

1. **严格遵循数据格式** - 前端已经适配了这些格式，任何变动都可能导致显示异常
2. **保持字段命名一致** - 特别是question_code的命名规则
3. **正确处理NULL值** - 文本题和打分题的options字段应为null
4. **维护题目顺序** - 使用sort_order字段确保题目按正确顺序显示
5. **错误处理完整** - 提供清晰的错误信息，便于调试
6. **数据验证** - 确保提交的答案格式符合题目类型要求

按照这个规范实现，你的后端API将与现有前端完美兼容！ 🎯

---

# API迁移指南 🚀

## 🎯 目标
将前端项目中的API接口从Next.js API路由迁移到独立的后端服务，实现前后端完全分离。

## 📋 当前API接口清单

### 1. 调查问题接口
- **端点**: `/api/survey-questions`
- **参数**: `?model=<type>`
- **类型**: `fiveq`, `mbti`, `big5`, `disc`, `holland`, `motivation`
- **方法**: GET

### 2. 提交测试结果接口
- **端点**: `/api/submit-test`
- **方法**: POST
- **数据**: 完整的测试结果

## 🛠️ 迁移方案

### 方案一：环境变量配置（推荐）

#### 1. 创建 `.env.local` 文件
```bash
# 开发环境 - 使用新后端
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 或者保持现状（使用Next.js API路由）
# NEXT_PUBLIC_API_BASE_URL=

# 生产环境示例
# NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

#### 2. 使用步骤
1. 将 `lib/api.ts` 中的配置应用到项目
2. 逐步替换现有的 `fetch('/api/xxx')` 调用
3. 设置环境变量指向新后端
4. 测试验证

#### 3. 无缝切换
- **不设置** `NEXT_PUBLIC_API_BASE_URL`: 使用本地Next.js API路由
- **设置** `NEXT_PUBLIC_API_BASE_URL`: 使用外部后端服务

## 🔄 具体修改示例

### 修改前（原始代码）
```typescript
const response = await fetch('/api/survey-questions?model=fiveq')
```

### 修改后（使用新配置）
```typescript
import { apiRequest } from '@/lib/api'

const response = await apiRequest('/api/survey-questions?model=fiveq')
```

## 🚀 迁移步骤

### 第一阶段：准备工作
1. ✅ 创建 `lib/api.ts` 配置文件
2. 📝 创建环境变量配置文件
3. 🧪 创建迁移测试

### 第二阶段：逐步迁移
1. 修改各组件中的API调用
2. 测试本地API路由仍然工作
3. 测试外部后端API工作

### 第三阶段：完全切换
1. 设置生产环境变量
2. 移除旧的Next.js API路由（可选）
3. 部署验证

## 🎯 优势

### ✅ 渐进式迁移
- 可以随时切换回本地API
- 不影响现有功能
- 风险可控

### ✅ 环境灵活性
- 开发环境用本地后端
- 测试环境用测试后端
- 生产环境用生产后端

### ✅ 代码最小化修改
- 只需要替换API调用方式
- 业务逻辑保持不变
- 组件接口不变

## 📋 迁移检查清单

- [ ] 创建API配置文件
- [ ] 修改所有API调用点
- [ ] 配置环境变量
- [ ] 测试本地模式
- [ ] 测试外部后端模式
- [ ] 更新部署配置
- [ ] 文档更新 