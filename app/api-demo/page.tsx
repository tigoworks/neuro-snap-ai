'use client';

import React, { useState } from 'react';
import { 
  checkAIStatus, 
  checkSystemHealth,
  getSurveyQuestions, 
  submitTest, 
  getAnalysisResult, 
  pollAnalysisResult,
  getAnalysisHistory,
  getAnalysisSummary
} from '../../lib/backend-api';

export default function APIDemo() {
  const [activeTab, setActiveTab] = useState('status');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title: string, data: any, success: boolean = true) => {
    const result = {
      id: Date.now(),
      title,
      data,
      success,
      timestamp: new Date().toLocaleString()
    };
    setResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // API状态检查
  const handleCheckAIStatus = async () => {
    setLoading(true);
    try {
      const result = await checkAIStatus();
      addResult('AI服务状态检查', result);
    } catch (error) {
      addResult('AI服务状态检查', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSystemHealth = async () => {
    setLoading(true);
    try {
      const result = await checkSystemHealth();
      addResult('系统健康状态检查', result);
    } catch (error) {
      addResult('系统健康状态检查', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  // 题目获取
  const handleGetQuestions = async (modelCode: string) => {
    setLoading(true);
    try {
      const result = await getSurveyQuestions(modelCode);
      addResult(`获取${modelCode.toUpperCase()}题目`, result);
    } catch (error) {
      addResult(`获取${modelCode.toUpperCase()}题目`, { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  // 测试提交
  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const testData = {
        userInfo: {
          name: "API演示用户",
          gender: "male",
          age: 30,
          city: "上海",
          occupation: "产品经理",
          education: "硕士",
          phone: "13900139000"
        },
        fiveQuestions: {
          fiveq_q1: "希望在产品策略方面有所突破",
          fiveq_q2: "学习用户体验设计和数据分析"
        },
        mbti: {
          mbti_ei_q1: "2",
          mbti_ei_q2: "1",
          mbti_sn_q1: "2",
          mbti_sn_q2: "1",
          mbti_tf_q1: "2",
          mbti_tf_q2: "1",
          mbti_jp_q1: "2",
          mbti_jp_q2: "1"
        },
        bigFive: {
          big5_o_q1: 5,
          big5_o_q2: 4,
          big5_c_q1: 4,
          big5_c_q2: 5,
          big5_e_q1: 4,
          big5_e_q2: 3,
          big5_a_q1: 5,
          big5_a_q2: 4,
          big5_n_q1: 2,
          big5_n_q2: 3
        },
        disc: {
          disc_d_q1: "2",
          disc_d_q2: "1",
          disc_i_q1: "1",
          disc_i_q2: "2",
          disc_s_q1: "2",
          disc_s_q2: "1",
          disc_c_q1: "2",
          disc_c_q2: "1"
        },
        holland: {
          holland_r_q1: 2,
          holland_r_q2: 3,
          holland_i_q1: 4,
          holland_i_q2: 4,
          holland_a_q1: 3,
          holland_a_q2: 4,
          holland_s_q1: 5,
          holland_s_q2: 4,
          holland_e_q1: 5,
          holland_e_q2: 5,
          holland_c_q1: 3,
          holland_c_q2: 4
        },
        values: {
          motivation_q1: ["2", "4", "6"],
          motivation_q2: ["2", "3"],
          motivation_q3: {"order": [2, 4, 1, 5, 3]},
          motivation_q4: "2",
          motivation_q5: "用户导向，数据驱动决策",
          motivation_q6: "2"
        }
      };

      const result = await submitTest(testData);
      addResult('提交完整测试', result);
    } catch (error) {
      addResult('提交完整测试', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  // 分析结果相关
  const handleGetAnalysis = async () => {
    const surveyId = prompt('请输入surveyId:');
    if (!surveyId) return;

    setLoading(true);
    try {
      const result = await getAnalysisResult(surveyId);
      addResult('获取分析结果', result);
    } catch (error) {
      addResult('获取分析结果', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  const handlePollAnalysis = async () => {
    const surveyId = prompt('请输入surveyId:');
    if (!surveyId) return;

    setLoading(true);
    try {
      const result = await pollAnalysisResult(surveyId, {
        maxAttempts: 10,
        initialInterval: 5000,
        onProgress: (current: number, total: number) => {
          console.log(`轮询进度: ${current}/${total}`);
        }
      });
      addResult('轮询分析结果', result);
    } catch (error) {
      addResult('轮询分析结果', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHistory = async () => {
    const userId = prompt('请输入userId:');
    if (!userId) return;

    setLoading(true);
    try {
      const result = await getAnalysisHistory(userId, 10, 0);
      addResult('获取分析历史', result);
    } catch (error) {
      addResult('获取分析历史', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    const userId = prompt('请输入userId:');
    if (!userId) return;

    setLoading(true);
    try {
      const result = await getAnalysisSummary(userId);
      addResult('获取分析摘要', result);
    } catch (error) {
      addResult('获取分析摘要', { error: (error as Error).message }, false);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'status', name: '系统状态', icon: '🔍' },
    { id: 'questions', name: '题目获取', icon: '📝' },
    { id: 'submit', name: '测试提交', icon: '📤' },
    { id: 'analysis', name: '分析结果', icon: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🚀 Neuro-Snap API 演示</h1>
          <p className="text-gray-600 text-lg">基于后端API文档的完整功能演示</p>
          
          {/* API配置信息 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">API配置信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Base URL:</span> 
                <code className="ml-2 bg-white px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}
                </code>
              </div>
              <div>
                <span className="font-medium">认证方式:</span> 
                <code className="ml-2 bg-white px-2 py-1 rounded">X-Frontend-Key</code>
              </div>
              <div>
                <span className="font-medium">API Key:</span> 
                <code className="ml-2 bg-white px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'test-frontend-key-123'}
                </code>
              </div>
              <div>
                <span className="font-medium">数据格式:</span> 
                <code className="ml-2 bg-white px-2 py-1 rounded">JSON</code>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* 系统状态 */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">系统状态检查</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleCheckAIStatus}
                    disabled={loading}
                    className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">🤖 AI服务状态</div>
                    <div className="text-sm opacity-90">GET /ai/status</div>
                  </button>
                  
                  <button
                    onClick={handleCheckSystemHealth}
                    disabled={loading}
                    className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">💚 系统健康检查</div>
                    <div className="text-sm opacity-90">GET /ai/health</div>
                  </button>
                </div>
              </div>
            )}

            {/* 题目获取 */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">测评题目获取</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['fiveq', 'mbti', 'big5', 'disc', 'holland', 'motivation'].map((model) => (
                    <button
                      key={model}
                      onClick={() => handleGetQuestions(model)}
                      disabled={loading}
                      className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                    >
                      <div className="text-lg font-semibold">{model.toUpperCase()}</div>
                      <div className="text-sm opacity-90">GET /survey/model?code={model}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 测试提交 */}
            {activeTab === 'submit' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">测试提交</h2>
                <button
                  onClick={handleSubmitTest}
                  disabled={loading}
                  className="bg-orange-500 text-white p-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors w-full"
                >
                  <div className="text-xl font-semibold">📤 提交完整测试数据</div>
                  <div className="text-sm opacity-90 mt-2">POST /submit-test</div>
                  <div className="text-sm opacity-75 mt-1">包含用户信息和所有6个测试模块的答案</div>
                </button>
              </div>
            )}

            {/* 分析结果 */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">分析结果管理</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleGetAnalysis}
                    disabled={loading}
                    className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">📊 获取分析结果</div>
                    <div className="text-sm opacity-90">GET /api/analysis-result/user/&#123;surveyId&#125;</div>
                  </button>
                  
                  <button
                    onClick={handlePollAnalysis}
                    disabled={loading}
                    className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">🔄 轮询分析结果</div>
                    <div className="text-sm opacity-90">智能轮询，处理速率限制</div>
                  </button>
                  
                  <button
                    onClick={handleGetHistory}
                    disabled={loading}
                    className="bg-teal-500 text-white p-4 rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">📚 获取分析历史</div>
                    <div className="text-sm opacity-90">GET /api/analysis-result/user/&#123;userId&#125;/history</div>
                  </button>
                  
                  <button
                    onClick={handleGetSummary}
                    disabled={loading}
                    className="bg-pink-500 text-white p-4 rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-lg font-semibold">📋 获取分析摘要</div>
                    <div className="text-sm opacity-90">GET /api/analysis-result/user/&#123;userId&#125;/summary</div>
                  </button>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-gray-600">API调用进行中...</p>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">操作控制</h3>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              清空结果
            </button>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-white rounded-2xl shadow-xl p-6 border-l-4 ${
                result.success ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {result.success ? '✅' : '❌'} {result.title}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {result.timestamp}
                </span>
              </div>
              
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 border">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500 text-xl">选择上方功能开始测试API</p>
            <p className="text-gray-400 mt-2">所有API调用结果将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );
} 