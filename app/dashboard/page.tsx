'use client'

// ============================================================================
// Dashboard Page - Protected Route
// ============================================================================
// User dashboard with auth protection
// ============================================================================

import { useRequireAuth } from '@/lib/auth/hooks/useRequireAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/session'

export default function DashboardPage() {
    const auth = useRequireAuth({ requireEmailVerification: true })
    const router = useRouter()

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Welcome back, {auth.user?.email}!
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">Your Role</h3>
                        <p className="text-3xl font-bold text-primary mt-2 capitalize">{auth.role}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">Email Status</h3>
                        <p className="text-sm mt-2">
                            {auth.isEmailVerified ? (
                                <span className="text-green-600 font-medium">✓ Verified</span>
                            ) : (
                                <span className="text-yellow-600 font-medium">⚠ Not Verified</span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">Account</h3>
                        <p className="text-sm text-gray-600 mt-2">Active</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Button onClick={() => router.push('/quiz')} className="w-full">
                            Start Quiz
                        </Button>
                        <Button onClick={() => router.push('/leaderboard')} variant="outline" className="w-full">
                            View Leaderboard
                        </Button>
                        <Button onClick={() => router.push('/profile')} variant="outline" className="w-full">
                            Edit Profile
                        </Button>
                        {auth.role === 'admin' && (
                            <Button onClick={() => router.push('/admin')} variant="outline" className="w-full">
                                Admin Panel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
