"use client"

import type React from "react"
import { Home, TrendingUp, ImageIcon, User } from "lucide-react"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "首页",
    icon: Home,
  },
  {
    id: "ranking",
    label: "榜单",
    icon: TrendingUp,
  },
  {
    id: "materials",
    label: "素材",
    icon: ImageIcon,
  },
  {
    id: "profile",
    label: "我的",
    icon: User,
  },
]

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 px-2 py-1 safe-area-pb">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive ? "text-green-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className={`relative transition-all duration-200 ${isActive ? "transform scale-110" : ""}`}>
                  {isActive ? (
                    <div className="p-1.5 bg-green-500 rounded-full">
                      <Icon className="w-5 h-5 text-white stroke-2" />
                    </div>
                  ) : (
                    <Icon className="w-6 h-6 stroke-1.5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-200 ${
                    isActive ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
