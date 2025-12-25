// ============================================================================
// AI Explanation API Route
// ============================================================================
// POST /api/quiz/results/[sessionId]/explanation
// Generate or fetch cached AI explanation for a question
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrGenerateExplanation } from '@/lib/ai/gemini-service'
import type { GenerateExplanationRequest, GenerateExplanationResponse, QuestionOption } from '@/types'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params
        const body: GenerateExplanationRequest = await request.json()
        const { question_id } = body

        if (!question_id) {
            return NextResponse.json(
                { error: 'question_id is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify session belongs to user
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('user_id, status')
            .eq('id', sessionId)
            .single()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Quiz session not found' }, { status: 404 })
        }

        if (session.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (session.status !== 'completed') {
            return NextResponse.json(
                { error: 'Quiz must be completed to view explanations' },
                { status: 400 }
            )
        }

        // Get user's answer for this question
        const { data: userAnswer, error: answerError } = await supabase
            .from('user_answers')
            .select('selected_option')
            .eq('session_id', sessionId)
            .eq('question_id', question_id)
            .single()

        if (answerError || !userAnswer) {
            return NextResponse.json(
                { error: 'Answer not found for this question' },
                { status: 404 }
            )
        }

        // Generate or fetch cached explanation
        const result = await getOrGenerateExplanation(
            question_id,
            userAnswer.selected_option as QuestionOption
        )

        const response: GenerateExplanationResponse = {
            explanation: result.explanation,
            cached: result.cached,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error generating explanation:', error)

        const errorMessage = error instanceof Error ? error.message : 'Failed to generate explanation'

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
