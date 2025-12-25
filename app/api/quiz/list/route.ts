// ============================================================================
// Quiz List API Route
// ============================================================================
// GET /api/quiz/list - Fetch all active quizzes with filtering
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const categoryId = searchParams.get('category_id')
        const difficulty = searchParams.get('difficulty')
        const search = searchParams.get('search')

        // Build query
        let query = supabase
            .from('quizzes')
            .select(
                `
                *,
                category:question_categories(id, name, description)
            `
            )
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        // Apply filters
        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        if (difficulty && difficulty !== 'mixed') {
            query = query.eq('difficulty_level', difficulty)
        }

        if (search) {
            query = query.or(
                `title.ilike.%${search}%,description.ilike.%${search}%`
            )
        }

        const { data: quizzes, error } = await query

        if (error) {
            console.error('Error fetching quizzes:', error)
            return NextResponse.json(
                { error: 'Failed to fetch quizzes' },
                { status: 500 }
            )
        }

        return NextResponse.json({ quizzes })
    } catch (error) {
        console.error('Unexpected error in quiz list:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
