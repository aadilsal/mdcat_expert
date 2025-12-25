// ============================================================================
// API Route: User Export
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

        const { filters, userIds } = await req.json()

        let query = supabase
            .from('users')
            .select(`
                *,
                user_suspensions!left(is_active, reason, suspended_at)
            `)

        // If specific user IDs provided
        if (userIds && userIds.length > 0) {
            query = query.in('id', userIds)
        } else if (filters) {
            // Apply filters
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
            }
            if (filters.role) {
                query = query.eq('role', filters.role)
            }
            if (filters.status === 'suspended') {
                query = query.not('user_suspensions', 'is', null)
            } else if (filters.status === 'active') {
                query = query.is('user_suspensions', null)
            }
        }

        const { data: users, error } = await query

        if (error) throw error

        // Get statistics for each user
        const usersWithStats = await Promise.all(
            (users || []).map(async (u) => {
                const { data: stats } = await supabase
                    .from('user_statistics_view')
                    .select('*')
                    .eq('id', u.id)
                    .single()

                return { ...u, stats }
            })
        )

        // Format data for Excel
        const exportData = usersWithStats.map((u, index) => ({
            '#': index + 1,
            'Name': u.name,
            'Email': u.email,
            'Role': u.role,
            'Status': u.user_suspensions?.some((s: any) => s.is_active) ? 'Suspended' : 'Active',
            'Total Quizzes': u.stats?.total_quizzes || 0,
            'Avg Score': u.stats?.avg_score?.toFixed(1) || '0.0',
            'Accuracy %': u.stats?.avg_accuracy?.toFixed(1) || '0.0',
            'Login Count': u.stats?.login_count || 0,
            'Last Login': u.stats?.last_login
                ? new Date(u.stats.last_login).toLocaleDateString()
                : 'Never',
            'Last Quiz': u.stats?.last_quiz_date
                ? new Date(u.stats.last_quiz_date).toLocaleDateString()
                : 'Never',
            'Joined': new Date(u.created_at).toLocaleDateString()
        }))

        // Create Excel file
        const ws = XLSX.utils.json_to_sheet(exportData)
        ws['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 30 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
            { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Users')

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=users_export_${Date.now()}.xlsx`
            }
        })
    } catch (error: any) {
        console.error('Export API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
