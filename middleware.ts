// ============================================================================
// Enhanced Middleware - Route Protection & Authentication
// ============================================================================
// Protects routes based on authentication status, email verification, and roles
// ============================================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONFIG } from './lib/auth/config'

export async function middleware(req: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: req,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request: req,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith('/auth/'))

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/quiz', '/profile', '/leaderboard', '/admin']
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

    // Admin-only routes
    const isAdminRoute = path.startsWith('/admin')

    // If accessing auth pages while logged in, redirect to dashboard
    if (session && (path === '/login' || path === '/register')) {
        return NextResponse.redirect(new URL(AUTH_CONFIG.redirects.afterLogin, req.url))
    }

    // If accessing protected route without authentication, redirect to login
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL(AUTH_CONFIG.redirects.unauthenticated, req.url)
        redirectUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(redirectUrl)
    }

    // Check email verification for protected routes
    if (
        isProtectedRoute &&
        session &&
        AUTH_CONFIG.emailVerification.required &&
        !session.user.email_confirmed_at &&
        path !== '/verify-email'
    ) {
        return NextResponse.redirect(new URL('/verify-email', req.url))
    }

    // Check admin role for admin routes
    if (isAdminRoute && session) {
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (user?.role !== 'admin') {
            return NextResponse.redirect(new URL(AUTH_CONFIG.redirects.unauthorized, req.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
