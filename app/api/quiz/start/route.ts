// ============================================================================
// Start Quiz API Route
// ============================================================================
// POST /api/quiz/start - Start a new quiz session
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuizStartResponse, StartQuizByIdRequest } from '@/types'

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

        const body: StartQuizByIdRequest = await request.json()
        const { quiz_id } = body

        if (!quiz_id) {
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            )
        }

        // Check for existing in-progress session for this quiz
        const { data: existingSessions } = await supabase
            .from('quiz_sessions')
            .select('id, quiz_state(*)')
            .eq('user_id', user.id)
            .eq('quiz_id', quiz_id)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false })
            .limit(1)

        // If there's an existing session, return it for resume
        if (existingSessions && existingSessions.length > 0) {
            const existingSession = existingSessions[0]

            // Fetch questions for this quiz
            const { data: quizQuestions } = await supabase
                .from('quiz_questions')
                .select('question_id, questions(*)')
                .eq('quiz_id', quiz_id)
                .order('question_order')

            const questions =
                quizQuestions?.map((qq: any) => qq.questions) || []

            // Fetch existing answers
            const { data: existingAnswers } = await supabase
                .from('user_answers')
                .select('question_id, selected_option')
                .eq('session_id', existingSession.id)

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
                .eq('session_id', existingSession.id)

            const bookmarks =
                existingBookmarks?.map((b) => b.question_id) || []

            // Fetch quiz details
            const { data: quiz } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', quiz_id)
                .single()

            const response: QuizStartResponse = {
                session_id: existingSession.id,
                quiz: quiz || null,
                questions,
                time_limit_minutes: quiz?.time_limit_minutes || 60,
                existing_answers: answerMap,
                existing_bookmarks: bookmarks,
                quiz_state: (existingSession as any).quiz_state?.[0] || null,
            }

            return NextResponse.json(response)
        }

        // Create new quiz session using database function
        const { data: sessionId, error: createError } = await supabase.rpc(
            'create_quiz_session',
            {
                p_user_id: user.id,
                p_quiz_id: quiz_id,
            }
        )

        if (createError || !sessionId) {
            console.error('Error creating quiz session:', createError)
            return NextResponse.json(
                { error: 'Failed to create quiz session' },
                { status: 500 }
            )
        }

        // Fetch questions for this quiz
        const { data: quizQuestions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('question_id, questions(*)')
            .eq('quiz_id', quiz_id)
            .order('question_order')

        if (questionsError) {
            console.error('Error fetching quiz questions:', questionsError)
            return NextResponse.json(
                { error: 'Failed to fetch questions' },
                { status: 500 }
            )
        }

        const questions = quizQuestions?.map((qq: any) => qq.questions) || []

        // Fetch quiz details
        const { data: quiz } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quiz_id)
            .single()

        // Fetch initial quiz state
        const { data: quizState } = await supabase
            .from('quiz_state')
            .select('*')
            .eq('session_id', sessionId)
            .single()

        const response: QuizStartResponse = {
            session_id: sessionId,
            quiz: quiz || null,
            questions,
            time_limit_minutes: quiz?.time_limit_minutes || 60,
            existing_answers: {},
            existing_bookmarks: [],
            quiz_state: quizState || null,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Unexpected error in start quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
