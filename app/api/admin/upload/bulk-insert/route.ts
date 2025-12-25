// ============================================================================
// API Route: Bulk Question Insertion with Quiz Creation
// ============================================================================
// Handles bulk insertion of questions and auto-creates a quiz
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExcelQuestionRow, UploadResult } from '@/types'

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

        const { questions, fileName } = await request.json()

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json(
                { error: 'Invalid questions data' },
                { status: 400 }
            )
        }

        // Extract quiz title from filename
        // e.g., "Biology_Practice_Test.xlsx" -> "Biology Practice Test"
        const quizTitle = fileName
            ? fileName
                .replace(/\.(xlsx|xls|csv)$/i, '')
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            : 'Imported Quiz'

        // Get category mappings
        const { data: categories } = await supabase
            .from('question_categories')
            .select('id, name')

        const categoryMap = new Map(
            categories?.map((c) => [c.name.toLowerCase(), c.id]) || []
        )

        // Transform questions for database
        const questionsData = questions.map((q: ExcelQuestionRow) => ({
            category_id: categoryMap.get(q.category.toLowerCase()) || null,
            question_text: q.question_text || null,
            question_image_url: q.question_image_url || null,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            difficulty_level: q.difficulty_level,
            explanation: q.explanation || null,
        }))

        // Get the most common category for the quiz
        const categoryCounts = new Map<string, number>()
        questions.forEach((q: ExcelQuestionRow) => {
            const categoryId = categoryMap.get(q.category.toLowerCase())
            if (categoryId) {
                categoryCounts.set(
                    categoryId,
                    (categoryCounts.get(categoryId) || 0) + 1
                )
            }
        })

        const quizCategoryId =
            categoryCounts.size > 0
                ? Array.from(categoryCounts.entries()).sort(
                    (a, b) => b[1] - a[1]
                )[0][0]
                : null

        // Call new RPC function that creates quiz and inserts questions
        const { data, error } = await supabase.rpc(
            'bulk_insert_questions_with_quiz',
            {
                quiz_title: quizTitle,
                quiz_description: `Imported from ${fileName || 'Excel upload'}`,
                quiz_category_id: quizCategoryId,
                questions_data: questionsData,
                admin_id: user.id,
            }
        )

        if (error) {
            console.error('RPC error:', error)
            throw error
        }

        // RPC returns an array of rows, get the first one
        const result_data = Array.isArray(data) && data.length > 0 ? data[0] : null

        if (!result_data) {
            throw new Error('No data returned from bulk insert')
        }

        // Log upload history
        const uploadStatus =
            result_data.success && result_data.inserted_count === questions.length
                ? 'success'
                : result_data.inserted_count > 0
                    ? 'partial'
                    : 'failed'

        const { data: uploadHistory } = await supabase
            .from('upload_history')
            .insert({
                admin_id: user.id,
                file_name: fileName,
                total_rows: questions.length,
                success_count: result_data.inserted_count || 0,
                failure_count: questions.length - (result_data.inserted_count || 0),
                duplicate_count: 0,
                error_details: result_data.error_message
                    ? [{ row: 0, field: 'bulk', message: result_data.error_message }]
                    : null,
                status: uploadStatus,
            })
            .select()
            .single()

        const result: UploadResult = {
            success: result_data.success,
            totalRows: questions.length,
            successCount: result_data.inserted_count || 0,
            failureCount: questions.length - (result_data.inserted_count || 0),
            duplicateCount: 0,
            errors: result_data.error_message
                ? [{ row: 0, field: 'bulk', message: result_data.error_message }]
                : [],
            uploadId: uploadHistory?.id,
            quizId: result_data.quiz_id, // Return the created quiz ID
            quizTitle: quizTitle, // Return the quiz title
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Bulk insert error:', error)
        return NextResponse.json(
            { error: 'Bulk insert failed' },
            { status: 500 }
        )
    }
}
