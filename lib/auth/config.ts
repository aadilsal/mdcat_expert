// ============================================================================
// Auth Configuration
// ============================================================================
// Central configuration for authentication settings
// ============================================================================

export const AUTH_CONFIG = {
    // Password requirements
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
    },

    // Session settings
    session: {
        persistentDuration: 30 * 24 * 60 * 60, // 30 days in seconds
        temporaryDuration: 24 * 60 * 60, // 24 hours in seconds
    },

    // Redirect URLs
    redirects: {
        afterLogin: '/dashboard',
        afterLogout: '/login',
        afterSignup: '/verify-email',
        afterPasswordReset: '/login',
        unauthenticated: '/login',
        unauthorized: '/access-denied',
    },

    // Email verification
    emailVerification: {
        required: true,
        allowUnverifiedAccess: false,
    },

    // Rate limiting (handled by Supabase)
    rateLimiting: {
        enabled: true,
    },
} as const

export type AuthConfig = typeof AUTH_CONFIG
