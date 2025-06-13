/**
 * Neuro-Snap Frontend SDK
 * 
 * 使用说明：
 * 1. 复制这个文件到你的前端项目
 * 2. 配置环境变量 NEXT_PUBLIC_API_BASE_URL 和 NEXT_PUBLIC_FRONTEND_API_KEY
 * 3. 导入并使用 NeuroSnapAPI 类
 * 
 * 示例：
 * import { neuroSnapAPI } from './frontend-sdk.js';
 * const questions = await neuroSnapAPI.getSurveyQuestions('mbti');
 */

class NeuroSnapAPI {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'test-frontend-key-123';
    this.sessionId = this.generateSessionId();
    
    if (!this.apiKey) {
      console.warn('⚠️  请配置 NEXT_PUBLIC_FRONTEND_API_KEY 环境变量');
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 通用API请求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Frontend-Key': this.apiKey,
      'User-Agent': 'NeuroSnap-Frontend/1.0.0',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // 检查响应状态
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // 如果无法解析错误响应，使用默认错误信息
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      
      // 友好的错误信息映射
      if (error.message.includes('Failed to fetch')) {
        throw new Error('网络连接失败，请检查服务器是否启动');
      } else if (error.message.includes('401')) {
        throw new Error('API认证失败，请检查API Key配置');
      } else if (error.message.includes('403')) {
        throw new Error('访问被拒绝，请检查域名白名单配置');
      } else if (error.message.includes('429')) {
        throw new Error('请求过于频繁，请稍后再试');
      } else if (error.message.includes('500')) {
        throw new Error('服务器内部错误，请稍后重试');
      }
      
      throw error;
    }
  }

  /**
   * 检查AI服务状态
   */
  async checkAIStatus() {
    console.log('📤 检查AI服务状态:');
    console.log('  endpoint: /ai/status');
    console.log('  method: GET');
    
    return this.request('/ai/status');
  }

  /**
   * 检查系统健康状态
   */
  async checkSystemHealth() {
    console.log('📤 检查系统健康状态:');
    console.log('  endpoint: /ai/health');
    console.log('  method: GET');
    
    return this.request('/ai/health');
  }

  /**
   * 获取测试题目
   * @param {string} modelCode - 测试类型代码
   * 支持的类型：fiveq, mbti, big5, disc, holland, motivation
   */
  async getSurveyQuestions(modelCode) {
    console.log('📤 获取测试题目:');
    console.log('  endpoint: /survey/model');
    console.log('  method: GET');
    console.log('  params: { code:', modelCode, '}');
    
    return this.request(`/survey/model?code=${modelCode}`);
  }

  /**
   * 提交完整的测试答案
   * @param {Object} testData - 完整测试数据
   * @param {Object} testData.userInfo - 用户信息
   * @param {Object} testData.fiveQuestions - 五问法测试答案
   * @param {Object} testData.mbti - MBTI测试答案
   * @param {Object} testData.bigFive - 大五人格测试答案
   * @param {Object} testData.disc - DISC测试答案
   * @param {Object} testData.holland - 霍兰德测试答案
   * @param {Object} testData.values - 价值观测试答案
   */
  async submitTest(testData) {
    console.log('📤 提交完整测试数据:');
    console.log('  endpoint: /submit-test');
    console.log('  method: POST');
    console.log('  data:', testData);
    
    const response = await this.request('/submit-test', {
      method: 'POST',
      body: JSON.stringify(testData)
    });

    // 处理多种可能的surveyId字段位置
    let surveyId = null;
    if (response.surveyId) {
      surveyId = response.surveyId;
    } else if (response.data?.surveyId) {
      surveyId = response.data.surveyId;
    } else if (response.data?.userId) {
      surveyId = response.data.userId;
    } else if (response.userId) {
      surveyId = response.userId;
    } else if (response.id) {
      surveyId = response.id;
    }

    console.log('📥 提交响应:', response);
    console.log('📥 提取的surveyId:', surveyId);

    // 如果在开发环境且没有找到surveyId，生成一个模拟ID
    if (!surveyId && process.env.NODE_ENV === 'development') {
      surveyId = 'dev-survey-' + Date.now();
      console.warn('⚠️  开发环境：使用模拟surveyId:', surveyId);
    }

    return {
      ...response,
      surveyId
    };
  }

  /**
   * 获取分析结果
   * @param {string} surveyId - 调查ID
   */
  async getAnalysisResult(surveyId) {
    console.log('📤 获取分析结果:');
    console.log('  endpoint: /analysis-result/user/' + surveyId);
    console.log('  method: GET');
    
    return this.request(`/analysis-result/user/${surveyId}`);
  }

  /**
   * 智能轮询获取分析结果（推荐使用）
   * @param {string} surveyId - 调查ID
   * @param {Object} options - 轮询选项
   * @param {number} options.maxAttempts - 最大尝试次数，默认15
   * @param {number} options.initialInterval - 初始间隔时间（毫秒），默认5000
   * @param {Function} options.onProgress - 进度回调函数
   */
  async pollAnalysisResult(surveyId, options = {}) {
    const {
      maxAttempts = 20,
      onProgress = () => {}
    } = options;

    console.log('🔄 开始轮询分析结果:', {
      surveyId,
      maxAttempts,
      strategy: '优化指数退避策略'
    });

    // 计算等待间隔的函数 - 基于您提供的时间表
    const getWaitInterval = (attempt) => {
      if (attempt <= 5) {
        // 1-5次: 10-12秒
        return 10000 + Math.random() * 2000;
      } else if (attempt <= 10) {
        // 6-10次: 12.5-14.5秒
        return 12500 + Math.random() * 2000;
      } else if (attempt <= 15) {
        // 11-15次: 15-17秒
        return 15000 + Math.random() * 2000;
      } else {
        // 16-20次: 17.5-19.5秒
        return 17500 + Math.random() * 2000;
      }
    };

    let totalWaitTime = 0;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        // 调用进度回调
        onProgress(i + 1, maxAttempts);

        const response = await fetch(`${this.baseURL}/analysis-result/user/${surveyId}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Frontend-Key': this.apiKey,
            'User-Agent': 'NeuroSnap-Frontend/1.0.0'
          }
        });

        // 处理速率限制 (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000;
          
          console.warn(`⚠️  遇到速率限制 (429)，等待 ${waitTime / 1000} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // 处理404 - 结果还未生成
        if (response.status === 404) {
          const currentInterval = getWaitInterval(i + 1);
          totalWaitTime += currentInterval;
          
          console.log(`⏳ 分析进行中 (404)，${Math.round(currentInterval / 1000)}秒后重试... (${i + 1}/${maxAttempts}) [累计: ${Math.round(totalWaitTime / 60000 * 10) / 10}分钟]`);
          await new Promise(resolve => setTimeout(resolve, currentInterval));
          continue;
        }

        // 处理其他HTTP错误
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // 忽略JSON解析错误
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('📥 轮询响应:', result);

        // 检查分析是否完成
        if (result.success && result.data.status === 'completed') {
          console.log(`✅ 分析完成！总等待时间: ${Math.round(totalWaitTime / 60000 * 10) / 10}分钟`);
          return result;
        }

        // 如果状态是not_found，继续轮询
        if (result.success && result.data.status === 'not_found') {
          const currentInterval = getWaitInterval(i + 1);
          totalWaitTime += currentInterval;
          
          console.log(`⏳ 分析进行中 (not_found)，${Math.round(currentInterval / 1000)}秒后重试... (${i + 1}/${maxAttempts}) [累计: ${Math.round(totalWaitTime / 60000 * 10) / 10}分钟]`);
          await new Promise(resolve => setTimeout(resolve, currentInterval));
          continue;
        }

        // 其他未知状态
        console.warn('⚠️  未知的响应状态:', result);
        const currentInterval = getWaitInterval(i + 1);
        totalWaitTime += currentInterval;
        await new Promise(resolve => setTimeout(resolve, currentInterval));

      } catch (error) {
        console.error(`❌ 轮询第 ${i + 1} 次失败:`, error);
        
        // 如果是最后一次尝试，抛出错误
        if (i === maxAttempts - 1) {
          throw error;
        }
        
        // 错误重试策略：使用相同的间隔策略
        const errorInterval = getWaitInterval(i + 1);
        totalWaitTime += errorInterval;
        console.warn(`🔄 ${Math.round(errorInterval / 1000)}秒后重试... [累计: ${Math.round(totalWaitTime / 60000 * 10) / 10}分钟]`);
        await new Promise(resolve => setTimeout(resolve, errorInterval));
      }
    }

    throw new Error(`分析超时：已尝试 ${maxAttempts} 次，总等待时间 ${Math.round(totalWaitTime / 60000 * 10) / 10} 分钟，请稍后手动查询结果`);
  }

  /**
   * 获取分析历史
   * @param {string} userId - 用户ID
   * @param {number} limit - 返回记录数，默认10
   * @param {number} offset - 偏移量，默认0
   */
  async getAnalysisHistory(userId, limit = 10, offset = 0) {
    console.log('📤 获取分析历史:');
    console.log('  endpoint: /analysis-result/user/' + userId + '/history');
    console.log('  method: GET');
    console.log('  params: { limit:', limit, ', offset:', offset, '}');
    
    return this.request(`/analysis-result/user/${userId}/history?limit=${limit}&offset=${offset}`);
  }

  /**
   * 获取分析摘要
   * @param {string} userId - 用户ID
   */
  async getAnalysisSummary(userId) {
    console.log('📤 获取分析摘要:');
    console.log('  endpoint: /analysis-result/user/' + userId + '/summary');
    console.log('  method: GET');
    
    return this.request(`/analysis-result/user/${userId}/summary`);
  }

  /**
   * 保存用户信息
   * @param {Object} userInfo - 用户信息对象
   * @param {string} userInfo.name - 姓名
   * @param {string} userInfo.gender - 性别 ("male" | "female")
   * @param {number} userInfo.age - 年龄
   * @param {string} userInfo.city - 城市
   * @param {string} userInfo.occupation - 职业
   * @param {string} userInfo.education - 学历
   * @param {string} userInfo.phone - 手机号
   */
  async saveUserInfo(userInfo) {
    const userData = {
      ...userInfo,
      // 添加可能需要的元数据
      createdAt: new Date().toISOString(),
      source: "web",
      version: "1.0.0"
    };
    
    // 输出详细的用户信息用于调试
    console.log('📤 保存用户信息API调用详情:');
    console.log('  endpoint: /user/info');
    console.log('  method: POST');
    console.log('  data:', userData);
    
    return this.request('/user/info', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   */
  async getUserInfo(userId) {
    return this.request(`/user/info?userId=${userId}`);
  }

  /**
   * 获取所有测试类型
   */
  async getAllModels() {
    return this.request('/survey/models');
  }

  /**
   * 提交测试答案（旧版本，保持向后兼容）
   * @param {string} userId - 用户ID
   * @param {string} modelCode - 测试类型代码
   * @param {Object} answers - 答案对象
   * @param {Object} options - 可选参数
   * 
   * 答案格式说明：
   * - single (单选): "1"
   * - multiple (多选): ["1", "3", "5"]
   * - scale (打分): 4
   * - text (文本): "我的回答"
   * - sorting (排序): {"order": [2, 1, 4, 3, 5]}
   */
  async submitAnswers(userId, modelCode, answers, options = {}) {
    const submitData = {
      userId,
      modelCode,
      answers,
      // 添加可能需要的元数据字段
      submittedAt: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Node.js',
      platform: typeof window !== 'undefined' ? window.navigator.platform : 'server',
      timestamp: Date.now(),
      version: "1.0.0",
      source: "web",
      // 添加更多可能的必填字段
      sessionId: this.sessionId,
      answerCount: Object.keys(answers).length,
      language: "zh-CN",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // 合并额外的选项
      ...options
    };
    
    // 输出详细的提交数据用于调试
    console.log('📤 提交答案API调用详情:');
    console.log('  endpoint: /answer/submit');
    console.log('  method: POST');
    console.log('  data:', submitData);
    
    return this.request('/answer/submit', {
      method: 'POST',
      body: JSON.stringify(submitData)
    });
  }

  /**
   * 触发AI分析
   * @param {Object} analysisRequest - 分析请求对象
   * @param {string} analysisRequest.modelType - 测试类型
   * @param {Array} analysisRequest.answers - 答案数组
   * @param {Array} analysisRequest.knowledgeBase - 知识库数据
   * @param {Object} analysisRequest.options - 分析选项
   */
  async triggerAnalysis(analysisRequest) {
    return this.request('/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(analysisRequest)
    });
  }

  /**
   * 获取分析状态
   * @param {string} surveyId - 调查ID
   */
  async getAnalysisStatus(surveyId) {
    return this.request(`/analysis/status/${surveyId}`);
  }

  /**
   * 轮询等待分析完成
   * @param {string} surveyId - 调查ID
   * @param {number} maxAttempts - 最大尝试次数，默认30次
   * @param {number} interval - 轮询间隔（毫秒），默认2秒
   */
  async waitForAnalysis(surveyId, maxAttempts = 30, interval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const status = await this.getAnalysisStatus(surveyId);
        
        if (status.status === 'completed') {
          return status.result;
        } else if (status.status === 'error') {
          throw new Error(status.error || '分析过程中发生错误');
        }
        
        // 等待指定间隔后再次检查
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw error;
        }
        // 继续尝试
      }
    }
    
    throw new Error('分析超时，请稍后查看结果');
  }
}

