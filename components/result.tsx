"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, AlertCircle, Users } from "lucide-react"

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