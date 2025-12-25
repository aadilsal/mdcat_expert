// ============================================================================
// Pause Quiz API Route
// ============================================================================
// POST /api/quiz/pause - Pause an active quiz session
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        // For guest users, just return success
        // Guest mode doesn't persist pause state
        if (authError || !user) {
            return NextResponse.json({ success: true, guest: true })
        }

        const { session_id } = await request.json()

        if (!session_id) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Verify session ownership
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('user_id, status')
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

        if (session.status !== 'in_progress') {
            return NextResponse.json(
                { error: 'Session is not in progress' },
                { status: 400 }
            )
        }

        // Pause the quiz using database function
        const { error: pauseError } = await supabase.rpc('pause_quiz', {
            p_session_id: session_id,
        })

        if (pauseError) {
            console.error('Error pausing quiz:', pauseError)
            return NextResponse.json(
                { error: 'Failed to pause quiz' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in pause quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
