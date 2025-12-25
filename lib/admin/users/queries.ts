// ============================================================================
// User Management Queries
// ============================================================================
// Data fetching utilities for user management
// ============================================================================

import { createClient } from '@/lib/supabase/client'

export interface UserFilters {
    page?: number
    search?: string
    role?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    activityLevel?: string
    limit?: number
}

export async function fetchUsers(filters: UserFilters = {}) {
    const supabase = createClient()
    const {
        page = 1,
        search = '',
        role = '',
        status = '',
        dateFrom = '',
        dateTo = '',
        activityLevel = '',
        limit = 20
    } = filters

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

    // Search by name or email
    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Filter by role
    if (role) {
        query = query.eq('role', role)
    }

    // Filter by status (suspended/active)
    if (status === 'suspended') {
        query = query.not('user_suspensions', 'is', null)
    } else if (status === 'active') {
        // Users with no active suspensions
        query = query.is('user_suspensions', null)
    }

    // Filter by registration date range
    if (dateFrom) {
        query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
        query = query.lte('created_at', dateTo)
    }

    // Pagination and ordering
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

            return {
                ...user,
                stats
            }
        })
    )

    return { data: usersWithStats, count }
}

export async function fetchUserDetails(userId: string) {
    const supabase = createClient()

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            user_suspensions!left(
                id,
                reason,
                suspended_at,
                suspended_by,
                reactivated_at,
                reactivated_by,
                is_active
            )
        `)
        .eq('id', userId)
        .single()

    if (error) throw error

    // Get statistics
    const { data: stats } = await supabase
        .from('user_statistics_view')
        .select('*')
        .eq('id', userId)
        .single()

    return { ...user, stats }
}

export async function fetchUserActivity(userId: string, page = 1, limit = 20) {
    const supabase = createClient()
    const offset = (page - 1) * limit

    const { data, count, error } = await supabase
        .from('user_activity_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
}

export async function fetchUserQuizHistory(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
            id,
            score,
            total_questions,
            correct_answers,
            status,
            started_at,
            completed_at,
            time_taken_seconds,
            quizzes(
                id,
                title,
                question_categories(name)
            )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })

    if (error) throw error
    return data
}

export async function fetchUserPerformanceByCategory(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .rpc('get_user_performance_by_category', { p_user_id: userId })

    if (error) throw error
    return data
}

export async function suspendUser(userId: string, reason: string, adminId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('user_suspensions')
        .insert({
            user_id: userId,
            suspended_by: adminId,
            reason,
            is_active: true
        })

    if (error) throw error

    // Log activity
    await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_activity_type: 'suspended',
        p_metadata: { reason, suspended_by: adminId }
    })

    return { success: true }
}

export async function reactivateUser(userId: string, adminId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('user_suspensions')
        .update({
            is_active: false,
            reactivated_at: new Date().toISOString(),
            reactivated_by: adminId
        })
        .eq('user_id', userId)
        .eq('is_active', true)

    if (error) throw error

    // Log activity
    await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_activity_type: 'reactivated',
        p_metadata: { reactivated_by: adminId }
    })

    return { success: true }
}

export async function changeUserRole(
    userId: string,
    newRole: string,
    reason: string,
    adminId: string
) {
    const supabase = createClient()

    // Get current role
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

    if (!user) throw new Error('User not found')

    const oldRole = user.role

    // Update role
    const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

    if (updateError) throw updateError

    // Log role change
    const { error: logError } = await supabase
        .from('user_role_changes')
        .insert({
            user_id: userId,
            changed_by: adminId,
            old_role: oldRole,
            new_role: newRole,
            reason
        })

    if (logError) throw logError

    return { success: true, oldRole, newRole }
}

export async function fetchUserSegments(adminId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('user_segments')
        .select('*')
        .eq('created_by', adminId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function saveUserSegment(
    name: string,
    description: string,
    filterCriteria: any,
    adminId: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('user_segments')
        .insert({
            name,
            description,
            filter_criteria: filterCriteria,
            created_by: adminId
        })
        .select()
        .single()

    if (error) throw error
    return data
}
