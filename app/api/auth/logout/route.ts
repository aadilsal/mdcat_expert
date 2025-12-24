// ============================================================================
// Logout API Route
// ============================================================================
// Server-side logout endpoint
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function POST() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL(AUTH_CONFIG.redirects.afterLogout, '/'))
}
