// ============================================================================
// AI Suggestions API Route
// ============================================================================
// GET /api/suggestions
// Returns personalized AI-generated suggestions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrGenerateSuggestions } from '@/lib/ai/suggestions-service'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has completed any quizzes
        const { data: quizzes, error: quizError } = await supabase
            .from('quiz_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .limit(1)

        if (quizError || !quizzes || quizzes.length === 0) {
            return NextResponse.json(
                {
                    error: 'No quiz data available',
                    message: 'Complete at least one quiz to get personalized suggestions',
                },
                { status: 404 }
            )
        }

        // Get or generate suggestions
        const suggestions = await getOrGenerateSuggestions(user.id)

        if (!suggestions) {
            return NextResponse.json(
                { error: 'Failed to generate suggestions' },
                { status: 500 }
            )
        }

        return NextResponse.json(suggestions, {
            headers: {
                'Cache-Control': suggestions.cached
                    ? 'private, max-age=3600'
                    : 'private, no-cache',
            },
        })
    } catch (error) {
        console.error('Error in suggestions API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
