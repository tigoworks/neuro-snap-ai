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
  options: Array<{ code: number; label: string }> | null
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting'
  sort_order: number
  required: boolean
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

interface HollandFormData {
  [key: string]: string | HollandScores;
}

interface HollandProps {
  data: HollandFormData;
  onDataUpdate: (data: HollandFormData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function HollandTest({ data, onDataUpdate, onNext, onPrev }: HollandProps) {
  const [formData, setFormData] = useState<HollandFormData>(data || {})
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/survey-questions?model=holland')
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        const data = await response.json()
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions)
        } else {
          throw new Error('Invalid questions data format')
        }
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
      // 计算霍兰德职业兴趣结果
      const result = calculateHollandResult()
      
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

  // 计算霍兰德职业兴趣结果
  const calculateHollandResult = (): HollandScores => {
    let r = 0, i = 0, a = 0, s = 0, e = 0, c = 0
    let rCount = 0, iCount = 0, aCount = 0, sCount = 0, eCount = 0, cCount = 0

    questions.forEach((q) => {
      const answer = formData[q.question_code]
      if (typeof answer !== 'string') return

      const score = parseInt(answer)
      if (isNaN(score)) return

      if (q.question_code.startsWith('holland_r_')) {
        r += score
        rCount++
      } else if (q.question_code.startsWith('holland_i_')) {
        i += score
        iCount++
      } else if (q.question_code.startsWith('holland_a_')) {
        a += score
        aCount++
      } else if (q.question_code.startsWith('holland_s_')) {
        s += score
        sCount++
      } else if (q.question_code.startsWith('holland_e_')) {
        e += score
        eCount++
      } else if (q.question_code.startsWith('holland_c_')) {
        c += score
        cCount++
      }
    })

    // 计算每个维度的得分（转换为百分比）
    const calculateScore = (sum: number, count: number) => count > 0 ? (sum / (count * 5)) * 100 : 0

    return {
      scores: {
        R: calculateScore(r, rCount), // 现实型
        I: calculateScore(i, iCount), // 研究型
        A: calculateScore(a, aCount), // 艺术型
        S: calculateScore(s, sCount), // 社会型
        E: calculateScore(e, eCount), // 企业型
        C: calculateScore(c, cCount), // 常规型
      },
      descriptions: {
        R: "现实型：喜欢动手操作、机械、工具、户外活动，擅长解决具体问题",
        I: "研究型：喜欢观察、学习、分析、探索，擅长逻辑思维和科学研究",
        A: "艺术型：喜欢创造、表达、想象，擅长艺术创作和审美活动",
        S: "社会型：喜欢帮助、指导、服务他人，擅长人际交往和团队合作",
        E: "企业型：喜欢领导、说服、影响他人，擅长管理和商业活动",
        C: "常规型：喜欢整理、记录、执行规则，擅长组织和行政工作"
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

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>没有可用的题目，请刷新页面重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">霍兰德职业兴趣测试</h2>
            <p className="text-sm text-gray-500">通过回答以下问题，了解您的职业兴趣类型</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.question_code} className="pb-6 border-b border-gray-100 last:border-0">
              <label className="block text-base font-medium text-gray-800 mb-4">
                {index + 1}. {q.content}
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      key={value}
                      className={`flex-1 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        formData[q.question_code] === value.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.question_code}
                        value={value}
                        checked={formData[q.question_code] === value.toString()}
                        onChange={() => handleOptionSelect(q.question_code, value.toString())}
                        className="sr-only"
                      />
                      <div className="text-lg font-medium">{value}</div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-2">
                  <span>非常不同意</span>
                  <span>非常同意</span>
                </div>
                {touched[q.question_code] && errors[q.question_code] && (
                  <p className="text-red-500 text-sm mt-1 error-message">{errors[q.question_code]}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onPrev}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
