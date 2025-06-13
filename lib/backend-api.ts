// 后端API包装器 - TypeScript版本
// 用于连接后端服务和前端SDK

// 动态导入SDK以支持不同环境
let NeuroSnapAPI: any;
let neuroSnapAPI: any;

// 获取环境变量，如果未设置则使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'test-frontend-key-123';

// 初始化函数
async function initializeAPI() {
  if (!neuroSnapAPI) {
    try {
      const sdk = require('./frontend-sdk.js');
      NeuroSnapAPI = sdk.NeuroSnapAPI;
      
      // 创建API实例
      neuroSnapAPI = new NeuroSnapAPI(API_BASE_URL, FRONTEND_API_KEY);
    } catch (error) {
      console.error('初始化API失败:', error);
      throw error;
    }
  }
  return neuroSnapAPI;
}

// 基础API配置
export const apiConfig = {
  baseURL: API_BASE_URL,
  apiKey: FRONTEND_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'X-Frontend-Key': FRONTEND_API_KEY,
  },
};

// 后端服务健康检查
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('后端服务不可用:', error);
    return false;
  }
}

// 导出所有API方法，提供TypeScript类型支持
export const checkAIStatus = async () => {
  const api = await initializeAPI();
  return api.checkAIStatus();
};

export const checkSystemHealth = async () => {
  const api = await initializeAPI();
  return api.checkSystemHealth();
};

export const getSurveyQuestions = async (modelCode: string) => {
  const api = await initializeAPI();
  return api.getSurveyQuestions(modelCode);
};

export const submitTest = async (testData: any) => {
  const api = await initializeAPI();
  return api.submitTest(testData);
};

export const getAnalysisResult = async (surveyId: string) => {
  const api = await initializeAPI();
  return api.getAnalysisResult(surveyId);
};

export const pollAnalysisResult = async (surveyId: string, options?: any) => {
  const api = await initializeAPI();
  return api.pollAnalysisResult(surveyId, options);
};

export const getAnalysisHistory = async (userId: string, limit?: number, offset?: number) => {
  const api = await initializeAPI();
  return api.getAnalysisHistory(userId, limit, offset);
};

export const getAnalysisSummary = async (userId: string) => {
  const api = await initializeAPI();
  return api.getAnalysisSummary(userId);
};

// 保持向后兼容的方法
export const submitCompleteAnswers = async (testData: any) => {
  const api = await initializeAPI();
  return api.submitTest(testData);
};

// 导出API实例获取函数
export const getNeuroSnapAPI = initializeAPI;

// 为了向后兼容，导出一个sdk对象
export const sdk = {
  checkAIStatus,
  checkSystemHealth,
  getSurveyQuestions,
  submitTest,
  getAnalysisResult,
  pollAnalysisResult,
  getAnalysisHistory,
  getAnalysisSummary,
  submitCompleteAnswers
}; 