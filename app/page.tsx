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
      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      handleNext()
    } catch (error) {
      console.error('提交失败:', error)
      setSubmitError('提交失败，请稍后重试')
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