// 创建默认实例 - 使用环境变量或默认值
const getEnvVar = (name, defaultValue) => {
  // Next.js 环境变量在浏览器中通过 process.env 访问
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }
  // 浏览器环境备用方案
  if (typeof window !== 'undefined' && window.process && window.process.env) {
    return window.process.env[name] || defaultValue;
  }
  return defaultValue;
};

const neuroSnapAPI = new NeuroSnapAPI(
  getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8080/api'),
  getEnvVar('NEXT_PUBLIC_FRONTEND_API_KEY', 'test-frontend-key-123')
);

// React Hook 工具函数
const NeuroSnapHooks = {
  /**
   * 获取测试题目的 Hook
   * @param {string} modelCode - 测试类型代码
   */
  useSurveyQuestions: (modelCode) => {
    const [state, setState] = React.useState({
      questions: null,
      loading: true,
      error: null
    });

    React.useEffect(() => {
      if (!modelCode) return;

      const fetchQuestions = async () => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          const data = await neuroSnapAPI.getSurveyQuestions(modelCode);
          setState({ questions: data, loading: false, error: null });
        } catch (error) {
          setState({ questions: null, loading: false, error: error.message });
        }
      };

      fetchQuestions();
    }, [modelCode]);

    return state;
  },

  /**
   * 提交答案的 Hook
   */
  useSubmitAnswers: () => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const submitAnswers = async (userId, modelCode, answers) => {
      try {
        setLoading(true);
        setError(null);
        const result = await neuroSnapAPI.submitAnswers(userId, modelCode, answers);
        return result;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    return { submitAnswers, loading, error };
  }
};

