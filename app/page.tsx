"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Info, ChevronRight } from "lucide-react"
import WelcomePage from "@/components/welcome-page"
import UserInfoForm from "@/components/user-info-form"
import FiveQuestions from "@/components/five-questions"
import MbtiTest from "@/components/mbti-test"
import Big5Test from "@/components/big5-test"
import DiscTest from "@/components/disc-test"
import HollandTest from "@/components/holland-test"
import ValuesTest from "@/components/values-test"
import SubmissionPage from "@/components/submission-page"
import ProgressBar from "@/components/progress-bar"
import { useRouter } from "next/navigation"
import AnalysisResult from '../components/analysis-result'

// 定义所有测试数据的类型
interface UserInfo {
  name: string;
  age: string;
  gender: string;
  education: string;
  occupation: string;
  city: string;
  phone: string;
  [key: string]: string;
}

interface FiveQuestionsData {
  [key: string]: string;
}

interface MbtiResult {
  type: string;
  scores: Record<string, number>;
}

interface MbtiData {
  [key: string]: string | MbtiResult;
}

interface Big5Scores {
  scores: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  descriptions: {
    O: string;
    C: string;
    E: string;
    A: string;
    N: string;
  };
}

interface Big5Data {
  [key: string]: number | Big5Scores;
}

interface DiscScores {
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  descriptions: {
    D: string;
    I: string;
    S: string;
    C: string;
  };
}

interface DiscData {
  [key: string]: string | DiscScores;
}

interface HollandScores {
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  descriptions: {
    R: string;
    I: string;
    A: string;
    S: string;
    E: string;
    C: string;
  };
}

interface HollandData {
  [key: string]: string | HollandScores;
}

interface ValuesData {
  [key: string]: string | string[];
}

interface FormData {
  userInfo: UserInfo;
  fiveQuestions: FiveQuestionsData;
  mbti: MbtiData;
  bigFive: Big5Data;
  disc: DiscData;
  holland: HollandData;
  values: ValuesData;
}

// 定义测试阶段
const STAGES = ["welcome", "userInfo", "fiveQuestions", "mbti", "bigFive", "disc", "holland", "values", "submission"] as const
type Stage = typeof STAGES[number]

