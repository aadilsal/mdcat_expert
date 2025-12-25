// ============================================================================
// Regenerate Explanation API Route
// ============================================================================
// POST /api/quiz/results/[sessionId]/regenerate
// Regenerate AI explanation (bypasses cache, rate limited)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerateExplanation } from '@/lib/ai/gemini-service'
import type { RegenerateExplanationRequest, RegenerateExplanationResponse } from '@/types'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params
        const body: RegenerateExplanationRequest = await request.json()
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
                { error: 'Quiz must be completed to regenerate explanations' },
                { status: 400 }
            )
        }

        // Regenerate explanation with rate limiting
        const result = await regenerateExplanation(user.id, question_id, sessionId)

        const response: RegenerateExplanationResponse = {
            explanation: result.explanation,
            regenerations_remaining: result.remainingRegenerations,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error regenerating explanation:', error)

        const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate explanation'
        const statusCode = errorMessage.includes('Rate limit') ? 429 : 500

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        )
    }
}
