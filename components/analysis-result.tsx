'use client';

import React, { useState, useEffect } from 'react';
import { pollAnalysisResult } from '../lib/backend-api';

interface AnalysisResultProps {
  surveyId: string;
  onBack?: () => void;
}

interface AnalysisData {
  id: string;
  userId: string;
  analysisType: string;
  summary: string;
  confidenceScore: number;
  processingTime: number;
  modelCode: string;
  createdAt: string;
  detailedAnalysis: {
    personalProfile: {
      basicInfo: string;
      careerStage: string;
      demographics: string;
    };
    testResults: {
      values: string;
      interests: string;
      personality: string;
      behaviorStyle: string;
      careerDevelopment: string;
    };
    culturalFit: {
      fitScore: number;
      matchingValues: string;
      developmentAreas: string;
    };
    strengthsAndWeaknesses: {
      strengths: string[];
      weaknesses: string[];
      actionPlan: string[];
    };
    careerRecommendations: string[];
    developmentSuggestions: string[];
  };
  recommendations: string[];
}

export default function AnalysisResult({ surveyId, onBack }: AnalysisResultProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 30 });
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      fetchAnalysisResult();
    }
  }, [surveyId]);

  const fetchAnalysisResult = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await pollAnalysisResult(surveyId, {
        maxAttempts: 30,
        interval: 2000,
        onProgress: (current: number, total: number) => {
          setProgress({ current, total });
        }
      });

      if (result.success && result.data.analysis) {
        setAnalysisData(result.data.analysis);
      } else {
        setError('分析结果格式错误');
      }
    } catch (err) {
      console.error('获取分析结果失败:', err);
      setError(err instanceof Error ? err.message : '获取分析结果失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI正在分析中...</h2>
          <p className="text-gray-600 mb-4">请稍候，我们正在为您生成个性化分析报告</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {progress.current} / {progress.total} 次尝试
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">获取结果失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchAnalysisResult}
              className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
            >
              重试
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                返回
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无分析结果</h2>
          <p className="text-gray-600 mb-6">请稍后再试</p>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">🧠 AI分析报告</h1>
            <div className="text-right">
              <div className="text-sm text-gray-500">置信度</div>
              <div className="text-2xl font-bold text-indigo-600">{analysisData.confidenceScore}%</div>
            </div>
          </div>
          
          {/* 总结 */}
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-indigo-800 mb-3">📋 个性化总结</h2>
            <p className="text-gray-700 leading-relaxed">{analysisData.summary}</p>
          </div>

          {/* 基本信息 */}
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">分析ID:</span> {analysisData.id.slice(0, 8)}...
            </div>
            <div>
              <span className="font-medium">处理时间:</span> {Math.round(analysisData.processingTime / 1000)}秒
            </div>
            <div>
              <span className="font-medium">生成时间:</span> {new Date(analysisData.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 详细分析 */}
        <div className="space-y-6">
          {/* 个人档案 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 个人档案</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">基本信息</h3>
                <p className="text-gray-600">{analysisData.detailedAnalysis.personalProfile.basicInfo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">职业阶段</h3>
                <p className="text-gray-600">{analysisData.detailedAnalysis.personalProfile.careerStage}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">人口统计</h3>
                <p className="text-gray-600">{analysisData.detailedAnalysis.personalProfile.demographics}</p>
              </div>
            </div>
          </div>

          {/* 测试结果 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 测试结果分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">💎 价值观</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.testResults.values}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">🎯 兴趣偏好</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.testResults.interests}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">🧩 性格特征</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.testResults.personality}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">🎭 行为风格</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.testResults.behaviorStyle}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">🚀 职业发展</h3>
              <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.testResults.careerDevelopment}</p>
            </div>
          </div>

          {/* 文化适配度 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 文化适配度</h2>
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold text-green-600 mr-4">
                {analysisData.detailedAnalysis.culturalFit.fitScore}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${analysisData.detailedAnalysis.culturalFit.fitScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">匹配价值观</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.culturalFit.matchingValues}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">发展领域</h3>
                <p className="text-gray-600 text-sm">{analysisData.detailedAnalysis.culturalFit.developmentAreas}</p>
              </div>
            </div>
          </div>

          {/* 优势与劣势 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">⚖️ 优势与发展空间</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">✅ 核心优势</h3>
                <ul className="space-y-2">
                  {analysisData.detailedAnalysis.strengthsAndWeaknesses.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-600 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700 mb-3">🔄 发展空间</h3>
                <ul className="space-y-2">
                  {analysisData.detailedAnalysis.strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-gray-600 text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-blue-700 mb-3">📋 行动计划</h3>
              <ul className="space-y-2">
                {analysisData.detailedAnalysis.strengthsAndWeaknesses.actionPlan.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">{index + 1}.</span>
                    <span className="text-gray-600 text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 职业建议 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💼 职业发展建议</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-purple-700 mb-3">🎯 职业推荐</h3>
                <ul className="space-y-2">
                  {analysisData.detailedAnalysis.careerRecommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-600 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-indigo-700 mb-3">📈 发展建议</h3>
                <ul className="space-y-2">
                  {analysisData.detailedAnalysis.developmentSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span className="text-gray-600 text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 综合建议 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🌟 综合建议</h2>
            <div className="grid gap-3">
              {analysisData.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="mt-8 text-center">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-gray-500 text-white py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors mr-4"
            >
              返回测试
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            打印报告
          </button>
        </div>
      </div>
    </div>
  );
} 