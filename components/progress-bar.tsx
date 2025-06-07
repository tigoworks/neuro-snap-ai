"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  currentStage: number;
  totalStages: number;
}

export default function ProgressBar({ currentStage, totalStages }: ProgressBarProps) {
  const progress = Math.round((currentStage / (totalStages - 1)) * 100)

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <motion.div
        className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}
