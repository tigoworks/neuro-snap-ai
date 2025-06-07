"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, User, AlertCircle, Loader2 } from "lucide-react"

interface UserInfo {
  name: string;
  gender: string;
  age: string;
  city: string;
  occupation: string;
  education: string;
  phone?: string;
  [key: string]: string | undefined;
}

interface FormErrors {
  name?: string;
  gender?: string;
  age?: string;
  city?: string;
  occupation?: string;
  education?: string;
  phone?: string;
}

interface UserInfoFormProps {
  data: UserInfo;
  onDataUpdate: (data: UserInfo) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function UserInfoForm({ data, onDataUpdate, onNext, onPrev }: UserInfoFormProps) {
  const [formData, setFormData] = useState<UserInfo>(data)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setTouched({
      ...touched,
      [name]: true,
    })
  }

  // 验证表单
  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.name) newErrors.name = "请输入您的姓名"
    if (!formData.gender) newErrors.gender = "请选择您的性别"
    if (!formData.age) newErrors.age = "请输入您的年龄"
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = "请输入有效的年龄"
    }
    if (!formData.city) newErrors.city = "请输入您所在的城市"
    if (!formData.occupation) newErrors.occupation = "请输入您的职业"
    if (!formData.education) newErrors.education = "请选择您的学历"

    // 手机号是可选的，但如果填写了，需要验证格式
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "请输入有效的手机号码"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    // 标记所有字段为已触碰
    const allTouched: Record<string, boolean> = {}
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    if (validateForm()) {
      try {
        // 确保传递完整的数据
        onDataUpdate({ ...formData })
        onNext()
      } catch (error) {
        console.error('Error updating form data:', error)
        setSubmitError(error instanceof Error ? error.message : '更新表单数据失败')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
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

  // 页面加载完成后打印日志
  useEffect(() => {
    // 使用 setTimeout 确保在 DOM 完全渲染后执行
    setTimeout(() => {
      console.log('=== 用户信息表单页面 ===')
      console.log('页面标题:', document.title)
      console.log('当前URL:', window.location.href)
      console.log('=== 按钮信息 ===')
      const nextButton = document.querySelector('button[type="submit"]')
      const backButton = document.querySelector('button[type="button"]')
      
      console.log('下一步按钮:', {
        element: nextButton,
        computedStyle: nextButton ? window.getComputedStyle(nextButton) : null,
        classes: nextButton?.className
      })
      
      console.log('返回按钮:', {
        element: backButton,
        computedStyle: backButton ? window.getComputedStyle(backButton) : null,
        classes: backButton?.className
      })
    }, 100)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">基本信息</h2>
            <p className="text-sm text-gray-500">请填写您的个人基本信息</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 姓名 */}
          <div>
            <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              id="name-input"
              type="text"
              name="name"
              data-testid="name-input"
              value={formData.name || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name && touched.name ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="请输入您的真实姓名"
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <div className="flex gap-4">
              <label
                htmlFor="gender-male"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                  formData.gender === "男"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-700"
                } cursor-pointer transition-colors`}
              >
                <input
                  id="gender-male"
                  type="radio"
                  name="gender"
                  data-testid="gender-male"
                  value="男"
                  checked={formData.gender === "男"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span>男</span>
              </label>
              <label
                htmlFor="gender-female"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                  formData.gender === "女"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-700"
                } cursor-pointer transition-colors`}
              >
                <input
                  id="gender-female"
                  type="radio"
                  name="gender"
                  data-testid="gender-female"
                  value="女"
                  checked={formData.gender === "女"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span>女</span>
              </label>
            </div>
            {errors.gender && touched.gender && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.gender}
              </p>
            )}
          </div>

          {/* 年龄 */}
          <div>
            <label htmlFor="age-input" className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input
              id="age-input"
              type="number"
              name="age"
              data-testid="age-input"
              value={formData.age || ""}
              onChange={handleChange}
              min="1"
              max="120"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.age && touched.age ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="请输入您的年龄"
            />
            {errors.age && touched.age && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.age}
              </p>
            )}
          </div>

          {/* 城市 */}
          <div>
            <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-1">城市</label>
            <input
              id="city-input"
              type="text"
              name="city"
              data-testid="city-input"
              value={formData.city || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.city && touched.city ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="请输入您所在的城市"
            />
            {errors.city && touched.city && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.city}
              </p>
            )}
          </div>

          {/* 职业 */}
          <div>
            <label htmlFor="occupation-input" className="block text-sm font-medium text-gray-700 mb-1">职业</label>
            <input
              id="occupation-input"
              type="text"
              name="occupation"
              data-testid="occupation-input"
              value={formData.occupation || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.occupation && touched.occupation ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="请输入您的职业"
            />
            {errors.occupation && touched.occupation && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.occupation}
              </p>
            )}
          </div>

          {/* 学历 */}
          <div>
            <label htmlFor="education-select" className="block text-sm font-medium text-gray-700 mb-1">学历</label>
            <select
              id="education-select"
              name="education"
              data-testid="education-select"
              value={formData.education || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.education && touched.education ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <option value="">请选择您的学历</option>
              <option value="高中">高中</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
            {errors.education && touched.education && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.education}
              </p>
            )}
          </div>

          {/* 手机号 */}
          <div>
            <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">手机号（选填）</label>
            <input
              id="phone-input"
              type="tel"
              name="phone"
              data-testid="phone-input"
              value={formData.phone || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone && touched.phone ? "border-red-300 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="请输入您的手机号"
            />
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1 error-message" data-testid="error-message">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </p>
            </div>
          )}

          {/* 导航按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              data-testid="back-button"
              onClick={onPrev}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(to right, #14b8a6, #3b82f6)',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <span>下一步</span>
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