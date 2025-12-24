import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

    // Protected routes that require authentication
    if (req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/quiz') ||
        req.nextUrl.pathname.startsWith('/profile') ||
        req.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        // Admin-only routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (user?.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }
    }

    // Redirect to dashboard if already logged in and trying to access auth pages
    if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
