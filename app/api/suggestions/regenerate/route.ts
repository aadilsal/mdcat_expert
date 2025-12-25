// ============================================================================
// Regenerate Suggestions API Route
// ============================================================================
// POST /api/suggestions/regenerate
// Regenerates AI suggestions (bypasses cache, rate limited)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerateSuggestions } from '@/lib/ai/suggestions-service'

export async function POST(request: NextRequest) {
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

        // Regenerate suggestions with rate limiting
        const result = await regenerateSuggestions(user.id)

        if (!result.suggestions) {
            return NextResponse.json(
                { error: 'Failed to regenerate suggestions' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            ...result.suggestions,
            regenerationsRemaining: result.regenerationsRemaining,
        })
    } catch (error) {
        console.error('Error regenerating suggestions:', error)

        const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate suggestions'
        const statusCode = errorMessage.includes('Rate limit') ? 429 : 500

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        )
    }
}
