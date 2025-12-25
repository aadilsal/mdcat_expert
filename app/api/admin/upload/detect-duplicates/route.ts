// ============================================================================
// API Route: Duplicate Detection
// ============================================================================
// Detects duplicate questions before insertion
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

        const { questionTexts } = await request.json()

        if (!questionTexts || !Array.isArray(questionTexts)) {
            return NextResponse.json(
                { error: 'Invalid data' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.rpc('detect_duplicate_questions', {
            question_texts: questionTexts,
        })

        if (error) {
            throw error
        }

        return NextResponse.json({ duplicates: data || [] })
    } catch (error) {
        console.error('Duplicate detection error:', error)
        return NextResponse.json(
            { error: 'Duplicate detection failed' },
            { status: 500 }
        )
    }
}
