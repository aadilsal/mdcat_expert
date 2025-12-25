// ============================================================================
// API Route: Create Individual Question
// ============================================================================
// Handles creation of individual questions with quiz assignment
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
            quiz_id,
            category_id,
            question_text,
            question_image_url,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            difficulty_level,
            explanation,
        } = await request.json()

        // Validate required fields
        if (!quiz_id || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (!question_text && !question_image_url) {
            return NextResponse.json(
                { error: 'Either question_text or question_image_url is required' },
                { status: 400 }
            )
        }

        // Call RPC function to add question to quiz
        const { data, error } = await supabase.rpc('add_question_to_quiz', {
            p_quiz_id: quiz_id,
            p_category_id: category_id,
            p_question_text: question_text,
            p_question_image_url: question_image_url,
            p_option_a: option_a,
            p_option_b: option_b,
            p_option_c: option_c,
            p_option_d: option_d,
            p_correct_option: correct_option,
            p_difficulty_level: difficulty_level,
            p_explanation: explanation,
            p_admin_id: user.id,
        })

        if (error) {
            console.error('RPC error:', error)
            throw error
        }

        const result_data = Array.isArray(data) && data.length > 0 ? data[0] : null

        if (!result_data || !result_data.success) {
            return NextResponse.json(
                { error: result_data?.error_message || 'Failed to create question' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            questionId: result_data.question_id,
            message: 'Question created successfully',
        })
    } catch (error) {
        console.error('Create question error:', error)
        return NextResponse.json(
            { error: 'Failed to create question' },
            { status: 500 }
        )
    }
}
