"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, AlertCircle, Heart, GripVertical, Loader2 } from "lucide-react"

interface Question {
  id: string;
  question_code: string;
  content: string;
  options: Array<{ code: number; label: string }> | null;
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting';
  sort_order: number;
  required: boolean;
}

interface ValuesData {
  [key: string]: string[] | string;
}

interface ValuesTestProps {
  data: ValuesData;
  onDataUpdate: (data: ValuesData) => void;
  onSubmit: () => Promise<void>;
  onPrev: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export default function ValuesTest({ 
  data, 
  onDataUpdate, 
  onSubmit, 
  onPrev,
  isSubmitting,
  submitError 
}: ValuesTestProps) {
  const [formData, setFormData] = useState<ValuesData>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [draggedItem, setDraggedItem] = useState<{ item: string; questionId: string } | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/survey-questions?model=motivation')
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

  // 处理多选题
  const handleMultipleSelect = (questionId: string, option: string) => {
    const currentValues = (formData[questionId] as string[]) || []
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v: string) => v !== option)
      : [...currentValues, option]

    setFormData({
      ...formData,
      [questionId]: newValues,
    })
    setTouched({
      ...touched,
      [questionId]: true,
    })
  }

  // 处理单选题
  const handleSingleSelect = (questionId: string, option: string) => {
    setFormData({
      ...formData,
      [questionId]: option,
    })
    setTouched({
      ...touched,
      [questionId]: true,
    })
  }

  // 处理文本输入
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  // 处理拖拽排序
  const handleDragStart = (e: React.DragEvent, item: string, questionId: string) => {
    setDraggedItem({ item, questionId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetItem: string, questionId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.questionId !== questionId) return

    const question = questions.find((q) => q.question_code === questionId)
    if (!question || !question.options) return

    const currentOrder = (formData[questionId] as string[]) || question.options.map(opt => opt.label)
    const draggedIndex = currentOrder.indexOf(draggedItem.item)
    const targetIndex = currentOrder.indexOf(targetItem)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedItem.item)

    setFormData({
      ...formData,
      [questionId]: newOrder,
    })
    setTouched({
      ...touched,
      [questionId]: true,
    })

    setDraggedItem(null)
  }

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    questions.forEach((q) => {
      if (q.required) {
        if (q.type === "multiple") {
          if (!formData[q.question_code] || (formData[q.question_code] as string[]).length === 0) {
            newErrors[q.question_code] = "请至少选择一个选项"
          }
        } else if (q.type === "single") {
          if (!formData[q.question_code]) {
            newErrors[q.question_code] = "请选择一个选项"
          }
        } else if (q.type === "text") {
          if (!formData[q.question_code] || (formData[q.question_code] as string).trim() === "") {
            newErrors[q.question_code] = "请填写这个问题"
          }
        } else if (q.type === "sorting") {
          if (!formData[q.question_code] || (formData[q.question_code] as string[]).length !== q.options?.length) {
            newErrors[q.question_code] = "请完成排序"
          }
        }
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
      onSubmit()
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
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">价值观测试</h2>
            <p className="text-sm text-gray-500">通过回答以下问题，了解您的价值观</p>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.question_code} className="pb-6 border-b border-gray-100 last:border-0">
              <label className="block text-base font-medium text-gray-800 mb-4">
                {index + 1}. {q.content}
              </label>

              <div className="space-y-3">
                {q.type === "multiple" && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((option) => (
                      <label
                        key={option.code}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          (formData[q.question_code] as string[])?.includes(option.label)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={q.question_code}
                          value={option.label}
                          checked={(formData[q.question_code] as string[])?.includes(option.label)}
                          onChange={() => handleMultipleSelect(q.question_code, option.label)}
                          className="sr-only"
                        />
                        <div className="flex-1">{option.label}</div>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "single" && q.options && (
                  <div className="space-y-3">
                    {q.options.map((option) => (
                      <label
                        key={option.code}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData[q.question_code] === option.label
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.question_code}
                          value={option.label}
                          checked={formData[q.question_code] === option.label}
                          onChange={() => handleSingleSelect(q.question_code, option.label)}
                          className="sr-only"
                        />
                        <div className="flex-1">{option.label}</div>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "text" && (
                  <textarea
                    name={q.question_code}
                    value={formData[q.question_code] as string || ''}
                    onChange={handleTextChange}
                    placeholder={q.options?.[0]?.label}
                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    rows={4}
                  />
                )}

                {q.type === "sorting" && q.options && (
                  <div className="space-y-2">
                    {((formData[q.question_code] as string[]) || q.options.map(opt => opt.label)).map((item, index) => (
                      <div
                        key={item}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, q.question_code)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item, q.question_code)}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-move"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span className="flex-1">{item}</span>
                        <span className="text-sm text-gray-500">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

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
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  提交答卷
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
