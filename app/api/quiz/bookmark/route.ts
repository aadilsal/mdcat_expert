// ============================================================================
// Bookmark Question API Route
// ============================================================================
// POST /api/quiz/bookmark - Toggle bookmark status for a question
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ToggleBookmarkRequest } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        // For guest users, just return success without saving
        // Guest mode tracks bookmarks client-side only
        if (authError || !user) {
            return NextResponse.json({ success: true, guest: true, is_bookmarked: false })
        }

        const body: ToggleBookmarkRequest = await request.json()
        const { session_id, question_id } = body

        if (!session_id || !question_id) {
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

        // Check if bookmark exists
        const { data: existing } = await supabase
            .from('bookmarked_questions')
            .select('id')
            .eq('session_id', session_id)
            .eq('question_id', question_id)
            .single()

        let isBookmarked = false

        if (existing) {
            // Remove bookmark
            const { error: deleteError } = await supabase
                .from('bookmarked_questions')
                .delete()
                .eq('id', existing.id)

            if (deleteError) {
                console.error('Error removing bookmark:', deleteError)
                return NextResponse.json(
                    { error: 'Failed to remove bookmark' },
                    { status: 500 }
                )
            }
            isBookmarked = false
        } else {
            // Add bookmark
            const { error: insertError } = await supabase
                .from('bookmarked_questions')
                .insert({
                    session_id,
                    question_id,
                })

            if (insertError) {
                console.error('Error adding bookmark:', insertError)
                return NextResponse.json(
                    { error: 'Failed to add bookmark' },
                    { status: 500 }
                )
            }
            isBookmarked = true
        }

        return NextResponse.json({ success: true, is_bookmarked: isBookmarked })
    } catch (error) {
        console.error('Unexpected error in bookmark:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
