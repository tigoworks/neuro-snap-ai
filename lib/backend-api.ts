// 后端API集成文件
// 用于连接后端服务和前端SDK

// 获取环境变量
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY;

// 检查环境变量是否设置
if (!API_BASE_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL 未设置，请在.env.local中配置');
}

if (!FRONTEND_API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_FRONTEND_API_KEY 未设置，请在.env.local中配置');
}

// 基础API配置
export const apiConfig = {
  baseURL: API_BASE_URL,
  apiKey: FRONTEND_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FRONTEND_API_KEY}`,
  },
};

// 通用API请求函数
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`🚀 API请求: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API响应成功:', data);
    return data;
  } catch (error) {
    console.error('❌ API请求失败:', error);
    throw error;
  }
}

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

// 导入SDK
let NeuroSnapAPI: any = null;
let neuroSnapAPI: any = null;
let NeuroSnapHooks: any = null;

try {
  // 动态导入SDK
  const sdk = require('./frontend-sdk.js');
  NeuroSnapAPI = sdk.NeuroSnapAPI;
  neuroSnapAPI = sdk.neuroSnapAPI;
  NeuroSnapHooks = sdk.NeuroSnapHooks;
  console.log('✅ Frontend SDK 加载成功');
} catch (error) {
  console.warn('⚠️ Frontend SDK 未找到，请确保已将SDK文件复制到lib文件夹');
}

// 重新导出SDK相关功能
export { NeuroSnapAPI, neuroSnapAPI, NeuroSnapHooks };

// SDK包装函数，提供更便捷的API
export const sdk = {
  // 用户相关
  saveUserInfo: (userInfo: any) => neuroSnapAPI?.saveUserInfo(userInfo),
  getUserInfo: (userId: string) => neuroSnapAPI?.getUserInfo(userId),
  
  // 测试相关
  getSurveyQuestions: (modelCode: string) => neuroSnapAPI?.getSurveyQuestions(modelCode),
  getAllModels: () => neuroSnapAPI?.getAllModels(),
  submitAnswers: (userId: string, modelCode: string, answers: any) => 
    neuroSnapAPI?.submitAnswers(userId, modelCode, answers),
  submitCompleteAnswers: (completeAnswers: any) => 
    neuroSnapAPI?.submitCompleteAnswers(completeAnswers),
  
  // 分析相关
  triggerAnalysis: (analysisRequest: any) => neuroSnapAPI?.triggerAnalysis(analysisRequest),
  getAnalysisStatus: (surveyId: string) => neuroSnapAPI?.getAnalysisStatus(surveyId),
  waitForAnalysis: (surveyId: string, maxAttempts?: number, interval?: number) => 
    neuroSnapAPI?.waitForAnalysis(surveyId, maxAttempts, interval),
  getAnalysisResult: (surveyId: string) => neuroSnapAPI?.getAnalysisResult(surveyId),
  pollAnalysisResult: (
    surveyId: string, 
    options?: {
      maxAttempts?: number;
      interval?: number;
      onProgress?: (attempt: number, maxAttempts: number) => void;
    }
  ) => neuroSnapAPI?.pollAnalysisResult(surveyId, options),
};

// 获取分析结果
export async function getAnalysisResult(surveyId: string) {
  return await sdk.getAnalysisResult(surveyId);
}

// 轮询获取分析结果
export async function pollAnalysisResult(
  surveyId: string, 
  options?: {
    maxAttempts?: number;
    interval?: number;
    onProgress?: (attempt: number, maxAttempts: number) => void;
  }
) {
  return await sdk.pollAnalysisResult(surveyId, options);
} 