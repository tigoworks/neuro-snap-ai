'use client';

import { useState, useEffect } from 'react';
import { checkBackendHealth, apiRequest, apiConfig, sdk, neuroSnapAPI } from '@/lib/backend-api';

export default function BackendTest() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fiveQResult, setFiveQResult] = useState<string>('');
  const [mbtiResult, setMbtiResult] = useState<string>('');
  const [submitResult, setSubmitResult] = useState<string>('');
  const [result, setResult] = useState<{ title: string; data: any; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查后端健康状态
    checkBackendHealth().then(setIsHealthy);
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('测试中...');

    try {
      // 测试1: 检查SDK是否加载
      if (!neuroSnapAPI) {
        throw new Error('SDK未正确加载');
      }
      
      // 测试2: 获取所有测试模型
      const targetUrl = `${apiConfig.baseURL}/api/survey/models`;
      const models = await sdk.getAllModels();
      setTestResult(`✅ SDK连接成功!\n\n调用URL: ${targetUrl}\n\n可用的测试模型:\n${JSON.stringify(models, null, 2)}`);
      
    } catch (error: any) {
      // 如果SDK测试失败，尝试直接API测试
      try {
        const targetUrl = `${apiConfig.baseURL}/api/survey/models`;
        const response = await apiRequest('/api/survey/models', {
          method: 'GET',
        });
        setTestResult(`✅ 直接API连接成功，但SDK可能有问题:\n\n调用URL: ${targetUrl}\n\n响应数据:\n${JSON.stringify(response, null, 2)}\n\nSDK错误: ${error.message}`);
      } catch (apiError: any) {
        setTestResult(`❌ 连接失败:\n\n调用URL: ${apiConfig.baseURL}/api/survey/models\n\nSDK错误: ${error.message}\nAPI错误: ${apiError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testFiveQuestions = async () => {
    setLoading(true);
    setFiveQResult('测试五问法API...');

    try {
      // 获取五问法测试题目
      const targetUrl = `${apiConfig.baseURL}/api/survey/model?code=fiveq`;
      const fiveQData = await sdk.getSurveyQuestions('fiveq');
      setFiveQResult(`✅ 五问法API测试成功!\n\n调用URL: ${targetUrl}\n\n模型信息:\n${JSON.stringify(fiveQData.model, null, 2)}\n\n题目数量: ${fiveQData.questions.length}道\n\n第一道题:\n${JSON.stringify(fiveQData.questions[0], null, 2)}`);
    } catch (error: any) {
      const targetUrl = `${apiConfig.baseURL}/api/survey/model?code=fiveq`;
      setFiveQResult(`❌ 五问法API测试失败:\n\n调用URL: ${targetUrl}\n\n错误信息: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMBTI = async () => {
    setLoading(true);
    setMbtiResult('测试MBTI API...');

    try {
      // 获取MBTI测试题目
      const targetUrl = `${apiConfig.baseURL}/api/survey/model?code=mbti`;
      const mbtiData = await sdk.getSurveyQuestions('mbti');
      setMbtiResult(`✅ MBTI API测试成功!\n\n调用URL: ${targetUrl}\n\n模型信息:\n${JSON.stringify(mbtiData.model, null, 2)}\n\n题目数量: ${mbtiData.questions.length}道\n\n第一道题:\n${JSON.stringify(mbtiData.questions[0], null, 2)}`);
    } catch (error: any) {
      const targetUrl = `${apiConfig.baseURL}/api/survey/model?code=mbti`;
      setMbtiResult(`❌ MBTI API测试失败:\n\n调用URL: ${targetUrl}\n\n错误信息: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSubmitAnswers = async () => {
    setLoading(true);
    setSubmitResult('测试完整答案提交...');

    try {
      // 1. 准备用户信息
      const userInfo = {
        name: "测试用户",
        gender: "male",
        age: 25,  // 年龄是数字类型
        city: "北京",
        occupation: "测试工程师",
        education: "本科",
        phone: "13800138000"
      };
      
      console.log('=== 准备测试数据 ===')
      console.log('用户信息:', userInfo)

      // 2. 构造完整的答案数据，符合API文档要求
      const completeAnswers = {
        userInfo,
        fiveQuestions: {
          "fiveq_q1": "我希望在工作中获得更多的技术挑战",
          "fiveq_q2": "最近学习了前端开发技术"
        },
        mbti: {
          "mbti_ei_q1": "1",
          "mbti_ei_q2": "2",
          "mbti_sn_q1": "1",
          "mbti_sn_q2": "2",
          "mbti_tf_q1": "1",
          "mbti_tf_q2": "2",
          "mbti_jp_q1": "1",
          "mbti_jp_q2": "2"
        },
        bigFive: {
          "big5_o_q1": 4,
          "big5_o_q2": 3,
          "big5_c_q1": 5,
          "big5_c_q2": 4,
          "big5_e_q1": 3,
          "big5_e_q2": 2,
          "big5_a_q1": 4,
          "big5_a_q2": 5,
          "big5_n_q1": 2,
          "big5_n_q2": 1
        },
        disc: {
          "disc_d_q1": "1",
          "disc_d_q2": "2",
          "disc_i_q1": "1",
          "disc_i_q2": "2",
          "disc_s_q1": "1",
          "disc_s_q2": "2",
          "disc_c_q1": "1",
          "disc_c_q2": "2"
        },
        holland: {
          "holland_r_q1": 2,
          "holland_r_q2": 3,
          "holland_i_q1": 4,
          "holland_i_q2": 5,
          "holland_a_q1": 3,
          "holland_a_q2": 2,
          "holland_s_q1": 4,
          "holland_s_q2": 3,
          "holland_e_q1": 5,
          "holland_e_q2": 4,
          "holland_c_q1": 2,
          "holland_c_q2": 1
        },
        values: {
          "motivation_q1": ["1", "3", "5"],
          "motivation_q2": ["2", "4"],
          "motivation_q3": ["1", "2", "3"],
          "motivation_q4": "视为学习机会",
          "motivation_q5": "追求卓越",
          "motivation_q6": "执行者"
        }
      };

      console.log('=== 完整答案数据统计 ===')
      console.log('用户信息字段:', Object.keys(completeAnswers.userInfo).length, '个')
      console.log('五问法答案:', Object.keys(completeAnswers.fiveQuestions).length, '个')
      console.log('MBTI答案:', Object.keys(completeAnswers.mbti).length, '个')
      console.log('大五人格答案:', Object.keys(completeAnswers.bigFive).length, '个')
      console.log('DISC答案:', Object.keys(completeAnswers.disc).length, '个')
      console.log('霍兰德答案:', Object.keys(completeAnswers.holland).length, '个')
      console.log('价值观答案:', Object.keys(completeAnswers.values).length, '个')

      // 3. 提交完整答案
      const submitUrl = `${apiConfig.baseURL}/api/answer/submit`;
      console.log('=== 提交完整答案 ===')
      console.log('API调用:', submitUrl)
      console.log('提交数据:', completeAnswers)
      
      const submitResult = await sdk.submitCompleteAnswers(completeAnswers);
      console.log('提交结果:', submitResult)

      setSubmitResult(`✅ 完整答案提交测试成功!\n\n调用URL: ${submitUrl}\n\n数据统计:\n- 用户信息: ${Object.keys(completeAnswers.userInfo).length}个字段\n- 五问法: ${Object.keys(completeAnswers.fiveQuestions).length}个答案\n- MBTI: ${Object.keys(completeAnswers.mbti).length}个答案\n- 大五人格: ${Object.keys(completeAnswers.bigFive).length}个答案\n- DISC: ${Object.keys(completeAnswers.disc).length}个答案\n- 霍兰德: ${Object.keys(completeAnswers.holland).length}个答案\n- 价值观: ${Object.keys(completeAnswers.values).length}个答案\n\n提交结果:\n${JSON.stringify(submitResult, null, 2)}`);
      
    } catch (error: any) {
      const submitUrl = `${apiConfig.baseURL}/api/answer/submit`;
      setSubmitResult(`❌ 完整答案提交测试失败:\n\n调用URL: ${submitUrl}\n\n错误信息: ${error.message}\n\n错误详情: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试获取分析结果
  const testGetAnalysisResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用一个示例surveyId进行测试
      const testSurveyId = 'd16f36ea-f9ae-415c-8f97-d39aa96803fc';
      
      console.log('🔍 测试获取分析结果:', testSurveyId);
      
      const result = await sdk.getAnalysisResult(testSurveyId);
      
      setResult({
        title: '获取分析结果测试',
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('获取分析结果测试失败:', err);
      setError(err instanceof Error ? err.message : '获取分析结果测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试轮询分析结果
  const testPollAnalysisResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用一个示例surveyId进行测试
      const testSurveyId = 'd16f36ea-f9ae-415c-8f97-d39aa96803fc';
      
      console.log('🔄 测试轮询分析结果:', testSurveyId);
      
      const result = await sdk.pollAnalysisResult(testSurveyId, {
        maxAttempts: 5,
        interval: 1000,
        onProgress: (current, total) => {
          console.log(`轮询进度: ${current}/${total}`);
        }
      });
      
      setResult({
        title: '轮询分析结果测试',
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('轮询分析结果测试失败:', err);
      setError(err instanceof Error ? err.message : '轮询分析结果测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试完整提交
  const testCompleteSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建测试数据
      const testData = {
        userInfo: {
          name: "测试用户",
          age: 25,
          gender: "male",
          education: "本科",
          occupation: "软件工程师",
          location: "北京"
        },
        fiveQuestions: {
          q1: "我希望在技术领域有所突破",
          q2: "学习新的编程语言和框架",
          q3: "成为技术专家",
          q4: "解决复杂的技术问题",
          q5: "在团队中发挥技术领导作用"
        },
        mbti: {
          q1: "A",
          q2: "B", 
          q3: "A",
          q4: "B",
          q5: "A"
        },
        bigFive: {
          q1: 4,
          q2: 3,
          q3: 5,
          q4: 4,
          q5: 3
        },
        disc: {
          q1: "D",
          q2: "I",
          q3: "S", 
          q4: "C",
          q5: "D"
        },
        holland: {
          q1: "I",
          q2: "R",
          q3: "A",
          q4: "S",
          q5: "E"
        },
        values: {
          q1: "成就感",
          q2: "技术专长",
          q3: "团队合作",
          q4: "创新",
          q5: "学习成长"
        }
      };
      
      console.log('🧪 测试完整提交:', testData);
      
      const result = await sdk.submitCompleteAnswers(testData);
      
      console.log('✅ 完整提交测试结果:', result);
      
      setResult({
        title: '完整提交测试',
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('完整提交测试失败:', err);
      setError(err instanceof Error ? err.message : '完整提交测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">后端服务连接测试</h3>
      
      {/* 配置信息 */}
      <div className="mb-4 p-4 bg-white rounded border">
        <h4 className="font-medium mb-2">配置信息:</h4>
        <p><strong>API地址:</strong> {apiConfig.baseURL || '未设置'}</p>
        <p><strong>API密钥:</strong> {apiConfig.apiKey ? '已设置' : '未设置'}</p>
        <p><strong>API密钥值:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{apiConfig.apiKey || '未设置'}</code></p>
        <p className="mt-2">
          <strong>健康状态:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            isHealthy === true ? 'bg-green-100 text-green-800' :
            isHealthy === false ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {isHealthy === true ? '✅ 正常' : 
             isHealthy === false ? '❌ 异常' : 
             '⏳ 检查中...'}
          </span>
        </p>
      </div>

      {/* API端点信息 */}
      <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-medium mb-2">API端点地址:</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><strong>健康检查:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/health</code></div>
          <div><strong>获取所有模型:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/api/survey/models</code></div>
          <div><strong>获取五问法题目:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/api/survey/model?code=fiveq</code></div>
          <div><strong>获取MBTI题目:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/api/survey/model?code=mbti</code></div>
          <div><strong>提交答案:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/api/answer/submit</code></div>
          <div><strong>保存用户信息:</strong> <code className="ml-2 bg-white px-2 py-1 rounded">{apiConfig.baseURL}/api/user/info</code></div>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试基本连接'}
        </button>
        
        <button
          onClick={testFiveQuestions}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试五问法API'}
        </button>

        <button
          onClick={testMBTI}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试MBTI API'}
        </button>

        <button
          onClick={testSubmitAnswers}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试答案提交'}
        </button>
      </div>

      {/* 测试结果 */}
      {testResult && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">基本连接测试结果:</h4>
          <pre className="text-sm overflow-auto">{testResult}</pre>
        </div>
      )}

      {/* 五问法测试结果 */}
      {fiveQResult && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">五问法API测试结果:</h4>
          <pre className="text-sm overflow-auto">{fiveQResult}</pre>
        </div>
      )}

      {/* MBTI测试结果 */}
      {mbtiResult && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">MBTI API测试结果:</h4>
          <pre className="text-sm overflow-auto">{mbtiResult}</pre>
        </div>
      )}

      {/* 答案提交测试结果 */}
      {submitResult && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">答案提交测试结果:</h4>
          <pre className="text-sm overflow-auto">{submitResult}</pre>
        </div>
      )}

             {/* 提交和分析结果测试按钮 */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
         <button
           onClick={testCompleteSubmission}
           disabled={loading}
           className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
         >
           测试完整提交
         </button>
         
         <button
           onClick={testGetAnalysisResult}
           disabled={loading}
           className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
         >
           测试获取分析结果
         </button>
         
         <button
           onClick={testPollAnalysisResult}
           disabled={loading}
           className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
         >
           测试轮询分析结果
         </button>
       </div>

      {/* 分析结果测试结果 */}
      {result && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">分析结果测试结果:</h4>
          <p>{result.title}</p>
          <p>时间: {result.timestamp}</p>
          <pre className="text-sm overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="mt-4 p-4 bg-red-500 text-white rounded border">
          <h4 className="font-medium mb-2">错误信息:</h4>
          <pre className="text-sm overflow-auto">{error}</pre>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-medium mb-2">使用说明:</h4>
        <ul className="text-sm space-y-1">
          <li>1. 确保后端服务在 http://localhost:8080 运行</li>
          <li>2. 在 .env.local 中设置正确的 API_KEY</li>
          <li>3. 将 frontend-sdk.js 文件复制到 lib/ 文件夹</li>
          <li>4. 重启 Next.js 开发服务器以加载环境变量</li>
        </ul>
      </div>
    </div>
  );
} 