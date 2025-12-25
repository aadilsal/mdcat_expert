// ============================================================================
// Save Quiz State API Route
// ============================================================================
// POST /api/quiz/save-state - Save current quiz state (index, timer)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SaveQuizStateRequest } from '@/types'

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

        const body: SaveQuizStateRequest = await request.json()
        const { session_id, current_question_index, time_remaining_seconds } =
            body

        if (
            !session_id ||
            current_question_index === undefined ||
            time_remaining_seconds === undefined
        ) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify session ownership
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('user_id')
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

        // Update quiz state
        const { error: updateError } = await supabase.rpc(
            'update_quiz_state',
            {
                p_session_id: session_id,
                p_current_index: current_question_index,
                p_time_remaining: time_remaining_seconds,
            }
        )

        if (updateError) {
            console.error('Error saving quiz state:', updateError)
            return NextResponse.json(
                { error: 'Failed to save quiz state' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in save state:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
