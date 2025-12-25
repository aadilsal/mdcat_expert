// ============================================================================
// Export Questions API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify admin authentication
        const { data: { user } } = await supabase.auth.getUser()

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

        // Get request body
        const body = await req.json()
        const { questionIds, filters } = body

        let query = supabase
            .from('questions')
            .select(`
                *,
                question_categories(name),
                question_usage_stats(times_attempted, correct_percentage)
            `)
            .is('deleted_at', null)

        // If specific IDs provided, use those
        if (questionIds && questionIds.length > 0) {
            query = query.in('id', questionIds)
        } else if (filters) {
            // Apply filters for filtered export
            if (filters.search) {
                query = query.textSearch('question_text', filters.search)
            }
            if (filters.categories?.length > 0) {
                query = query.in('category_id', filters.categories)
            }
            if (filters.difficulties?.length > 0) {
                query = query.in('difficulty_level', filters.difficulties)
            }
            if (filters.questionType === 'text') {
                query = query.not('question_text', 'is', null)
            } else if (filters.questionType === 'image') {
                query = query.not('question_image_url', 'is', null)
            }
        }

        const { data: questions, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: 'No questions found' }, { status: 404 })
        }

        // Transform data for Excel
        const excelData = questions.map((q: any, index: number) => ({
            '#': index + 1,
            'Question': q.question_text || '[Image Question]',
            'Image URL': q.question_image_url || '',
            'Option A': q.option_a,
            'Option B': q.option_b,
            'Option C': q.option_c,
            'Option D': q.option_d,
            'Correct Answer': q.correct_option,
            'Category': q.question_categories?.name || 'Uncategorized',
            'Difficulty': q.difficulty_level,
            'Explanation': q.explanation || '',
            'Times Used': q.question_usage_stats?.times_attempted || 0,
            'Accuracy %': q.question_usage_stats?.correct_percentage?.toFixed(1) || '0.0',
            'Created': new Date(q.created_at).toLocaleDateString(),
        }))

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData)

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },  // #
            { wch: 50 }, // Question
            { wch: 30 }, // Image URL
            { wch: 30 }, // Option A
            { wch: 30 }, // Option B
            { wch: 30 }, // Option C
            { wch: 30 }, // Option D
            { wch: 10 }, // Correct Answer
            { wch: 15 }, // Category
            { wch: 10 }, // Difficulty
            { wch: 40 }, // Explanation
            { wch: 10 }, // Times Used
            { wch: 10 }, // Accuracy %
            { wch: 12 }, // Created
        ]

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Questions')

        // Generate buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        // Return file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=questions_export_${Date.now()}.xlsx`
            }
        })

    } catch (error: any) {
        console.error('Export error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
