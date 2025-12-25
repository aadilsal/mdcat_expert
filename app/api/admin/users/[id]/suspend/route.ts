// ============================================================================
// API Route: User Suspension
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

        const { reason, action } = await req.json()

        if (action === 'suspend') {
            // Create suspension record
            const { error: suspendError } = await supabase
                .from('user_suspensions')
                .insert({
                    user_id: params.id,
                    suspended_by: user.id,
                    reason,
                    is_active: true
                })

            if (suspendError) throw suspendError

            // Log activity
            await supabase.rpc('log_user_activity', {
                p_user_id: params.id,
                p_activity_type: 'suspended',
                p_metadata: { reason, suspended_by: user.id }
            })

            return NextResponse.json({ success: true, message: 'User suspended' })
        } else if (action === 'reactivate') {
            // Deactivate suspension
            const { error: reactivateError } = await supabase
                .from('user_suspensions')
                .update({
                    is_active: false,
                    reactivated_at: new Date().toISOString(),
                    reactivated_by: user.id
                })
                .eq('user_id', params.id)
                .eq('is_active', true)

            if (reactivateError) throw reactivateError

            // Log activity
            await supabase.rpc('log_user_activity', {
                p_user_id: params.id,
                p_activity_type: 'reactivated',
                p_metadata: { reactivated_by: user.id }
            })

            return NextResponse.json({ success: true, message: 'User reactivated' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('Suspension API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
