import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 测试答案表字段说明：
 * id: 自增主键
 * created_at: 记录创建时间（UTC时区）
 * user_info_id: 关联的用户信息ID
 * question_id: 问题ID
 * answer: 答案选项（A/B/C/D/E）
 * 
 * DISC测试答案表字段说明：
 * id: 自增主键
 * created_at: 记录创建时间（UTC时区）
 * user_info_id: 关联的用户信息ID
 * question_id: 问题ID
 * most: 最符合的选项（A/B/C/D/E）
 * least: 最不符合的选项（A/B/C/D/E）
 */

export async function POST(request: Request) {
  try {
    const { userInfoId, answers, discAnswers } = await request.json()

    // 开始事务
    const { data: testData, error: testError } = await supabase
      .from('test_answers')
      .insert(
        answers.map((answer: any) => ({
          user_info_id: userInfoId,
          question_id: answer.questionId,
          answer: answer.answer
        }))
      )
      .select()

    if (testError) {
      console.error('Error inserting test answers:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    // 如果有DISC答案，也保存
    if (discAnswers && discAnswers.length > 0) {
      const { data: discData, error: discError } = await supabase
        .from('disc_answers')
        .insert(
          discAnswers.map((answer: any) => ({
            user_info_id: userInfoId,
            question_id: answer.questionId,
            most: answer.most,
            least: answer.least
          }))
        )
        .select()

      if (discError) {
        console.error('Error inserting DISC answers:', discError)
        return NextResponse.json({ error: discError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      testData,
      discData: discAnswers ? await supabase.from('disc_answers').select() : null
    })
  } catch (error) {
    console.error('Error in test answers API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 