// 使用示例
const examples = {
  /**
   * 完整的测试流程示例
   */
  async completeTestFlow() {
    try {
      // 1. 保存用户信息
      const userResult = await neuroSnapAPI.saveUserInfo({
        name: "张三",
        gender: "male",
        age: 25,
        city: "北京",
        occupation: "软件工程师",
        education: "本科",
        phone: "13812345678"
      });
      
      console.log('用户信息已保存:', userResult);
      const userId = userResult.user_id;

      // 2. 获取测试题目
      const surveyData = await neuroSnapAPI.getSurveyQuestions('mbti');
      console.log('题目获取成功:', surveyData.questions.length + '道题');

      // 3. 模拟用户答题
      const answers = {};
      surveyData.questions.forEach(question => {
        // 简单的模拟答案，实际应该是用户的真实选择
        if (question.type === 'single') {
          answers[question.question_code] = "1";
        } else if (question.type === 'multiple') {
          answers[question.question_code] = ["1", "2"];
        } else if (question.type === 'scale') {
          answers[question.question_code] = 4;
        } else if (question.type === 'text') {
          answers[question.question_code] = "这是我的回答";
        }
      });

      // 4. 提交答案
      const submitResult = await neuroSnapAPI.submitAnswers(userId, 'mbti', answers);
      console.log('答案提交成功:', submitResult);

      return {
        userId,
        surveyId: submitResult.survey_id,
        success: true
      };
    } catch (error) {
      console.error('测试流程失败:', error);
      throw error;
    }
  },

  /**
   * React 组件使用示例
   */
  ReactComponent: `
function TestPage() {
  const [selectedModel, setSelectedModel] = useState('mbti');
  const { questions, loading, error } = NeuroSnapHooks.useSurveyQuestions(selectedModel);
  const { submitAnswers, loading: submitting } = NeuroSnapHooks.useSubmitAnswers();

  const handleSubmit = async (answers) => {
    try {
      const result = await submitAnswers(userId, selectedModel, answers);
      console.log('提交成功:', result);
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h1>{questions?.model.name}</h1>
      {questions?.questions.map(question => (
        <div key={question.id}>
          <p>{question.content}</p>
          {/* 渲染选项 */}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? '提交中...' : '提交答案'}
      </button>
    </div>
  );
}
  `
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 环境
  module.exports = { NeuroSnapAPI, neuroSnapAPI, NeuroSnapHooks, examples };
} else if (typeof window !== 'undefined') {
  // 浏览器环境
  window.NeuroSnapAPI = NeuroSnapAPI;
  window.neuroSnapAPI = neuroSnapAPI;
  window.NeuroSnapHooks = NeuroSnapHooks;
  window.neuroSnapExamples = examples;
} 