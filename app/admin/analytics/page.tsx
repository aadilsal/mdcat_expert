'use client'

// ============================================================================
// Admin Analytics Dashboard
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { fetchChurnOverview, fetchChurnTrends } from '@/lib/admin/churn/queries'
import { ChurnTrendChart } from '../churn/components/ChurnTrendChart'
import { RiskDistributionChart } from '../churn/components/RiskDistributionChart'
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Target, Activity, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface AnalyticsData {
    totalUsers: number
    activeUsers: number
    totalQuizzes: number
    avgQuizScore: number
    churnOverview: any
    churnTrends: any[]
}

export default function AnalyticsPage() {
    const auth = useRequireAuth('admin')
    const router = useRouter()
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [timeFilter, setTimeFilter] = useState(30)

    useEffect(() => {
        if (auth.user) {
            loadAnalytics()
        }
    }, [auth.user, timeFilter])

    const loadAnalytics = async () => {
        setIsLoading(true)
        try {
            const supabase = createClient()

            // Fetch user statistics
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'user')

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            const { count: activeUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'user')
                .gte('last_sign_in_at', thirtyDaysAgo)

            // Fetch quiz statistics
            const { count: totalQuizzes } = await supabase
                .from('quiz_attempts')
                .select('*', { count: 'exact', head: true })

            const { data: quizScores } = await supabase
                .from('quiz_attempts')
                .select('score')
                .gte('created_at', thirtyDaysAgo)

            const avgQuizScore = quizScores && quizScores.length > 0
                ? quizScores.reduce((sum, q) => sum + (q.score || 0), 0) / quizScores.length
                : 0

            // Fetch churn data
            const [churnOverview, churnTrends] = await Promise.all([
                fetchChurnOverview(),
                fetchChurnTrends(timeFilter)
            ])

            setData({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalQuizzes: totalQuizzes || 0,
                avgQuizScore: Math.round(avgQuizScore * 10) / 10,
                churnOverview,
                churnTrends
            })
        } catch (error) {
            console.error('Error loading analytics:', error)
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

    if (!data) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => router.push('/admin/dashboard')}
                                variant="outline"
                                className="border-2 border-gray-800 text-gray-800"
                            >
                                <ArrowLeft className="mr-2" size={20} />
                                Back to Admin
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Analytics Dashboard
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Comprehensive insights into platform performance
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Users */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Activity className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Active Users (30d)</p>
                            <p className="text-3xl font-bold text-gray-900">{data.activeUsers.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}% of total
                            </p>
                        </div>

                        {/* Total Quizzes */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <BookOpen className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Total Quizzes</p>
                            <p className="text-3xl font-bold text-gray-900">{data.totalQuizzes.toLocaleString()}</p>
                        </div>

                        {/* Average Score */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Target className="text-yellow-600" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Avg Quiz Score (30d)</p>
                            <p className="text-3xl font-bold text-gray-900">{data.avgQuizScore}%</p>
                        </div>
                    </div>

                    {/* Churn Metrics */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Churn & Retention</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">At Risk Users</p>
                                <p className="text-2xl font-bold text-red-600">{data.churnOverview.atRiskCount}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Churn Rate</p>
                                <p className="text-2xl font-bold text-orange-600">{data.churnOverview.churnRate}%</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Retention Rate</p>
                                <p className="text-2xl font-bold text-green-600">{data.churnOverview.retentionRate}%</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Avg Engagement</p>
                                <p className="text-2xl font-bold text-purple-600">{data.churnOverview.avgEngagementScore}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push('/admin/churn')}
                            variant="outline"
                            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                            <AlertTriangle className="mr-2" size={18} />
                            View Detailed Churn Analysis
                        </Button>
                    </div>

                    {/* Time Filter */}
                    <div className="mb-6 flex gap-2">
                        {[7, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setTimeFilter(days)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFilter === days
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {days} Days
                            </button>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChurnTrendChart data={data.churnTrends} />
                        <RiskDistributionChart data={data.churnOverview} />
                    </div>
                </div>
            </div>
        </div>
    )
}
