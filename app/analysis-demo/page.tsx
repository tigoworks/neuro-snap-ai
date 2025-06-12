'use client';

import React, { useState } from 'react';
import AnalysisResult from '../../components/analysis-result';

export default function AnalysisDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoSurveyId, setDemoSurveyId] = useState('');

  const handleStartDemo = () => {
    // 使用示例surveyId
    const exampleSurveyId = 'd16f36ea-f9ae-415c-8f97-d39aa96803fc';
    setDemoSurveyId(exampleSurveyId);
    setShowDemo(true);
  };

  if (showDemo && demoSurveyId) {
    return (
      <AnalysisResult 
        surveyId={demoSurveyId}
        onBack={() => {
          setShowDemo(false);
          setDemoSurveyId('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🧠 分析结果演示</h1>
        <p className="text-gray-600 mb-6">
          点击下方按钮查看AI分析结果页面的效果演示
        </p>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-700 mb-2">演示功能：</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 轮询获取分析结果</li>
              <li>• 显示加载进度</li>
              <li>• 完整的分析报告展示</li>
              <li>• 个性化建议和推荐</li>
              <li>• 打印功能</li>
            </ul>
          </div>
          
          <button
            onClick={handleStartDemo}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            开始演示
          </button>
          
          <div className="text-xs text-gray-500">
            注意：这是演示页面，会使用示例数据
          </div>
        </div>
      </div>
    </div>
  );
} 