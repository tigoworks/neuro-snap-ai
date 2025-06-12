'use client';

import React, { useState } from 'react';
import { 
  checkAIStatus, 
  checkSystemHealth,
  getSurveyQuestions, 
  submitTest, 
  getAnalysisResult, 
  pollAnalysisResult 
} from '../lib/backend-api';

export default function BackendTest() {
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

  // 测试AI服务状态
  const testAIStatus = async () => {
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

  // 测试系统健康状态
  const testSystemHealth = async () => {
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

  // 测试获取题目
  const testGetQuestions = async () => {
    setLoading(true);
    try {
      const result = await getSurveyQuestions('mbti');
      addResult('获取MBTI题目', result);
         } catch (error) {
       addResult('获取MBTI题目', { error: (error as Error).message }, false);
     } finally {
       setLoading(false);
     }
   };

   // 测试提交完整答案
   const testSubmitComplete = async () => {
     setLoading(true);
     try {
       const testData = {
         userInfo: {
           name: "测试用户",
           gender: "male",
           age: 28,
           city: "北京",
           occupation: "软件工程师",
           education: "本科",
           phone: "13800138000"
         },
         fiveQuestions: {
           fiveq_q1: "希望在技术架构方面有所突破",
           fiveq_q2: "学习新技术，提升技术能力"
         },
         mbti: {
           mbti_ei_q1: "1",
           mbti_ei_q2: "2",
           mbti_sn_q1: "1",
           mbti_sn_q2: "2",
           mbti_tf_q1: "1",
           mbti_tf_q2: "1",
           mbti_jp_q1: "1",
           mbti_jp_q2: "1"
         },
         bigFive: {
           big5_o_q1: 4,
           big5_o_q2: 5,
           big5_c_q1: 5,
           big5_c_q2: 4,
           big5_e_q1: 3,
           big5_e_q2: 4,
           big5_a_q1: 4,
           big5_a_q2: 5,
           big5_n_q1: 2,
           big5_n_q2: 1
         },
         disc: {
           disc_d_q1: "1",
           disc_d_q2: "1",
           disc_i_q1: "2",
           disc_i_q2: "2",
           disc_s_q1: "1",
           disc_s_q2: "1",
           disc_c_q1: "1",
           disc_c_q2: "1"
         },
         holland: {
           holland_r_q1: 3,
           holland_r_q2: 4,
           holland_i_q1: 5,
           holland_i_q2: 5,
           holland_a_q1: 2,
           holland_a_q2: 2,
           holland_s_q1: 3,
           holland_s_q2: 3,
           holland_e_q1: 4,
           holland_e_q2: 3,
           holland_c_q1: 4,
           holland_c_q2: 4
         },
         values: {
           motivation_q1: ["1", "3", "5"],
           motivation_q2: ["1", "2"],
           motivation_q3: {"order": [1, 3, 5, 2, 4]},
           motivation_q4: "1",
           motivation_q5: "技术驱动创新，持续学习",
           motivation_q6: "1"
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

  // 测试获取分析结果
  const testGetAnalysis = async () => {
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

   // 测试轮询分析结果
   const testPollAnalysis = async () => {
     const surveyId = prompt('请输入surveyId:');
     if (!surveyId) return;

     setLoading(true);
     try {
       const result = await pollAnalysisResult(surveyId, {
         maxAttempts: 5,
         interval: 3000,
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

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 后端API测试工具</h1>
          
          {/* 测试按钮 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testAIStatus}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              AI状态检查
            </button>
            
            <button
              onClick={testSystemHealth}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              系统健康检查
            </button>
            
            <button
              onClick={testGetQuestions}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              获取题目
            </button>
            
            <button
              onClick={testSubmitComplete}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              提交测试
            </button>
            
            <button
              onClick={testGetAnalysis}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              获取分析结果
            </button>
            
            <button
              onClick={testPollAnalysis}
              disabled={loading}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              轮询分析结果
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              清空结果
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">测试进行中...</p>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                result.success ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {result.success ? '✅' : '❌'} {result.title}
                </h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">点击上方按钮开始测试API功能</p>
          </div>
        )}
      </div>
    </div>
  );
} 