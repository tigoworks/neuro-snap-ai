// 后端API包装器 - TypeScript版本
// 用于连接后端服务和前端SDK

import { neuroSnapAPI } from './frontend-sdk.js';

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
export const checkAIStatus = () => neuroSnapAPI.checkAIStatus();
export const checkSystemHealth = () => neuroSnapAPI.checkSystemHealth();
export const getSurveyQuestions = (modelCode: string) => neuroSnapAPI.getSurveyQuestions(modelCode);
export const submitTest = (testData: any) => neuroSnapAPI.submitTest(testData);
export const getAnalysisResult = (surveyId: string) => neuroSnapAPI.getAnalysisResult(surveyId);
export const pollAnalysisResult = (surveyId: string, options?: any) => neuroSnapAPI.pollAnalysisResult(surveyId, options);
export const getAnalysisHistory = (userId: string, limit?: number, offset?: number) => neuroSnapAPI.getAnalysisHistory(userId, limit, offset);
export const getAnalysisSummary = (userId: string) => neuroSnapAPI.getAnalysisSummary(userId);

// 保持向后兼容的方法
export const submitCompleteAnswers = (testData: any) => neuroSnapAPI.submitTest(testData);

// 导出API实例
export { neuroSnapAPI }; 