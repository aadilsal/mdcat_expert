// ============================================================================
// Submit Quiz API Route
// ============================================================================
// POST /api/quiz/submit - Submit quiz and calculate final score
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SubmitQuizRequest, QuizSubmitResponse } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body: SubmitQuizRequest = await request.json()
        const { session_id } = body

        if (!session_id) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Verify session ownership and status
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('user_id, status, time_limit_minutes, started_at')
            .eq('id', session_id)
            .single()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        if (session.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized access to session' },
                { status: 403 }
            )
        }

        if (session.status === 'completed') {
            return NextResponse.json(
                { error: 'Quiz already submitted' },
                { status: 400 }
            )
        }

        // Calculate time taken
        const startTime = new Date(session.started_at).getTime()
        const endTime = Date.now()
        const timeTakenSeconds = Math.floor((endTime - startTime) / 1000)

        // Get quiz state for time remaining
        const { data: quizState } = await supabase
            .from('quiz_state')
            .select('time_remaining_seconds')
            .eq('session_id', session_id)
            .single()

        // Complete the quiz session using database function
        const { error: completeError } = await supabase.rpc(
            'complete_quiz_session',
            {
                p_session_id: session_id,
            }
        )

        if (completeError) {
            console.error('Error completing quiz session:', completeError)
            return NextResponse.json(
                { error: 'Failed to complete quiz' },
                { status: 500 }
            )
        }

        // Update time taken
        const { error: updateError } = await supabase
            .from('quiz_sessions')
            .update({
                time_taken_seconds: timeTakenSeconds,
                submitted_at: new Date().toISOString(),
            })
            .eq('id', session_id)

        if (updateError) {
            console.error('Error updating time taken:', updateError)
        }

        // Fetch final session data
        const { data: finalSession } = await supabase
            .from('quiz_sessions')
            .select('score, total_questions')
            .eq('id', session_id)
            .single()

        if (!finalSession) {
            return NextResponse.json(
                { error: 'Failed to fetch final results' },
                { status: 500 }
            )
        }

        const score = finalSession.score || 0
        const totalQuestions = finalSession.total_questions || 0
        const accuracyPercentage =
            totalQuestions > 0
                ? Math.round((score / totalQuestions) * 100)
                : 0

        const response: QuizSubmitResponse = {
            session_id,
            score,
            total_questions: totalQuestions,
            accuracy_percentage: accuracyPercentage,
            time_taken_seconds: timeTakenSeconds,
            correct_answers: score,
            incorrect_answers: totalQuestions - score,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Unexpected error in submit quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
