import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SurveyAnswer {
  user_survey_id: string;
  question_id: string;
  model_id: string;
  answer: any;
}

interface SurveyQuestion {
  id: string;
  model_id: string;
  question_code: string;
  type: 'single' | 'multiple' | 'scale' | 'text' | 'sorting';
}

interface SortingAnswer {
  order?: number[];
}

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const data = await request.json()

    // 验证数据
    if (!data.userInfo || !data.fiveQuestions || !data.mbti || !data.bigFive || !data.disc || !data.holland || !data.values) {
      return NextResponse.json(
        { error: '数据不完整' },
        { status: 400 }
      )
    }

    // 1. 先创建用户基本信息记录
    const { data: userSurvey, error: userError } = await supabase
      .from('user_survey')
      .insert([
        {
          name: data.userInfo.name,
          gender: data.userInfo.gender,
          age: data.userInfo.age,
          city: data.userInfo.city,
          occupation: data.userInfo.occupation,
          education: data.userInfo.education,
          phone: data.userInfo.phone,
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error('保存用户信息失败:', userError)
      return NextResponse.json(
        { error: '保存用户信息失败' },
        { status: 500 }
      )
    }

    // 2. 获取所有模型ID
    const { data: models, error: modelsError } = await supabase
      .from('survey_model')
      .select('id, code')
      .in('code', ['fiveq', 'mbti', 'big5', 'disc', 'holland', 'motivation'])

    if (modelsError) {
      console.error('获取模型信息失败:', modelsError)
      return NextResponse.json(
        { error: '获取模型信息失败' },
        { status: 500 }
      )
    }

    // 3. 获取所有题目ID
    const { data: questions, error: questionsError } = await supabase
      .from('survey_question')
      .select('id, model_id, question_code, type')
      .in('model_id', models.map(m => m.id))

    if (questionsError) {
      console.error('获取题目信息失败:', questionsError)
      return NextResponse.json(
        { error: '获取题目信息失败' },
        { status: 500 }
      )
    }

    // 4. 准备所有答案数据
    const answers: SurveyAnswer[] = []

    // 处理五问法答案
    const fiveqModel = models.find(m => m.code === 'fiveq')
    if (fiveqModel) {
      Object.entries(data.fiveQuestions).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === fiveqModel.id && q.question_code === questionCode)
        if (question) {
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: fiveqModel.id,
            answer: answer
          })
        }
      })
    }

    // 处理MBTI答案
    const mbtiModel = models.find(m => m.code === 'mbti')
    if (mbtiModel) {
      Object.entries(data.mbti).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === mbtiModel.id && q.question_code === questionCode)
        if (question) {
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: mbtiModel.id,
            answer: answer
          })
        }
      })
    }

    // 处理五大人格答案
    const big5Model = models.find(m => m.code === 'big5')
    if (big5Model) {
      Object.entries(data.bigFive).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === big5Model.id && q.question_code === questionCode)
        if (question) {
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: big5Model.id,
            answer: answer
          })
        }
      })
    }

    // 处理DISC答案
    const discModel = models.find(m => m.code === 'disc')
    if (discModel) {
      Object.entries(data.disc).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === discModel.id && q.question_code === questionCode)
        if (question) {
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: discModel.id,
            answer: answer
          })
        }
      })
    }

    // 处理霍兰德答案
    const hollandModel = models.find(m => m.code === 'holland')
    if (hollandModel) {
      Object.entries(data.holland).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === hollandModel.id && q.question_code === questionCode)
        if (question) {
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: hollandModel.id,
            answer: answer
          })
        }
      })
    }

    // 处理价值观答案
    const motivationModel = models.find(m => m.code === 'motivation')
    if (motivationModel) {
      Object.entries(data.values).forEach(([questionCode, answer]) => {
        const question = questions.find(q => q.model_id === motivationModel.id && q.question_code === questionCode)
        if (question) {
          // 如果是拖拽排序题且没有答案，使用初始顺序 [1,2,3,4,5]
          if (question.type === 'sorting' && (!answer || !(answer as SortingAnswer).order)) {
            answer = { order: [1, 2, 3, 4, 5] }
          }
          answers.push({
            user_survey_id: userSurvey.id,
            question_id: question.id,
            model_id: motivationModel.id,
            answer: answer
          })
        }
      })
    }

    // 5. 批量插入所有答案
    const { error: answersError } = await supabase
      .from('user_survey_answer')
      .insert(answers)

    if (answersError) {
      console.error('保存答案失败:', answersError)
      return NextResponse.json(
        { error: '保存答案失败' },
        { status: 500 }
      )
    }

    // 返回成功响应
    return NextResponse.json(
      { message: '测试结果保存成功' },
      { status: 200 }
    )
  } catch (error) {
    console.error('处理测试提交失败:', error)
    return NextResponse.json(
      { error: '处理测试提交失败' },
      { status: 500 }
    )
  }
} 