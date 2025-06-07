"use client"

import { useState } from "react"
import {
  Edit3,
  Settings,
  TrendingUp,
  LogOut,
  Phone,
  Crown,
  Sparkles,
  Award,
  Target,
  Gift,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  Zap,
  Brain,
  PieChart,
  Calendar,
  Bell,
  Shield,
  Rocket,
  CreditCard,
} from "lucide-react"
import Image from "next/image"

// Mock data for user profile
const userProfile = {
  avatar: "/images/avatar-1.jpg",
  storeName: "华兴果园",
  membershipLevel: "金牌店主",
  level: 4,
  experience: 8650,
  maxExperience: 10000,
  phone: "138****8888",
  points: 2680,
  memberSince: "2023年3月",
}

// Member benefits
const memberBenefits = [
  { icon: "📚", label: "经营课程", count: "免费", value: "专属" },
  { icon: "🎯", label: "营销工具", count: "无限", value: "高级版" },
]

// Today's business overview
const todayStats = {
  revenue: 2680,
  revenueGrowth: "+12%",
  orders: 45,
  ordersGrowth: "+8%",
  avgOrder: 59.6,
  avgOrderGrowth: "+3%",
  profit: 35.2,
  profitGrowth: "+2%",
}

// Smart tools
const smartTools = [
  {
    id: "ai-select",
    icon: Brain,
    label: "AI选品",
    subtitle: "智能推荐",
    color: "from-purple-500 to-indigo-600",
    count: "3",
  },
  {
    id: "pricing",
    icon: DollarSign,
    label: "智能定价",
    subtitle: "利润优化",
    color: "from-green-500 to-emerald-600",
    count: "",
  },
  {
    id: "marketing",
    icon: Sparkles,
    label: "营销素材",
    subtitle: "一键生成",
    color: "from-pink-500 to-rose-600",
    count: "12",
  },
  {
    id: "reports",
    icon: PieChart,
    label: "数据报表",
    subtitle: "经营分析",
    color: "from-teal-500 to-green-600",
    count: "",
  },
]

// Achievements
const achievements = [
  { id: 1, title: "月销破万", completed: true, icon: "💰" },
  { id: 2, title: "满意度98%", completed: true, icon: "⭐" },
  { id: 3, title: "新增50会员", completed: true, icon: "👥" },
  { id: 4, title: "30天无差评", completed: false, progress: 28, total: 30, icon: "🏆" },
]

