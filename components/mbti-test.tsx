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

interface MbtiFormData {
  [key: string]: string
}

interface MbtiTouched {
  [key: string]: boolean
}

interface MbtiResult {
  type: string;
  scores: Record<string, number>;
}

interface MbtiData {
  [key: string]: string | MbtiResult;
}

interface MbtiProps {
  data: MbtiData;
  onDataUpdate: (data: MbtiData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function MbtiTest({ data, onDataUpdate, onNext, onPrev }: MbtiProps) {
  // 从输入数据中提取表单数据，排除 result 字段
  const initialFormData: MbtiFormData = Object.entries(data || {})
    .filter(([key]) => key !== 'result')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {});

  const [formData, setFormData] = useState<MbtiFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<MbtiTouched>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/survey-questions?model=mbti')
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
      // 计算 MBTI 结果
      const result = calculateMbtiResult()
      
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

  // 计算 MBTI 结果
  const calculateMbtiResult = () => {
    let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0

    questions.forEach((q) => {
      const answer = formData[q.question_code]
      if (!answer) return

      if (q.question_code.startsWith('mbti_ei_')) {
        if (answer === 'E') e++
        else if (answer === 'I') i++
      } else if (q.question_code.startsWith('mbti_sn_')) {
        if (answer === 'S') s++
        else if (answer === 'N') n++
      } else if (q.question_code.startsWith('mbti_tf_')) {
        if (answer === 'T') t++
        else if (answer === 'F') f++
      } else if (q.question_code.startsWith('mbti_jp_')) {
        if (answer === 'J') j++
        else if (answer === 'P') p++
      }
    })

    const type = [
      e > i ? 'E' : 'I',
      s > n ? 'S' : 'N',
      t > f ? 'T' : 'F',
      j > p ? 'J' : 'P'
    ].join('')

    return {
      type,
      scores: {
        E: e, I: i,
        S: s, N: n,
        T: t, F: f,
        J: j, P: p
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
    <div className="bg-white rounded-2xl shadow-md p-6" data-testid="mbti-test">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">MBTI 性格测试</h2>
            <p className="text-sm text-gray-500">通过回答以下问题，了解您的性格类型</p>
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
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
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
