'use client'

// ============================================================================
// Simple Header Component for All Pages
// ============================================================================

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/hooks/useAuth'
import { signOut } from '@/lib/auth/session'

export function SimpleHeader() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                        MDCAT Expert
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/quiz" className="text-gray-700 hover:text-blue-600 font-medium">
                            Quizzes
                        </Link>
                        <Link href="/leaderboard" className="text-gray-700 hover:text-blue-600 font-medium">
                            Leaderboard
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                            About
                        </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {!isLoading && (
                            <>
                                {user ? (
                                    <>
                                        <Link href="/dashboard">
                                            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={handleLogout}
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                Sign Up Free
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
