"use client"

import { motion } from "framer-motion"
import { Sparkles, ChevronRight } from "lucide-react"
import Image from "next/image"

interface WelcomePageProps {
  onNext: () => void;
}

export default function WelcomePage({ onNext }: WelcomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-30 h-30 rounded-full flex items-center justify-center mx-auto shadow-lg bg-gray-50">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-20 h-20"
            priority
          />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-4 text-gray-800 leading-tight"
      >
        了解你自己，解锁你的潜力画像
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 mb-8 max-w-xs"
      >
        通过这份全面的性格测试，探索你的内在世界，获取专属个性AI分析报告，发现你的潜能。
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-800">全面性格测评</h3>
            <p className="text-sm text-gray-600">包含MBTI、五大人格、DISC等多维度测试</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Brain"
              width={100}
              height={100}
              className="w-5 h-5"
              priority
            />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-800">AI个性分析</h3>
            <p className="text-sm text-gray-600">提交后获取AI生成的专属性格分析报告</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-6 text-xs text-gray-500"
      >
        预计完成时间：约8-10分钟
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        onClick={onNext}
        data-testid="start-test-button"
        className="mt-6 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-gray-900 font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
      >
        <span>开始测试</span>
        <ChevronRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
      </motion.button>

    </div>
  )
}
