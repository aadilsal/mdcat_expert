// ============================================================================
// API Route: File Validation
// ============================================================================
// Validates uploaded Excel file before processing
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateFile } from '@/lib/excel/validation'

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

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        const errors = validateFile(file)

        return NextResponse.json({
            valid: errors.length === 0,
            errors,
        })
    } catch (error) {
        console.error('Validation error:', error)
        return NextResponse.json(
            { error: 'Validation failed' },
            { status: 500 }
        )
    }
}
