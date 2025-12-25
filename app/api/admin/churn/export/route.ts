// ============================================================================
// API Route: Export Churn Data
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin auth
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

        const { riskLevel } = await req.json()

        // Fetch engagement metrics
        let query = supabase
            .from('user_engagement_metrics')
            .select(`
                *,
                users!inner(name, email)
            `)

        if (riskLevel && riskLevel !== 'all') {
            query = query.eq('risk_level', riskLevel)
        }

        const { data, error } = await query

        if (error) throw error

        // Format data for Excel
        const exportData = (data || []).map((m, index) => ({
            '#': index + 1,
            'Name': m.users.name,
            'Email': m.users.email,
            'Risk Level': m.risk_level.toUpperCase(),
            'Churn Probability %': m.churn_probability,
            'Engagement Score': m.engagement_score,
            'Recency Score': m.recency_score,
            'Frequency Score': m.frequency_score,
            'Performance Score': m.performance_score,
            'Days Since Login': m.days_since_last_login,
            'Days Since Quiz': m.days_since_last_quiz,
            'Logins (7d)': m.login_count_7d,
            'Quizzes (7d)': m.quiz_count_7d,
            'Avg Score (7d)': m.avg_score_7d?.toFixed(1) || '0.0',
            'Last Updated': new Date(m.last_calculated_at).toLocaleDateString()
        }))

        // Create Excel file
        const ws = XLSX.utils.json_to_sheet(exportData)
        ws['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 30 }, { wch: 12 },
            { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 15 },
            { wch: 17 }, { wch: 16 }, { wch: 16 }, { wch: 12 },
            { wch: 13 }, { wch: 14 }, { wch: 15 }
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Churn Analysis')

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=churn_analysis_${Date.now()}.xlsx`
            }
        })
    } catch (error: any) {
        console.error('Export API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