export default function PersonalityTest() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState<number>(0)
  const [formData, setFormData] = useState<FormData>({
    userInfo: {
      name: "",
      age: "",
      gender: "",
      education: "",
      occupation: "",
      city: "",
      phone: "",
    },
    fiveQuestions: {},
    mbti: {},
    bigFive: {},
    disc: {},
    holland: {},
    values: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showAnalysisResult, setShowAnalysisResult] = useState(false)
  const [surveyId, setSurveyId] = useState<string | null>(null)

  useEffect(() => {
    console.log('PersonalityTest mounted');
    console.log('Current stage:', STAGES[currentStage]);
    return () => {
      console.log('PersonalityTest unmounted');
    };
  }, [currentStage]);

  // 处理数据更新
  const handleDataUpdate = (stage: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
    console.log('Updating data for stage:', stage);
    setFormData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        ...data
      }
    }))
  }

  // 处理下一步
  const handleNext = () => {
    console.log('Moving to next stage');
    console.log('Current stage before update:', STAGES[currentStage]);
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(prev => {
        const nextStage = prev + 1;
        console.log('Next stage will be:', STAGES[nextStage]);
        return nextStage;
      });
    }
  }

  // 处理上一步
  const handlePrev = () => {
    console.log('Moving to previous stage');
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
    }
  }

  // 处理提交
  const handleSubmit = async () => {
    console.log('Submitting form data');
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // 使用新的SDK提交测试数据
      const { sdk } = await import('@/lib/backend-api')
      
      // 清理数据，移除计算结果，只保留原始答案
      const cleanAnswers = (data: any) => {
        const cleaned: any = {}
        Object.keys(data).forEach(key => {
          // 跳过计算结果（如 result, scores 等）
          if (key !== 'result' && key !== 'scores' && typeof data[key] !== 'object') {
            cleaned[key] = data[key]
          }
        })
        return cleaned
      }
      
      // 准备用户信息 - 转换格式以符合API要求
      const userInfo = {
        name: formData.userInfo.name,
        gender: formData.userInfo.gender === '男' ? 'male' : 
                formData.userInfo.gender === '女' ? 'female' : 
                formData.userInfo.gender, // 保持原值如果已经是 male/female
        age: parseInt(formData.userInfo.age) || 0,  // 转换为数字
        city: formData.userInfo.city,
        occupation: formData.userInfo.occupation,
        education: formData.userInfo.education,
        phone: formData.userInfo.phone || undefined
      }
      
      // 构造完整的提交数据，符合API文档要求
      const completeAnswers = {
        userInfo,
        fiveQuestions: cleanAnswers(formData.fiveQuestions),
        mbti: cleanAnswers(formData.mbti),
        bigFive: cleanAnswers(formData.bigFive),
        disc: cleanAnswers(formData.disc),
        holland: cleanAnswers(formData.holland),
        values: cleanAnswers(formData.values)
      }
      
      console.log('=== 完整答案提交 ===')
      console.log('API调用: POST /api/answer/submit')
      console.log('提交数据:', completeAnswers)
      console.log('数据统计:')
      console.log('  - 用户信息:', Object.keys(completeAnswers.userInfo).length, '个字段')
      console.log('  - 五问法答案:', Object.keys(completeAnswers.fiveQuestions).length, '个')
      console.log('  - MBTI答案:', Object.keys(completeAnswers.mbti).length, '个')
      console.log('  - 大五人格答案:', Object.keys(completeAnswers.bigFive).length, '个')
      console.log('  - DISC答案:', Object.keys(completeAnswers.disc).length, '个')
      console.log('  - 霍兰德答案:', Object.keys(completeAnswers.holland).length, '个')
      console.log('  - 价值观答案:', Object.keys(completeAnswers.values).length, '个')
      
      // 调用新的完整提交API
      const result = await sdk.submitCompleteAnswers(completeAnswers)
      console.log('提交成功:', result)
      
      // 更灵活地处理响应格式
      let extractedSurveyId = null;
      
      if (result && typeof result === 'object') {
        // 尝试多种可能的响应格式
        if (result.success && result.data && result.data.surveyId) {
          extractedSurveyId = result.data.surveyId;
        } else if (result.data && result.data.userId) {
          extractedSurveyId = result.data.userId; // 有些API可能返回userId作为surveyId
        } else if (result.surveyId) {
          extractedSurveyId = result.surveyId;
        } else if (result.userId) {
          extractedSurveyId = result.userId;
        } else if (result.id) {
          extractedSurveyId = result.id;
        }
      }
      
      console.log('🔍 提取的surveyId:', extractedSurveyId);
      console.log('📋 完整响应结构:', JSON.stringify(result, null, 2));
      
      if (extractedSurveyId) {
        setSurveyId(extractedSurveyId)
        setShowAnalysisResult(true)
        console.log('🎉 提交完成，开始显示分析结果:', extractedSurveyId)
      } else {
        // 如果没有找到surveyId，显示详细的错误信息
        console.error('❌ 无法从响应中提取surveyId');
        console.error('响应内容:', result);
        
        // 临时解决方案：如果是开发环境且后端不可用，使用模拟surveyId
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 开发模式：使用模拟surveyId进行测试');
          const mockSurveyId = 'd16f36ea-f9ae-415c-8f97-d39aa96803fc';
          setSurveyId(mockSurveyId);
          setShowAnalysisResult(true);
          console.log('🎉 使用模拟surveyId显示分析结果:', mockSurveyId);
          return; // 跳过错误抛出
        }
        
        throw new Error(`提交响应格式错误: 无法找到surveyId。响应: ${JSON.stringify(result)}`)
      }
      
      handleNext()
    } catch (error) {
      console.error('提交失败:', error)
      const errorMessage = error instanceof Error ? error.message : '提交失败，请稍后重试'
      setSubmitError(`提交失败: ${errorMessage}`)
      
      // 如果是响应格式错误，显示更详细的信息
      if (errorMessage.includes('提交响应格式错误')) {
        console.log('🔍 详细错误分析:');
        console.log('- 错误类型: 响应格式不匹配');
        console.log('- 建议: 检查后端API是否正确返回surveyId');
        console.log('- 可能的解决方案:');
        console.log('  1. 检查后端API文档');
        console.log('  2. 验证API响应格式');
        console.log('  3. 确认surveyId字段名称');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染当前阶段的组件
  const renderCurrentStage = () => {
    console.log('Rendering stage:', STAGES[currentStage]);
    switch (STAGES[currentStage]) {
      case "welcome":
        return <WelcomePage onNext={handleNext} />
      case "userInfo":
        return (
          <UserInfoForm
            data={formData.userInfo}
            onDataUpdate={(data: Partial<UserInfo>) => handleDataUpdate("userInfo", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "fiveQuestions":
        return (
          <FiveQuestions
            data={formData.fiveQuestions}
            onDataUpdate={(data: FiveQuestionsData) => handleDataUpdate("fiveQuestions", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "mbti":
        return (
          <MbtiTest
            data={formData.mbti}
            onDataUpdate={(data: MbtiData) => handleDataUpdate("mbti", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "bigFive":
        return (
          <Big5Test
            data={formData.bigFive}
            onDataUpdate={(data: Big5Data) => handleDataUpdate("bigFive", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "disc":
        return (
          <DiscTest
            data={formData.disc}
            onDataUpdate={(data: DiscData) => handleDataUpdate("disc", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "holland":
        return (
          <HollandTest
            data={formData.holland}
            onDataUpdate={(data: HollandData) => handleDataUpdate("holland", data)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case "values":
        return (
          <ValuesTest
            data={formData.values}
            onDataUpdate={(data: ValuesData) => handleDataUpdate("values", data)}
            onSubmit={handleSubmit}
            onPrev={handlePrev}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )
      case "submission":
        return <SubmissionPage />
      default:
        return null
    }
  }

  if (showAnalysisResult && surveyId) {
    return (
      <AnalysisResult 
        surveyId={surveyId}
        onBack={() => {
          setShowAnalysisResult(false)
          setSurveyId(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <ProgressBar currentStage={currentStage} totalStages={STAGES.length} />
        </div>
        {renderCurrentStage()}
      </div>
    </div>
  )
}
