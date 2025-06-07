"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, AlertCircle, Loader2 } from "lucide-react"

interface FormData {
  [key: string]: number
}

interface FormErrors {
  [key: string]: string
}

interface Question {
  id: string
  question_code: string
  content: string
  options: Array<{ code: number; label: string }> | null
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting'
  sort_order: number
  required: boolean
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

interface Big5FormData {
  [key: string]: number | Big5Scores;
}

interface Big5Props {
  data: Big5FormData;
  onDataUpdate: (data: Big5FormData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Big5Test({ data, onDataUpdate, onNext, onPrev }: Big5Props) {
  const [formData, setFormData] = useState<Big5FormData>(data || {})
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/survey-questions?model=big5')
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        const data = await response.json()
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
  const handleOptionSelect = (questionId: string, value: number) => {
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
      if (q.required && formData[q.question_code] === undefined) {
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
      // 计算五大人格结果
      const result = calculateBig5Result()
      
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

  // 计算五大人格结果
  const calculateBig5Result = (): Big5Scores => {
    let o = 0, c = 0, e = 0, a = 0, n = 0
    let oCount = 0, cCount = 0, eCount = 0, aCount = 0, nCount = 0

    questions.forEach((q) => {
      const score = formData[q.question_code]
      if (typeof score !== 'number') return

      if (q.question_code.startsWith('big5_o_')) {
        o += score
        oCount++
      } else if (q.question_code.startsWith('big5_c_')) {
        c += score
        cCount++
      } else if (q.question_code.startsWith('big5_e_')) {
        e += score
        eCount++
      } else if (q.question_code.startsWith('big5_a_')) {
        a += score
        aCount++
      } else if (q.question_code.startsWith('big5_n_')) {
        n += score
        nCount++
      }
    })

    // 计算每个维度的平均分
    const calculateAverage = (sum: number, count: number) => count > 0 ? sum / count : 0

    return {
      scores: {
        O: calculateAverage(o, oCount), // 开放性
        C: calculateAverage(c, cCount), // 尽责性
        E: calculateAverage(e, eCount), // 外向性
        A: calculateAverage(a, aCount), // 宜人性
        N: calculateAverage(n, nCount), // 神经质
      },
      descriptions: {
        O: "开放性：反映一个人的想象力、审美、感受丰富、尝新、思辨、价值观等特质",
        C: "尽责性：反映一个人的自律、条理、尽职、成就、自律、谨慎等特质",
        E: "外向性：反映一个人的热情、社交、果断、活跃、冒险、乐观等特质",
        A: "宜人性：反映一个人的信任、利他、直率、依从、谦虚、移情等特质",
        N: "神经质：反映一个人的焦虑、敌对、压抑、自我意识、冲动、脆弱等特质"
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
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">五大人格测试</h2>
            <p className="text-sm text-gray-500">通过回答以下问题，了解您的性格特质</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.question_code} className="pb-6 border-b border-gray-100 last:border-0">
              <label className="block text-base font-medium text-gray-800 mb-4">
                {index + 1}. {q.content}
              </label>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">完全不符合</span>
                <div className="flex-1 flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleOptionSelect(q.question_code, value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        formData[q.question_code] === value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">完全符合</span>
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