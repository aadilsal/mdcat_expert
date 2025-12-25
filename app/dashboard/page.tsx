'use client'

// ============================================================================
// User Dashboard Page
// ============================================================================
// Comprehensive personalized dashboard with 12 major features
// ============================================================================

import './dashboard-animations.css'
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
    LogOut,
    TrendingUp,
    BookOpen,
    Target,
    Trophy,
    Clock,
    Sparkles,
    Shield,
    User,
    Home,
    BarChart
} from 'lucide-react'
import { signOut } from '@/lib/auth/session'

export default function DashboardPage() {
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
            setDashboardData(data) // Set data even if null - we'll handle empty state
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setError('An error occurred while loading your dashboard')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    // Header Component
    const DashboardHeader = () => (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            MDCAT Expert
                        </h1>
                        <nav className="hidden md:flex items-center gap-4">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="ghost"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                                <Home className="mr-2" size={18} />
                                Dashboard
                            </Button>
                            <Button
                                onClick={() => router.push('/quiz')}
                                variant="ghost"
                                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                            >
                                <BookOpen className="mr-2" size={18} />
                                Quizzes
                            </Button>
                            <Button
                                onClick={() => router.push('/leaderboard')}
                                variant="ghost"
                                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                            >
                                <Trophy className="mr-2" size={18} />
                                Leaderboard
                            </Button>
                            {auth.role === 'admin' && (
                                <Button
                                    onClick={() => router.push('/admin/dashboard')}
                                    variant="ghost"
                                    className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                                >
                                    <Shield className="mr-2" size={18} />
                                    Admin
                                </Button>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push('/profile')}
                            variant="outline"
                            className="text-gray-900 border-gray-300 hover:bg-gray-50"
                        >
                            <User className="mr-2" size={18} />
                            Profile
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="mr-2" size={18} />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )

    // Footer Component
    const DashboardFooter = () => (
        <footer className="relative bg-white/80 backdrop-blur-md border-t-2 border-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mt-12">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-600 text-sm">
                        © 2025 MDCAT Expert. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <a href="#" className="text-gray-600 hover:text-purple-600">About</a>
                        <a href="#" className="text-gray-600 hover:text-purple-600">Help</a>
                        <a href="#" className="text-gray-600 hover:text-purple-600">Privacy</a>
                        <a href="#" className="text-gray-600 hover:text-purple-600">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    )

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col relative overflow-hidden">
                {/* Decorative Gradient Orbs */}
                <div className="gradient-orb gradient-orb-1 animate-float" />
                <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '2s' }} />
                <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '4s' }} />

                {/* Background Pattern */}
                <div className="absolute inset-0 pattern-dots opacity-30" />

                <DashboardHeader />
                <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mt-20" />
                        <p className="text-center mt-4 text-gray-700 font-medium">Loading your dashboard...</p>
                    </div>
                </div>
                <DashboardFooter />
            </div>
        )
    }

    // If there's an error or no data, show empty state with navigation
    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col relative overflow-hidden">
                {/* Decorative Gradient Orbs */}
                <div className="gradient-orb gradient-orb-1 animate-float" />
                <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '2s' }} />
                <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '4s' }} />

                {/* Background Pattern */}
                <div className="absolute inset-0 pattern-dots opacity-30" />

                <DashboardHeader />
                <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Message */}
                        <div className="text-center mb-12 animate-fade-in-up">
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-gradient">
                                Welcome to MDCAT Expert! 👋
                            </h2>
                            <p className="text-gray-700 text-lg font-medium">
                                Start your journey to MDCAT success
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div
                                onClick={() => router.push('/quiz')}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2 animate-fade-in-up delay-100"
                            >
                                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="text-purple-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Quiz</h3>
                                <p className="text-gray-600">Begin practicing with our comprehensive question bank</p>
                            </div>

                            <div
                                onClick={() => router.push('/leaderboard')}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2 animate-fade-in-up delay-200"
                            >
                                <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <Trophy className="text-yellow-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Leaderboard</h3>
                                <p className="text-gray-600">See how you rank against other students</p>
                            </div>

                            <div
                                onClick={() => router.push('/profile')}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2 animate-fade-in-up delay-300"
                            >
                                <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <User className="text-blue-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">My Account</h3>
                                <p className="text-gray-600">Manage your profile and settings</p>
                            </div>
                        </div>

                        {/* Getting Started */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-400">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Take Your First Quiz</h4>
                                        <p className="text-gray-600">Start with any category to assess your current knowledge level</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Track Your Progress</h4>
                                        <p className="text-gray-600">Your dashboard will show detailed analytics and recommendations</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Build Your Streak</h4>
                                        <p className="text-gray-600">Practice daily to maintain your streak and unlock achievements</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button
                                    onClick={() => router.push('/quiz')}
                                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
                                >
                                    <BookOpen className="mr-2" size={24} />
                                    Start Your First Quiz
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <DashboardFooter />
            </div>
        )
    }

    const motivationalMessage = getMotivationalMessage(
        dashboardData.performance.accuracyPercentage,
        dashboardData.profile.currentStreak
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col relative overflow-hidden">
            {/* Decorative Gradient Orbs */}
            <div className="gradient-orb gradient-orb-1 animate-float" />
            <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '2s' }} />
            <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '4s' }} />

            {/* Background Pattern */}
            <div className="absolute inset-0 pattern-dots opacity-30" />

            <DashboardHeader />

            <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Message */}
                    <div className="mb-8 animate-fade-in-up">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                            Welcome back, {dashboardData.profile.fullName.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-700 mt-3 text-lg font-medium">
                            {motivationalMessage}
                        </p>
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
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-300">
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
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-left">
                            <SectionHeader
                                title="Recent Quizzes"
                                subtitle="Your latest attempts"
                                icon={BookOpen}
                            />
                            <RecentQuizResults quizzes={dashboardData.recentQuizzes} />
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-right">
                            <SectionHeader
                                title="Category Performance"
                                subtitle="Your strengths and areas to improve"
                                icon={Target}
                            />
                            <StrengthWeaknessAnalysis categories={dashboardData.categoryPerformance} />
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 animate-fade-in">
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
                            {/* Study Plan */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <SectionHeader
                                    title="Recommended Focus Areas"
                                    subtitle="Based on your performance"
                                    icon={Sparkles}
                                />
                                <div className="space-y-3">
                                    {dashboardData.recommendations.slice(0, 3).map((rec, index) => (
                                        <div
                                            key={index}
                                            className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300"
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

                    {/* Time Analytics */}
                    <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <SectionHeader
                            title="Practice Time"
                            subtitle="Your study sessions"
                            icon={Clock}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:scale-105 transition-transform duration-300 border border-blue-200/50">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Total Time</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    {Math.floor(dashboardData.timeAnalytics.totalTimeSeconds / 3600)}h {Math.floor((dashboardData.timeAnalytics.totalTimeSeconds % 3600) / 60)}m
                                </p>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:scale-105 transition-transform duration-300 border border-green-200/50">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Avg Session</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {Math.floor(dashboardData.timeAnalytics.averageSessionSeconds / 60)}m
                                </p>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:scale-105 transition-transform duration-300 border border-purple-200/50">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Total Sessions</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {dashboardData.timeAnalytics.totalSessions}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardFooter />
        </div>
    )
}
