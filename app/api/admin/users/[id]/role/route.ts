// ============================================================================
// API Route: User Role Change
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { newRole, reason } = await req.json()

        // Get current user role
        const { data: targetUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', params.id)
            .single()

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const oldRole = targetUser.role

        // Update role
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', params.id)

        if (updateError) throw updateError

        // Log role change
        const { error: logError } = await supabase
            .from('user_role_changes')
            .insert({
                user_id: params.id,
                changed_by: user.id,
                old_role: oldRole,
                new_role: newRole,
                reason
            })

        if (logError) throw logError

        return NextResponse.json({
            success: true,
            oldRole,
            newRole,
            message: `Role changed from ${oldRole} to ${newRole}`
        })
    } catch (error: any) {
        console.error('Role change API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
