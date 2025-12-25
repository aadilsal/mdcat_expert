// ============================================================================
// API Route: Update Engagement Scores
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

        // Call the batch update function
        const { data, error } = await supabase.rpc('update_all_engagement_metrics')

        if (error) throw error

        return NextResponse.json({
            success: true,
            usersUpdated: data,
            message: `Updated engagement scores for ${data} users`
        })
    } catch (error: any) {
        console.error('Update scores API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
