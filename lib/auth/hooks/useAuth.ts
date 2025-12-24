'use client'

// ============================================================================
// useAuth Hook
// ============================================================================
// React hook for accessing auth state throughout the application
// ============================================================================

import { useEffect, useState } from 'react'
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
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

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
