'use client'

// ============================================================================
// Churn Prediction Dashboard
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import {
    fetchChurnOverview,
    fetchAtRiskUsers,
    fetchChurnTrends,
    fetchActiveAlerts,
    getRetentionInsights,
    updateEngagementScores
} from '@/lib/admin/churn/queries'
import { ChurnOverview } from './components/ChurnOverview'
import { AtRiskUsersList } from './components/AtRiskUsersList'
import { ChurnTrendChart } from './components/ChurnTrendChart'
import { RiskDistributionChart } from './components/RiskDistributionChart'
import { AlertsPanel } from './components/AlertsPanel'
import { RetentionInsights } from './components/RetentionInsights'
import { ArrowLeft, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChurnDashboardPage() {
    const auth = useRequireAuth('admin')
    const router = useRouter()

    const [overview, setOverview] = useState<any>(null)
    const [atRiskUsers, setAtRiskUsers] = useState<any[]>([])
    const [trends, setTrends] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [insights, setInsights] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [timeFilter, setTimeFilter] = useState(30)

    useEffect(() => {
        if (auth.user) {
            loadDashboardData()
        }
    }, [auth.user, timeFilter])

    const loadDashboardData = async () => {
        setIsLoading(true)
        try {
            const [overviewData, usersData, trendsData, alertsData, insightsData] = await Promise.all([
                fetchChurnOverview(),
                fetchAtRiskUsers(undefined, 1, 10),
                fetchChurnTrends(timeFilter),
                fetchActiveAlerts(),
                getRetentionInsights()
            ])

            setOverview(overviewData)
            setAtRiskUsers(usersData.users)
            setTrends(trendsData)
            setAlerts(alertsData)
            setInsights(insightsData)
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateScores = async () => {
        setIsUpdating(true)
        try {
            await updateEngagementScores()
            await loadDashboardData()
        } catch (error) {
            console.error('Error updating scores:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleFilterChange = async (filter: 'all' | 'high' | 'medium' | 'low') => {
        const riskLevel = filter === 'all' ? undefined : filter
        const { users } = await fetchAtRiskUsers(riskLevel, 1, 10)
        setAtRiskUsers(users)
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
        )
    }

    if (!overview) return null

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
                                    Churn Prediction
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Identify at-risk users and improve retention
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleUpdateScores}
                                disabled={isUpdating}
                                variant="outline"
                                className="border-2 border-gray-800 text-gray-800"
                            >
                                <RefreshCw className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} size={20} />
                                {isUpdating ? 'Updating...' : 'Update Scores'}
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white border-2 border-gray-800 text-gray-800"
                            >
                                <Download className="mr-2" size={20} />
                                Export Report
                            </Button>
                        </div>
                    </div>

                    {/* Overview Metrics */}
                    <div className="mb-8">
                        <ChurnOverview data={overview} />
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <ChurnTrendChart data={trends} />
                        <RiskDistributionChart data={overview} />
                    </div>

                    {/* Alerts & Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <AlertsPanel
                            alerts={alerts}
                            adminId={auth.user?.id || ''}
                            onAlertDismissed={loadDashboardData}
                        />
                        {insights && <RetentionInsights insights={insights} />}
                    </div>

                    {/* At-Risk Users */}
                    <AtRiskUsersList
                        users={atRiskUsers}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </div>
        </div>
    )
}
