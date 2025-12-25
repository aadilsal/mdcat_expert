'use client'

// ============================================================================
// Activity Timeline Component
// ============================================================================

import { useState, useEffect } from 'react'
import { Clock, LogIn, FileText, CheckCircle } from 'lucide-react'
import { fetchUserActivity } from '@/lib/admin/users/queries'

interface ActivityTimelineProps {
    userId: string
}

export function ActivityTimeline({ userId }: ActivityTimelineProps) {
    const [activities, setActivities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        loadActivities()
    }, [userId, page])

    const loadActivities = async () => {
        setIsLoading(true)
        try {
            const { data, count } = await fetchUserActivity(userId, page, 10)
            setActivities(data || [])
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Error loading activities:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'login':
                return <LogIn className="text-blue-600" size={20} />
            case 'quiz_start':
            case 'quiz_complete':
                return <FileText className="text-purple-600" size={20} />
            case 'answer_submit':
                return <CheckCircle className="text-green-600" size={20} />
            default:
                return <Clock className="text-gray-600" size={20} />
        }
    }

    const getActivityLabel = (type: string) => {
        const labels: Record<string, string> = {
            login: 'Logged in',
            logout: 'Logged out',
            quiz_start: 'Started quiz',
            quiz_complete: 'Completed quiz',
            answer_submit: 'Submitted answer',
            profile_update: 'Updated profile'
        }
        return labels[type] || type
    }

    if (isLoading) {
        return <div className="animate-pulse">Loading activities...</div>
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>

            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="p-2 bg-gray-100 rounded-full">
                                {getActivityIcon(activity.activity_type)}
                            </div>
                            {index < activities.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-200 mt-2" />
                            )}
                        </div>

                        <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">
                                    {getActivityLabel(activity.activity_type)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(activity.created_at).toLocaleString()}
                                </p>
                            </div>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {JSON.stringify(activity.metadata)}
                                </p>
                            )}
                            {activity.ip_address && (
                                <p className="text-xs text-gray-500 mt-1">
                                    IP: {activity.ip_address}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalCount > 10 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {page} of {Math.ceil(totalCount / 10)}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(totalCount / 10)}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
