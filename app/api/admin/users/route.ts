// ============================================================================
// API Route: Users List/Search
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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

        // Get query parameters
        const searchParams = req.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const search = searchParams.get('search') || ''
        const role = searchParams.get('role') || ''
        const status = searchParams.get('status') || ''
        const limit = 20
        const offset = (page - 1) * limit

        let query = supabase
            .from('users')
            .select(`
                *,
                user_suspensions!left(
                    id,
                    reason,
                    suspended_at,
                    suspended_by,
                    is_active
                )
            `, { count: 'exact' })

        // Search
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        }

        // Filters
        if (role) {
            query = query.eq('role', role)
        }

        if (status === 'suspended') {
            query = query.not('user_suspensions', 'is', null)
        } else if (status === 'active') {
            query = query.is('user_suspensions', null)
        }

        // Pagination
        query = query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false })

        const { data, count, error } = await query

        if (error) throw error

        // Get statistics for each user
        const usersWithStats = await Promise.all(
            (data || []).map(async (user) => {
                const { data: stats } = await supabase
                    .from('user_statistics_view')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                return { ...user, stats }
            })
        )

        return NextResponse.json({
            users: usersWithStats,
            total: count,
            page,
            limit
        })
    } catch (error: any) {
        console.error('Users API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
