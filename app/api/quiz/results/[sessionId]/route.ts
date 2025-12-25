// ============================================================================
// Quiz Results API Route
// ============================================================================
// GET /api/quiz/results/[sessionId]
// Returns detailed quiz results with analytics
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DetailedQuizResults, DifficultyBreakdown, TopicBreakdown } from '@/types'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params
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
            .select('user_id, quiz_id, status')
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
                { error: 'Quiz not completed yet' },
                { status: 400 }
            )
        }

        // Get detailed results using database function
        const { data: resultsData, error: resultsError } = await supabase.rpc(
            'get_quiz_detailed_results',
            { p_session_id: sessionId }
        )

        if (resultsError || !resultsData || resultsData.length === 0) {
            return NextResponse.json(
                { error: 'Failed to fetch quiz results' },
                { status: 500 }
            )
        }

        const result = resultsData[0]

        // Get difficulty analysis
        const { data: difficultyData, error: difficultyError } = await supabase.rpc(
            'get_difficulty_analysis',
            { p_session_id: sessionId }
        )

        // Build difficulty breakdown
        const difficultyBreakdown: DifficultyBreakdown = {
            easy: { total: 0, correct: 0, accuracy: 0 },
            medium: { total: 0, correct: 0, accuracy: 0 },
            hard: { total: 0, correct: 0, accuracy: 0 },
        }

        if (difficultyData && !difficultyError) {
            difficultyData.forEach((item: any) => {
                const level = item.difficulty as 'easy' | 'medium' | 'hard'
                difficultyBreakdown[level] = {
                    total: item.total_questions,
                    correct: item.correct_answers,
                    accuracy: parseFloat(item.accuracy_percentage),
                }
            })
        }

        // Get topic analysis
        const { data: topicData, error: topicError } = await supabase.rpc(
            'get_topic_analysis',
            { p_session_id: sessionId }
        )

        // Build topic breakdown
        const topicBreakdown: TopicBreakdown = {}

        if (topicData && !topicError) {
            topicData.forEach((item: any) => {
                topicBreakdown[item.category_id] = {
                    category_id: item.category_id,
                    category_name: item.category_name,
                    total: item.total_questions,
                    correct: item.correct_answers,
                    accuracy: parseFloat(item.accuracy_percentage),
                }
            })
        }

        // Get question results
        const { data: questionResults, error: questionError } = await supabase.rpc(
            'get_question_results',
            { p_session_id: sessionId }
        )

        if (questionError) {
            console.error('Error fetching question results:', questionError)
        }

        // Get quiz title if quiz_id exists
        let quizTitle = 'Quiz Results'
        if (session.quiz_id) {
            const { data: quizData } = await supabase
                .from('quizzes')
                .select('title')
                .eq('id', session.quiz_id)
                .single()

            if (quizData) {
                quizTitle = quizData.title
            }
        }

        // Build response
        const detailedResults: DetailedQuizResults = {
            session_id: result.session_id,
            user_id: result.user_id,
            quiz_id: result.quiz_id,
            quiz_title: quizTitle,
            started_at: result.started_at,
            completed_at: result.completed_at,
            total_questions: result.total_questions,
            score: result.score,
            correct_answers: result.correct_answers,
            incorrect_answers: result.incorrect_answers,
            accuracy_percentage: parseFloat(result.accuracy_percentage),
            time_taken_seconds: result.time_taken_seconds,
            average_time_per_question: parseFloat(result.average_time_per_question),
            difficulty_breakdown: difficultyBreakdown,
            topic_breakdown: topicBreakdown,
            questions: questionResults || [],
        }

        return NextResponse.json(detailedResults, {
            headers: {
                'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
            },
        })
    } catch (error) {
        console.error('Error in quiz results API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
