"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, AlertCircle, BarChart3 } from "lucide-react"

export default function BigFiveTest({ data, onDataUpdate, onNext, onPrev }) {
  const [formData, setFormData] = useState(data || {})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // 五大人格测试题目
  const questions = [
    {
      id: "o1",
      dimension: "开放性",
      question: "我喜欢尝试新事物和新体验",
    },
    {
      id: "o2",
      dimension: "开放性",
      question: "我对艺术、音乐或文学有浓厚的兴趣",
    },
    {
      id: "c1",
      dimension: "尽责性",
      question: "我做事有计划，注重细节",
    },
    {
      id: "c2",
      dimension: "尽责性",
      question: "我会坚持完成任务，即使遇到困难",
    },
    {
      id: "e1",
      dimension: "外向性",
      question: "我喜欢成为关注的焦点",
    },
    {
      id: "e2",
      dimension: "外向性",
      question: "我在社交场合感到自在和充满活力",
    },
    {
      id: "a1",
      dimension: "宜人性",
      question: "我关心他人的感受和需求",
    },
    {
      id: "a2",
      dimension: "宜人性",
      question: "我愿意帮助他人，即使没有回报",
    },
    {
      id: "n1",
      dimension: "神经质",
      question: "我容易感到焦虑或担忧",
      reverse: true,
    },
    {
      id: "n2",
      dimension: "神经质",
      question: "我的情绪波动较大",
      reverse: true,
    },
  ]

  // 处理滑块变化
  const handleSliderChange = (questionId, value) => {
    setFormData({
      ...formData,
      [questionId]: Number.parseInt(value),
    })
    setTouched({
      ...touched,
      [questionId]: true,
    })
  }

  // 验证表单
  const validateForm = () => {
    const newErrors = {}

    questions.forEach((q) => {
      if (formData[q.id] === undefined) {
        newErrors[q.id] = "请选择一个评分"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()

    // 标记所有字段为已触碰
    const allTouched = {}
    questions.forEach((q) => {
      allTouched[q.id] = true
    })
    setTouched(allTouched)

    if (validateForm()) {
      // 计算五大人格结果
      const result = calculateBigFiveResult()

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
  const calculateBigFiveResult = () => {
    let o = 0,
      c = 0,
      e = 0,
      a = 0,
      n = 0
    let oCount = 0,
      cCount = 0,
      eCount = 0,
      aCount = 0,
      nCount = 0

    questions.forEach((q) => {
      const score = formData[q.id]
      if (score === undefined) return

      const adjustedScore = q.reverse ? 6 - score : score

      if (q.id.startsWith("o")) {
        o += adjustedScore
        oCount++
      } else if (q.id.startsWith("c")) {
        c += adjustedScore
        cCount++
      } else if (q.id.startsWith("e")) {
        e += adjustedScore
        eCount++
      } else if (q.id.startsWith("a")) {
        a += adjustedScore
        aCount++
      } else if (q.id.startsWith("n")) {
        n += adjustedScore
        nCount++
      }
    })

    return {
      openness: oCount > 0 ? o / oCount : 0,
      conscientiousness: cCount > 0 ? c / cCount : 0,
      extraversion: eCount > 0 ? e / eCount : 0,
      agreeableness: aCount > 0 ? a / aCount : 0,
      neuroticism: nCount > 0 ? n / nCount : 0,
    }
  }

  // 当字段被触碰时验证
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm()
    }
  }, [formData, touched])

  // 获取评分标签
  const getScoreLabel = (score) => {
    switch (score) {
      case 1:
        return "非常不符合"
      case 2:
        return "不太符合"
      case 3:
        return "一般"
      case 4:
        return "比较符合"
      case 5:
        return "非常符合"
      default:
        return "请选择"
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6" data-testid="big-five-test">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">五大人格测试</h2>
            <p className="text-sm text-gray-500">请根据符合程度进行评分（1-5分）</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id} className="pb-6 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <h3 className="text-base font-medium text-gray-800">{q.question}</h3>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                  <span>非常不符合</span>
                  <span>非常符合</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={formData[q.id] || ""}
                  onChange={(e) => handleSliderChange(q.id, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSliderChange(q.id, num)}
                      className={`w-8 h-8 rounded-full text-sm flex items-center justify-center ${
                        formData[q.id] === num
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="text-center mt-2">
                  <span className={`text-sm font-medium ${formData[q.id] ? "text-blue-600" : "text-gray-400"}`}>
                    {formData[q.id] ? getScoreLabel(formData[q.id]) : "请选择评分"}
                  </span>
                </div>
              </div>

              {errors[q.id] && touched[q.id] && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1 error-message">
                  <AlertCircle className="w-3 h-3" /> {errors[q.id]}
                </p>
              )}
            </div>
          ))}

          {/* 导航按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
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
