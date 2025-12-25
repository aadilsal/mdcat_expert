// ============================================================================
// API Route: Create New Quiz
// ============================================================================
// Handles creation of new quizzes
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin auth
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const {
            title,
            description,
            category_id,
            difficulty_level,
            time_limit_minutes,
            is_practice_mode,
            allow_pause,
        } = await request.json()

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Create quiz
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .insert({
                title,
                description,
                category_id,
                difficulty_level: difficulty_level || 'mixed',
                time_limit_minutes: time_limit_minutes || 60,
                question_count: 0, // Will be updated when questions are added
                is_active: true,
                is_practice_mode: is_practice_mode || false,
                allow_pause: allow_pause !== false,
                show_results_immediately: true,
                created_by: user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Create quiz error:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            quiz,
            message: 'Quiz created successfully',
        })
    } catch (error) {
        console.error('Create quiz error:', error)
        return NextResponse.json(
            { error: 'Failed to create quiz' },
            { status: 500 }
        )
    }
}

// Get all quizzes
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin auth
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch all quizzes with category info
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*, category:question_categories(id, name)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch quizzes error:', error)
            throw error
        }

        return NextResponse.json({ quizzes })
    } catch (error) {
        console.error('Fetch quizzes error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quizzes' },
            { status: 500 }
        )
    }
}
