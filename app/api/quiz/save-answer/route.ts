// ============================================================================
// Save Answer API Route
// ============================================================================
// POST /api/quiz/save-answer - Save or update a quiz answer
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SaveAnswerRequest } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        // For guest users, just return success without saving
        // Guest mode tracks answers client-side only
        if (authError || !user) {
            return NextResponse.json({ success: true, guest: true })
        }

        const body: SaveAnswerRequest = await request.json()
        const { session_id, question_id, selected_option } = body

        if (!session_id || !question_id || !selected_option) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate option
        if (!['A', 'B', 'C', 'D'].includes(selected_option)) {
            return NextResponse.json(
                { error: 'Invalid option' },
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

        // Upsert answer (insert or update if exists)
        const { error: upsertError } = await supabase
            .from('user_answers')
            .upsert(
                {
                    session_id,
                    question_id,
                    selected_option,
                },
                {
                    onConflict: 'session_id,question_id',
                }
            )

        if (upsertError) {
            console.error('Error saving answer:', upsertError)
            return NextResponse.json(
                { error: 'Failed to save answer' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in save answer:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
