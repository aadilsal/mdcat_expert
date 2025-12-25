'use client'

// ============================================================================
// User Details Page
// ============================================================================

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { fetchUserDetails } from '@/lib/admin/users/queries'
import { UserStats } from '../components/UserStats'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { RoleManager } from '../components/RoleManager'
import { SuspensionControls } from '../components/SuspensionControls'
import { QuizHistory } from '../components/QuizHistory'
import { PerformanceAnalytics } from '../components/PerformanceAnalytics'
import { ArrowLeft, Mail, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserDetailsPage() {
    const auth = useRequireAuth('admin')
    const params = useParams()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (auth.user && params.id) {
            loadUser()
        }
    }, [params.id, auth.user])

    const loadUser = async () => {
        setIsLoading(true)
        try {
            const data = await fetchUserDetails(params.id as string)
            setUser(data)
        } catch (error) {
            console.error('Error loading user:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">User not found</p>
                    <Button onClick={() => router.push('/admin/users')} className="mt-4">
                        Back to Users
                    </Button>
                </div>
            </div>
        )
    }

    const isSuspended = user.user_suspensions?.some((s: any) => s.is_active)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            onClick={() => router.push('/admin/users')}
                            variant="outline"
                            className="mb-4 border-2 border-gray-800 text-gray-800"
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Back to Users
                        </Button>

                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-3xl">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-3xl font-bold text-gray-900">
                                                {user.name}
                                            </h1>
                                            {user.role === 'admin' && (
                                                <Shield className="text-purple-600" size={24} />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                                            <Mail size={16} />
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                                            <Calendar size={14} />
                                            <span>
                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${isSuspended
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {isSuspended ? 'Suspended' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mb-8">
                        <UserStats stats={user.stats || {}} />
                    </div>

                    {/* Management Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <RoleManager
                            user={user}
                            currentAdminId={auth.user?.id || ''}
                            onUpdate={loadUser}
                        />
                        <SuspensionControls
                            user={user}
                            currentAdminId={auth.user?.id || ''}
                            onUpdate={loadUser}
                        />
                    </div>

                    {/* Performance Analytics */}
                    <div className="mb-8">
                        <PerformanceAnalytics userId={user.id} />
                    </div>

                    {/* Activity & Quiz History */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ActivityTimeline userId={user.id} />
                        <QuizHistory userId={user.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
