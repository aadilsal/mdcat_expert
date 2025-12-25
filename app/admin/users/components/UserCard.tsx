'use client'

// ============================================================================
// User Card Component
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Shield, Ban, CheckCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserCardProps {
    user: any
    onUpdate: () => void
}

export function UserCard({ user, onUpdate }: UserCardProps) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)

    const isSuspended = user.user_suspensions?.some((s: any) => s.is_active)
    const stats = user.stats || {}

    return (
        <div
            className="p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => router.push(`/admin/users/${user.id}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            {user.role === 'admin' && (
                                <Shield className="text-purple-600" size={16} />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>

                        <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {user.role}
                            </span>

                            {isSuspended ? (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                    <Ban size={12} />
                                    Suspended
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="flex gap-8 mr-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.total_quizzes || 0}
                        </div>
                        <div className="text-xs text-gray-600">Quizzes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.avg_score?.toFixed(0) || 0}%
                        </div>
                        <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.avg_accuracy?.toFixed(0) || 0}%
                        </div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                </div>

                {/* Dates & Actions */}
                <div className="text-right">
                    <div className="text-sm text-gray-700 font-medium">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Last login: {stats.last_login
                            ? new Date(stats.last_login).toLocaleDateString()
                            : 'Never'}
                    </div>

                    {isHovered && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/users/${user.id}`)
                            }}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