export default function ProfilePage() {
  const [showFullPhone, setShowFullPhone] = useState(false)

  const getLevelColor = (level: number) => {
    if (level >= 5) return "from-purple-500 to-indigo-600"
    if (level >= 4) return "from-yellow-500 to-amber-600"
    if (level >= 3) return "from-blue-500 to-cyan-600"
    if (level >= 2) return "from-green-500 to-emerald-600"
    return "from-gray-400 to-slate-500"
  }

  const getLevelIcon = (level: number) => {
    if (level >= 5) return Crown
    if (level >= 4) return Award
    if (level >= 3) return Target
    return Target
  }

  const LevelIcon = getLevelIcon(userProfile.level)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-green-100/50">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">我的</h1>
        </div>
      </header>

      <main className="px-6 py-4">
        {/* Combined User Profile & Member Benefits Section */}
        <div className="mb-5 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-200/20 to-transparent rounded-full blur-2xl"></div>

          {/* User Basic Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={userProfile.avatar || "/placeholder.svg"}
                  alt="头像"
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-sm">🍎</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{userProfile.storeName}</h2>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold whitespace-nowrap bg-gradient-to-r ${getLevelColor(userProfile.level)} text-white shadow-md`}
                  >
                    <LevelIcon className="w-4 h-4" />
                    {userProfile.membershipLevel}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{showFullPhone ? "13812345678" : userProfile.phone}</span>
                  </div>
                  <button
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    className="text-xs text-green-600 hover:text-green-700 ml-3"
                  >
                    {showFullPhone ? "隐藏" : "显示"}
                  </button>
                </div>
              </div>
            </div>
            <button className="p-3 hover:bg-white/60 rounded-xl transition-all duration-300">
              <Edit3 className="w-5 h-5 text-gray-400 hover:text-green-500" />
            </button>
          </div>

          {/* Member Points & Level Progress */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 mb-4 border border-amber-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl shadow-md">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium">会员积分</p>
                  <p className="text-2xl font-bold text-amber-900">{userProfile.points}</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                积分商城
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">等级进度</span>
                <span className="text-xs text-amber-700">
                  {userProfile.experience}/{userProfile.maxExperience}
                </span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(userProfile.experience / userProfile.maxExperience) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                距离钻石店主还需 {userProfile.maxExperience - userProfile.experience} 经验
              </p>
            </div>

            <div className="pt-3 border-t border-amber-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-800 font-medium">会员到期时间</span>
                <span className="text-sm text-amber-900 font-semibold">2024年3月15日</span>
              </div>
            </div>
          </div>

          {/* Member Benefits */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">会员权益</h3>
              </div>
              <button className="text-sm text-green-600 font-medium hover:text-green-700">查看全部</button>
            </div>

            <div className="flex gap-4">
              {memberBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:bg-white/70 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{benefit.icon}</span>
                    <span className="font-bold text-gray-900">{benefit.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-semibold">{benefit.count}</span>
                    {benefit.value && <span className="text-sm text-gray-500">{benefit.value}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Business Overview */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">今日经营</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">销售额</p>
                  <p className="text-2xl font-bold">¥{todayStats.revenue}</p>
                  <p className="text-xs opacity-75">{todayStats.revenueGrowth}</p>
                </div>
                <DollarSign className="w-7 h-7 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">订单数</p>
                  <p className="text-2xl font-bold">{todayStats.orders}</p>
                  <p className="text-xs opacity-75">{todayStats.ordersGrowth}</p>
                </div>
                <Package className="w-7 h-7 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">客单价</p>
                  <p className="text-2xl font-bold">¥{todayStats.avgOrder}</p>
                  <p className="text-xs opacity-75">{todayStats.avgOrderGrowth}</p>
                </div>
                <Users className="w-7 h-7 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">毛利率</p>
                  <p className="text-2xl font-bold">{todayStats.profit}%</p>
                  <p className="text-xs opacity-75">{todayStats.profitGrowth}</p>
                </div>
                <TrendingUp className="w-7 h-7 opacity-80" />
              </div>
            </div>
          </div>

          {/* Quick Alert */}
          <div className="p-3 bg-amber-50/80 rounded-xl border-l-4 border-amber-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">苹果库存不足，建议补货</span>
            </div>
          </div>
        </div>

        {/* Smart Tools */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">智能工具</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {smartTools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/80 transition-all duration-300 border border-white/50 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-3 bg-gradient-to-r ${tool.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {tool.count && (
                      <div className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">{tool.count}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {tool.label}
                    </h4>
                    <p className="text-sm text-gray-500">{tool.subtitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">本月成就</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  achievement.completed ? "bg-green-50/80 border-green-200 shadow-sm" : "bg-white/40 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{achievement.icon}</span>
                  <span className={`font-bold ${achievement.completed ? "text-green-800" : "text-gray-600"}`}>
                    {achievement.title}
                  </span>
                </div>
                {achievement.progress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>进度</span>
                      <span>
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Growth Zone (formerly Personal Service) */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">成长专区</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-green-50/80 hover:bg-green-100/80 rounded-xl transition-colors border border-green-100/50">
              <div className="text-center">
                <div className="text-2xl mb-2">📰</div>
                <p className="font-bold text-gray-900">行业资讯</p>
              </div>
            </button>
            <button className="p-4 bg-purple-50/80 hover:bg-purple-100/80 rounded-xl transition-colors border border-purple-100/50">
              <div className="text-center">
                <div className="text-2xl mb-2">🎓</div>
                <p className="font-bold text-gray-900">经营课程</p>
              </div>
            </button>
          </div>
        </div>

        {/* Settings & Footer */}
        <div className="border-t border-green-100/50 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">设置管理</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="flex items-center gap-3 p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors border border-white/50">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">消息通知</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-colors border border-white/50">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">隐私安全</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500 font-medium">果搭搭 v1.2.4 企业版</span>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all">
              <LogOut className="w-4 h-4" />
              安全退出
            </button>
          </div>
        </div>

        <div className="h-6"></div>
      </main>
    </div>
  )
}
