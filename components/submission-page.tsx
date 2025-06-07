"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, Shield, Mail, MessageSquare } from "lucide-react"

export default function SubmissionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-4 text-gray-800"
      >
        测试已完成！
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 mb-8 max-w-xs"
      >
        感谢您完成这份详细的性格测试，AI 正在分析您的数据，为您生成专属的个性分析报告。
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-blue-800">分析进行中</h3>
            <p className="text-sm text-blue-600">预计需要 2-3 个工作日完成分析</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-green-800">报告发送</h3>
            <p className="text-sm text-green-600">完成后将通过邮件或短信通知您</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-purple-800">后续咨询</h3>
            <p className="text-sm text-purple-600">如有疑问，可联系我们的专业顾问</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-800">隐私承诺</h3>
        </div>
        <p className="text-sm text-gray-600">
          您的所有数据都经过加密处理，仅用于生成个性分析报告，我们承诺不会将您的个人信息泄露给任何第三方。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8"
      >
        <p className="text-xs text-gray-500">如果您有任何问题，请联系客服：service@example.com</p>
      </motion.div>

      {/* 动画效果 */}
      <motion.div
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  )
}
