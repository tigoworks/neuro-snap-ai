"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, User, AlertCircle, HelpCircle, Loader2 } from "lucide-react"

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
  options: Array<{ code: number; label: string }> | null
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting'
  sort_order: number
  required: boolean
}

interface FiveQuestionsData {
  [key: string]: string
}

export default function FiveQuestions({ 
  data, 
  onDataUpdate, 
  onNext, 
  onPrev 
}: { 
  data: FiveQuestionsData;
  onDataUpdate: (data: FiveQuestionsData) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [formData, setFormData] = useState<FiveQuestionsData>(data)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/survey-questions?model=fiveq')
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

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setTouched({
      ...touched,
      [name]: true,
    })
  }

  // 处理选项点击
  const handleOptionClick = (questionId: string, option: string) => {
    setFormData({
      ...formData,
      [questionId]: option,
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
      if (q.required && (!formData[q.question_code] || formData[q.question_code].trim() === "")) {
        newErrors[q.question_code] = "请回答这个问题"
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
      onDataUpdate(formData)
      onNext()
    } else {
      // 滚动到第一个错误
      const firstError = document.querySelector(".error-message")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // 当字段被触碰时验证
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm()
    }
  }, [formData, touched])

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
    <div className="bg-white rounded-2xl shadow-md p-6" data-testid="five-questions">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">五问法</h2>
            <p className="text-sm text-gray-500">请回答以下开放性问题，帮助我们更好地了解您</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.question_code} className="pb-6 border-b border-gray-100 last:border-0">
              <label className="block text-base font-medium text-gray-800 mb-2">
                {index + 1}. {q.content}
              </label>

              {/* 快速选项 */}
              {q.options && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {q.options.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleOptionClick(q.question_code, option.label)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData[q.question_code] === option.label
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 文本输入 */}
              <div className="relative">
                <textarea
                  name={q.question_code}
                  value={formData[q.question_code] || ""}
                  onChange={handleChange}
                  placeholder="请输入您的回答..."
                  className={`w-full p-3 rounded-lg border ${
                    errors[q.question_code]
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 transition-colors`}
                  rows={3}
                />
                {errors[q.question_code] && touched[q.question_code] && (
                  <p className="mt-1 text-sm text-red-500 error-message">
                    {errors[q.question_code]}
                  </p>
                )}
              </div>
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
              data-testid="start-button"
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
