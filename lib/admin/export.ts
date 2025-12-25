// ============================================================================
// Excel Export Utility
// ============================================================================

import * as XLSX from 'xlsx'
import type { Question } from '@/types'

export interface ExportQuestion extends Question {
    category_name?: string
    usage_count?: number
}

export function exportQuestionsToExcel(questions: ExportQuestion[], filename?: string) {
    // Transform data for Excel
    const data = questions.map((q, index) => ({
        '#': index + 1,
        'Question': q.question_text || '[Image Question]',
        'Image URL': q.question_image_url || '',
        'Option A': q.option_a,
        'Option B': q.option_b,
        'Option C': q.option_c,
        'Option D': q.option_d,
        'Correct Answer': q.correct_option,
        'Category': q.category_name || 'Uncategorized',
        'Difficulty': q.difficulty_level,
        'Explanation': q.explanation || '',
        'Times Used': q.usage_count || 0,
        'Created': new Date(q.created_at).toLocaleDateString(),
    }))

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data)

    // Set column widths
    const columnWidths = [
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
        { wch: 12 }, // Created
    ]
    ws['!cols'] = columnWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')

    // Generate filename
    const exportFilename = filename || `questions_export_${new Date().toISOString().split('T')[0]}.xlsx`

    // Download file
    XLSX.writeFile(wb, exportFilename)

    return {
        success: true,
        filename: exportFilename,
        count: questions.length
    }
}

export async function exportQuestionsFromIds(questionIds: string[]) {
    // This will be called from the client with pre-fetched data
    // or from an API route
    const response = await fetch('/api/admin/questions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions_export_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
}

export async function exportFilteredQuestions(filters: any) {
    const response = await fetch('/api/admin/questions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions_filtered_export_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
}
