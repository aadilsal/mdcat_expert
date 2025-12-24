'use client'

// ============================================================================
// useRequireAuth Hook
// ============================================================================
// Hook to protect client-side routes and require authentication
// ============================================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import { AUTH_CONFIG } from '../config'
import type { UserRole } from '@/types'

export interface RequireAuthOptions {
    requireEmailVerification?: boolean
    requiredRole?: UserRole
    redirectTo?: string
}

export function useRequireAuth(options: RequireAuthOptions = {}) {
    const {
        requireEmailVerification = AUTH_CONFIG.emailVerification.required,
        requiredRole,
        redirectTo,
    } = options

    const auth = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Wait for auth to load
        if (auth.isLoading) return

        // Check if user is authenticated
        if (!auth.isAuthenticated) {
            const redirect = redirectTo || AUTH_CONFIG.redirects.unauthenticated
            router.push(redirect)
            return
        }

        // Check email verification
        if (requireEmailVerification && !auth.isEmailVerified) {
            router.push('/verify-email')
            return
        }

        // Check role requirement
        if (requiredRole && auth.role !== requiredRole) {
            router.push(AUTH_CONFIG.redirects.unauthorized)
            return
        }
    }, [auth, requireEmailVerification, requiredRole, redirectTo, router])

    return auth
}
