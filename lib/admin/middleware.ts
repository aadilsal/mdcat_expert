// ============================================================================
// Admin Middleware Helper
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function verifyAdmin() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }
    }

    return {
        authorized: true,
        user,
        response: null
    }
}
