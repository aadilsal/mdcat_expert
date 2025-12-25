// ============================================================================
// Practice Suggestions API Route
// ============================================================================
// GET /api/suggestions/practice
// Returns practice question recommendations
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPracticeSuggestions } from '@/lib/ai/suggestions-service'

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

        // Get practice suggestions
        const suggestions = await getPracticeSuggestions(user.id)

        return NextResponse.json({
            suggestions,
            count: suggestions.length,
        })
    } catch (error) {
        console.error('Error in practice suggestions API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
