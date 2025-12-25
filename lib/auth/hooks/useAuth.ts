'use client'

// ============================================================================
// useAuth Hook
// ============================================================================
// React hook for accessing auth state throughout the application
// ============================================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

export interface AuthState {
    user: User | null
    session: Session | null
    role: UserRole | null
    isLoading: boolean
    isAuthenticated: boolean
    isEmailVerified: boolean
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        role: null,
        isLoading: true,
        isAuthenticated: false,
        isEmailVerified: false,
    })

    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            updateAuthState(session)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            updateAuthState(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    async function updateAuthState(session: Session | null) {
        if (!session) {
            setAuthState({
                user: null,
                session: null,
                role: null,
                isLoading: false,
                isAuthenticated: false,
                isEmailVerified: false,
            })
            return
        }

        const user = session.user

        // Fetch user role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // DEBUG: Log the fetched role and any errors
        console.log('🔍 DEBUG - User ID:', user.id)
        console.log('🔍 DEBUG - Fetched userData:', userData)
        console.log('🔍 DEBUG - User Error:', userError)
        console.log('🔍 DEBUG - Role:', userData?.role)

        setAuthState({
            user,
            session,
            role: (userData?.role as UserRole) || null,
            isLoading: false,
            isAuthenticated: true,
            isEmailVerified: user.email_confirmed_at !== null,
        })
    }

    return authState
}

/**
 * Hook to require authentication and optionally a specific role
 * Redirects to login if not authenticated, or to dashboard if wrong role
 */
export function useRequireAuth(requiredRole?: UserRole) {
    const authState = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Wait for auth to finish loading
        if (authState.isLoading) return

        // Redirect to login if not authenticated
        if (!authState.isAuthenticated) {
            router.push('/login')
            return
        }

        // Redirect to dashboard if role doesn't match
        if (requiredRole && authState.role !== requiredRole) {
            router.push('/dashboard')
            return
        }
    }, [authState.isLoading, authState.isAuthenticated, authState.role, requiredRole, router])

    return authState
}
