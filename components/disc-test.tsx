"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, AlertCircle, Loader2 } from "lucide-react"

interface FormData {
  [key: string]: string
}

interface FormErrors {
  [key: string]: string
}

interface Question {
  id: string
  question_code: string
  content: string
  options: Array<{ code: number; label: string }>
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting'
  sort_order: number
  required: boolean
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

interface DiscFormData {
  [key: string]: string | DiscScores;
}

interface DiscProps {
  data: DiscFormData;
  onDataUpdate: (data: DiscFormData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function DiscTest({ data, onDataUpdate, onNext, onPrev }: DiscProps) {
  const [formData, setFormData] = useState<DiscFormData>(data || {})
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // 使用新的SDK获取DISC题目
        const { sdk } = await import('@/lib/backend-api')
        const data = await sdk.getSurveyQuestions('disc')
        setQuestions(data.questions)
      } catch (error) {
        console.error('Error fetching questions:', error)
        setError('获取题目失败，请刷新页面重试')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  // 处理选项选择
  const handleOptionSelect = (questionId: string, value: string) => {
    setFormData({
      ...formData,
      [questionId]: value,
    })
    setTouched({
      ...touched,
      [questionId]: true,
    })
  }

  // 验证表单
  const validateForm = () => {
    const newErrors: FormErrors = {}

    questions.forEach((q) => {
      if (q.required && !formData[q.question_code]) {
        newErrors[q.question_code] = "请选择一个选项"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 标记所有字段为已触碰
    const allTouched: Record<string, boolean> = {}
    questions.forEach((q) => {
      allTouched[q.question_code] = true
    })
    setTouched(allTouched)

    if (validateForm()) {
      // 计算 DISC 结果
      const result = calculateDiscResult()
      
      // 更新数据，包括原始答案和计算结果
      onDataUpdate({
        ...formData,
        result: result,
      })

      onNext()
    } else {
      // 滚动到第一个错误
      const firstError = document.querySelector(".error-message")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // 计算 DISC 结果
  const calculateDiscResult = (): DiscScores => {
    let d = 0, i = 0, s = 0, c = 0
    let dCount = 0, iCount = 0, sCount = 0, cCount = 0

    questions.forEach((q) => {
      const answer = formData[q.question_code]
      if (typeof answer !== 'string') return

      if (q.question_code.startsWith('disc_d_')) {
        if (answer === 'D') {
          d += 1
          dCount++
        }
      } else if (q.question_code.startsWith('disc_i_')) {
        if (answer === 'I') {
          i += 1
          iCount++
        }
      } else if (q.question_code.startsWith('disc_s_')) {
        if (answer === 'S') {
          s += 1
          sCount++
        }
      } else if (q.question_code.startsWith('disc_c_')) {
        if (answer === 'C') {
          c += 1
          cCount++
        }
      }
    })

    // 计算每个维度的得分
    const calculateScore = (sum: number, count: number) => count > 0 ? (sum / count) * 100 : 0

    return {
      scores: {
        D: calculateScore(d, dCount), // 支配型
        I: calculateScore(i, iCount), // 影响型
        S: calculateScore(s, sCount), // 稳健型
        C: calculateScore(c, cCount), // 谨慎型
      },
      descriptions: {
        D: "支配型：喜欢挑战、果断、直接、结果导向、喜欢掌控",
        I: "影响型：乐观、热情、善于表达、喜欢社交、富有感染力",
        S: "稳健型：耐心、可靠、合作、忠诚、善于倾听",
        C: "谨慎型：精确、系统、分析、注重细节、追求完美"
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">加载题目中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">DISC 性格测试</h2>
            <p className="text-sm text-gray-500">通过回答以下问题，了解您的行为风格</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.question_code} className="pb-6 border-b border-gray-100 last:border-0">
              <label className="block text-base font-medium text-gray-800 mb-4">
                {index + 1}. {q.content}
              </label>

              <div className="space-y-3">
                {q.options.map((option) => (
                  <label
                    key={option.code}
                    className={`block w-full p-4 rounded-lg border cursor-pointer transition-all ${
                      formData[q.question_code] === option.label
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-200 hover:bg-green-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={q.question_code}
                        value={option.label}
                        checked={formData[q.question_code] === option.label}
                        onChange={() => handleOptionSelect(q.question_code, option.label)}
                        className="w-5 h-5"
                      />
                      <span>{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {errors[q.question_code] && touched[q.question_code] && (
                <p className="mt-2 text-sm text-red-500 error-message">
                  {errors[q.question_code]}
                </p>
              )}
            </div>
          ))}

          {/* 导航按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              data-testid="back-button"
              onClick={onPrev}
              className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              style={{
                background: 'white',
                color: '#374151',
                border: '1px solid #D1D5DB'
              }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <button
              type="submit"
              data-testid="next-button"
              className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-md transition-all"
              style={{
                background: 'linear-gradient(to right, #14b8a6, #3b82f6)',
                color: 'white'
              }}
            >
              <span>下一步</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
