// ============================================================================
// Session Management
// ============================================================================
// Utilities for managing user sessions and tokens
// ============================================================================

import { createClient } from '@/lib/supabase/client'
import { AUTH_CONFIG } from './config'
import type { User, Session } from '@supabase/supabase-js'

// ============================================================================
// Session Helpers
// ============================================================================

export async function getSession(): Promise<Session | null> {
    const supabase = createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    return session
}

export async function getUser(): Promise<User | null> {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}

export async function refreshSession(): Promise<Session | null> {
    const supabase = createClient()
    const {
        data: { session },
    } = await supabase.auth.refreshSession()
    return session
}

// ============================================================================
// Session Persistence
// ============================================================================

export async function setPersistentSession(rememberMe: boolean): Promise<void> {
    const supabase = createClient()

    // Supabase handles session persistence automatically
    // The session will persist based on the storage mechanism (localStorage by default)
    // If rememberMe is false, we can set a shorter expiry

    if (!rememberMe) {
        // For non-persistent sessions, we rely on the default session timeout
        // The session will expire when the JWT expires (typically 1 hour)
        console.log('Session set to temporary (will expire with JWT)')
    } else {
        // For persistent sessions, Supabase will automatically refresh the token
        console.log('Session set to persistent (will auto-refresh)')
    }
}

// ============================================================================
// Session Validation
// ============================================================================

export async function isSessionValid(): Promise<boolean> {
    const session = await getSession()
    if (!session) return false

    // Check if session is expired
    const expiresAt = session.expires_at
    if (!expiresAt) return false

    const now = Math.floor(Date.now() / 1000)
    return now < expiresAt
}

export async function requireSession(): Promise<Session> {
    const session = await getSession()
    if (!session) {
        throw new Error('No active session')
    }
    return session
}

// ============================================================================
// Email Verification
// ============================================================================

export async function isEmailVerified(): Promise<boolean> {
    const user = await getUser()
    if (!user) return false

    // Check if email is confirmed
    return user.email_confirmed_at !== null
}

export async function requireEmailVerification(): Promise<void> {
    if (!AUTH_CONFIG.emailVerification.required) {
        return
    }

    const verified = await isEmailVerified()
    if (!verified && !AUTH_CONFIG.emailVerification.allowUnverifiedAccess) {
        throw new Error('Email verification required')
    }
}

export async function resendVerificationEmail(): Promise<{ error: Error | null }> {
    const supabase = createClient()
    const user = await getUser()

    if (!user?.email) {
        return { error: new Error('No user email found') }
    }

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
    })

    return { error }
}

// ============================================================================
// User Role
// ============================================================================

export async function getUserRole(): Promise<string | null> {
    const supabase = createClient()
    const user = await getUser()

    if (!user) return null

    // Fetch user role from users table
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error || !data) return null

    return data.role
}

export async function isAdmin(): Promise<boolean> {
    const role = await getUserRole()
    return role === 'admin'
}

export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin()
    if (!admin) {
        throw new Error('Admin access required')
    }
}

// ============================================================================
// Logout
// ============================================================================

export async function signOut(): Promise<{ error: Error | null }> {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
}
