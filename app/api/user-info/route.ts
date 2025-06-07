import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 用户信息表字段说明：
 * id: UUID 主键
 * name: 用户姓名
 * gender: 性别（male/female/unknown）
 * age: 年龄
 * city: 所在城市
 * occupation: 职业
 * education: 学历（高中/大专/本科/硕士/博士）
 * phone: 手机号（选填）
 * submit_time: 提交时间（带时区）
 */

export async function POST(request: Request) {
  try {
    const userInfo = await request.json()

    // 转换性别格式
    const gender = userInfo.gender === '男' ? 'male' : userInfo.gender === '女' ? 'female' : 'unknown'

    // 转换年龄为数字
    const age = parseInt(userInfo.age, 10)

    const { data, error } = await supabase
      .from('user_survey')
      .insert([{
        name: userInfo.name,
        gender,
        age,
        city: userInfo.city,
        occupation: userInfo.occupation,
        education: userInfo.education,
        phone: userInfo.phone || null
      }])
      .select()

    if (error) {
      console.error('Error inserting user info:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in user info API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 