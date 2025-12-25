'use client'

// ============================================================================
// User Dashboard Page
// ============================================================================
// Comprehensive personalized dashboard with 12 major features
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { getUserDashboardData } from '@/lib/dashboard/queries'
import { DashboardData } from '@/lib/dashboard/types'
import { getMotivationalMessage } from '@/lib/dashboard/utils'

// Components
import { ProfileSummaryCard } from '@/components/dashboard/ProfileSummaryCard'
import { PerformanceOverview } from '@/components/dashboard/PerformanceOverview'
import { RecentQuizResults } from '@/components/dashboard/RecentQuizResults'
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart'
import { StrengthWeaknessAnalysis } from '@/components/dashboard/StrengthWeaknessAnalysis'
import { QuickStartQuiz } from '@/components/dashboard/QuickStartQuiz'
import { AchievementsSection } from '@/components/dashboard/AchievementsSection'
import { LeaderboardPositionComponent } from '@/components/dashboard/LeaderboardPosition'
import { SectionHeader } from '@/components/dashboard/SectionHeader'
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton'
import { Button } from '@/components/ui/button'

// Icons
import {
    ArrowLeft,
    TrendingUp,
    BookOpen,
    Target,
    Trophy,
    Clock,
    Sparkles
} from 'lucide-react'

export default function UserDashboardPage() {
    const auth = useRequireAuth('user')
    const router = useRouter()
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (auth.user) {
            loadDashboard()
        }
    }, [auth.user])

    const loadDashboard = async () => {
        if (!auth.user) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await getUserDashboardData(auth.user.id)
            if (data) {
                setDashboardData(data)
            } else {
                setError('Failed to load dashboard data')
            }
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setError('An error occurred while loading your dashboard')
        } finally {
            setIsLoading(false)
        }
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mt-20" />
                        <p className="text-center mt-4 text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
                        <Button onClick={loadDashboard}>Retry</Button>
                    </div>
                </div>
            </div>
        )
    }

    const motivationalMessage = getMotivationalMessage(
        dashboardData.performance.accuracyPercentage,
        dashboardData.profile.currentStreak
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Welcome back, {dashboardData.profile.fullName.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">
                                {motivationalMessage}
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="border-2 border-gray-800 text-gray-800"
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Back
                        </Button>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Left Column - Profile & Quick Start */}
                        <div className="space-y-6">
                            <ProfileSummaryCard profile={dashboardData.profile} />
                            <QuickStartQuiz config={dashboardData.quickStartConfig} />
                        </div>

                        {/* Middle Column - Performance & Trends */}
                        <div className="lg:col-span-2 space-y-6">
                            <PerformanceOverview metrics={dashboardData.performance} />

                            {/* Score Trend */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <SectionHeader
                                    title="Score Trends"
                                    subtitle="Your performance over time"
                                    icon={TrendingUp}
                                />
                                <ScoreTrendChart data={dashboardData.scoreTrend} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Quizzes & Category Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Recent Quizzes */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <SectionHeader
                                title="Recent Quizzes"
                                subtitle="Your latest attempts"
                                icon={BookOpen}
                            />
                            <RecentQuizResults quizzes={dashboardData.recentQuizzes} />
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <SectionHeader
                                title="Category Performance"
                                subtitle="Your strengths and areas to improve"
                                icon={Target}
                            />
                            <StrengthWeaknessAnalysis categories={dashboardData.categoryPerformance} />
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                        <SectionHeader
                            title="Achievements"
                            subtitle="Your badges and milestones"
                            icon={Trophy}
                        />
                        <AchievementsSection achievements={dashboardData.achievements} />
                    </div>

                    {/* Leaderboard Position */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* Study Plan Placeholder */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <SectionHeader
                                    title="Recommended Focus Areas"
                                    subtitle="Based on your performance"
                                    icon={Sparkles}
                                />
                                <div className="space-y-3">
                                    {dashboardData.recommendations.slice(0, 3).map((rec, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {rec.categoryName}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full ${rec.priority === 'high'
                                                        ? 'bg-red-100 text-red-700'
                                                        : rec.priority === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {rec.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{rec.reason}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                <span className="capitalize">{rec.difficulty} difficulty</span>
                                                <span>•</span>
                                                <span>{rec.estimatedQuestions} questions</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div>
                            <LeaderboardPositionComponent position={dashboardData.leaderboardPosition} />
                        </div>
                    </div>

                    {/* Time Analytics Placeholder */}
                    <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <SectionHeader
                            title="Practice Time"
                            subtitle="Your study sessions"
                            icon={Clock}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Total Time</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {Math.floor(dashboardData.timeAnalytics.totalTimeSeconds / 3600)}h {Math.floor((dashboardData.timeAnalytics.totalTimeSeconds % 3600) / 60)}m
                                </p>
                            </div>
                            <div className="text-center p-6 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Avg Session</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {Math.floor(dashboardData.timeAnalytics.averageSessionSeconds / 60)}m
                                </p>
                            </div>
                            <div className="text-center p-6 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Total Sessions</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {dashboardData.timeAnalytics.totalSessions}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
