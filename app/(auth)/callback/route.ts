// ============================================================================
// Auth Callback Page
// ============================================================================
// Handle OAuth callbacks and email confirmations
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL(AUTH_CONFIG.redirects.afterLogin, requestUrl.origin))
}
