// ============================================================================
// Get Quiz Session API Route
// ============================================================================
// GET /api/quiz/session/[sessionId] - Get quiz session data with questions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const supabase = await createClient()
        const { sessionId } = await params

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

        // Fetch quiz session
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Quiz session not found' },
                { status: 404 }
            )
        }

        // Fetch quiz details
        const { data: quiz } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', session.quiz_id)
            .single()

        // Fetch questions for this quiz
        const { data: quizQuestions } = await supabase
            .from('quiz_questions')
            .select('question_id, questions(*)')
            .eq('quiz_id', session.quiz_id)
            .order('question_order')

        const questions = quizQuestions?.map((qq: any) => qq.questions) || []

        // Fetch existing answers
        const { data: existingAnswers } = await supabase
            .from('user_answers')
            .select('question_id, selected_option')
            .eq('session_id', sessionId)

        const answerMap =
            existingAnswers?.reduce(
                (acc, ans) => {
                    acc[ans.question_id] = ans.selected_option as any
                    return acc
                },
                {} as Record<string, any>
            ) || {}

        // Fetch existing bookmarks
        const { data: existingBookmarks } = await supabase
            .from('bookmarked_questions')
            .select('question_id')
            .eq('session_id', sessionId)

        const bookmarks = existingBookmarks?.map((b) => b.question_id) || []

        // Fetch quiz state
        const { data: quizState } = await supabase
            .from('quiz_state')
            .select('*')
            .eq('session_id', sessionId)
            .single()

        return NextResponse.json({
            session,
            quiz: quiz || null,
            questions,
            existing_answers: answerMap,
            existing_bookmarks: bookmarks,
            quiz_state: quizState || null,
        })
    } catch (error) {
        console.error('Unexpected error in get session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
