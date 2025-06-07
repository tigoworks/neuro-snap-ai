import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const modelCode = searchParams.get('model')

    if (!modelCode) {
      return NextResponse.json({ error: 'Model code is required' }, { status: 400 })
    }

    // 获取模型信息
    const { data: modelData, error: modelError } = await supabase
      .from('survey_model')
      .select('id, name, description')
      .eq('code', modelCode)
      .maybeSingle()

    if (modelError) {
      console.error('Error fetching model:', modelError)
      return NextResponse.json({ error: modelError.message }, { status: 500 })
    }

    if (!modelData) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // 获取该模型的所有题目
    const { data: questions, error: questionsError } = await supabase
      .from('survey_question')
      .select('*')
      .eq('model_id', modelData.id)
      .order('sort_order')

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this model' }, { status: 404 })
    }

    return NextResponse.json({
      model: modelData,
      questions: questions
    })
  } catch (error) {
    console.error('Error in survey questions API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 