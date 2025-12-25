// ============================================================================
// Share Results API Route
// ============================================================================
// POST /api/quiz/results/[sessionId]/share
// Generate shareable summary (privacy-safe)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ShareResultsResponse } from '@/types'

export async function POST(
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
            .select(`
                user_id,
                status,
                total_questions,
                score,
                completed_at,
                quiz_id,
                quizzes (
                    title
                )
            `)
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
                { error: 'Quiz must be completed to share results' },
                { status: 400 }
            )
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()

        // Calculate accuracy
        const accuracy = session.total_questions > 0
            ? Math.round((session.score / session.total_questions) * 100)
            : 0

        // Get quiz title
        const quizTitle = (session.quizzes as any)?.title || 'MDCAT Quiz'

        // Format completion date
        const completedDate = session.completed_at
            ? new Date(session.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'Recently'

        // Generate shareable text (privacy-safe - no answers)
        const shareText = `🎓 MDCAT Expert Quiz Results

👤 ${profile?.full_name || 'Student'}
📝 ${quizTitle}
📅 ${completedDate}

📊 Performance:
✅ Score: ${session.score}/${session.total_questions}
📈 Accuracy: ${accuracy}%

${accuracy >= 80 ? '🌟 Excellent performance!' : accuracy >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}

#MDCATExpert #MedicalEducation #QuizResults`

        const response: ShareResultsResponse = {
            share_text: shareText,
            // Optional: Generate a shareable URL if you implement a public results page
            // share_url: `${process.env.NEXT_PUBLIC_APP_URL}/results/share/${sessionId}`
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error generating shareable results:', error)
        return NextResponse.json(
            { error: 'Failed to generate shareable results' },
            { status: 500 }
        )
    }
}
