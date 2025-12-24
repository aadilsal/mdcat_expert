'use client'

// ============================================================================
// AuthProvider Component
// ============================================================================
// Context provider for auth state management
// ============================================================================

import { createContext, useContext, ReactNode } from 'react'
import { useAuth, type AuthState } from '@/lib/auth/hooks/useAuth'

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth()

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
