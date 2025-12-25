'use client'

// ============================================================================
// Churn Overview Component
// ============================================================================

import { TrendingUp, TrendingDown, Users, AlertTriangle, Shield, Activity } from 'lucide-react'

interface ChurnOverviewProps {
    data: {
        totalActiveUsers: number
        atRiskCount: number
        churnRate: number
        retentionRate: number
        avgEngagementScore: number
        trends: {
            activeUsers: number
            churnRate: number
            engagementScore: number
        }
    }
}

export function ChurnOverview({ data }: ChurnOverviewProps) {
    const metrics = [
        {
            title: 'Total Active Users',
            value: data.totalActiveUsers.toLocaleString(),
            icon: Users,
            color: 'blue',
            trend: data.trends.activeUsers,
            trendLabel: `${Math.abs(data.trends.activeUsers)}% vs last week`
        },
        {
            title: 'Users at Risk',
            value: data.atRiskCount.toLocaleString(),
            icon: AlertTriangle,
            color: 'orange',
            trend: 0,
            trendLabel: 'Medium + High risk'
        },
        {
            title: 'Churn Rate',
            value: `${data.churnRate}%`,
            icon: TrendingDown,
            color: 'red',
            trend: data.trends.churnRate,
            trendLabel: `${Math.abs(data.trends.churnRate)}% vs last week`
        },
        {
            title: 'Retention Rate',
            value: `${data.retentionRate}%`,
            icon: Shield,
            color: 'green',
            trend: -data.trends.churnRate,
            trendLabel: 'Inverse of churn'
        },
        {
            title: 'Avg Engagement',
            value: `${data.avgEngagementScore}/100`,
            icon: Activity,
            color: 'purple',
            trend: data.trends.engagementScore,
            trendLabel: `${Math.abs(data.trends.engagementScore)} pts vs last week`
        }
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            blue: { bg: 'bg-blue-100', text: 'text-blue-900', icon: 'text-blue-600' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-900', icon: 'text-orange-600' },
            red: { bg: 'bg-red-100', text: 'text-red-900', icon: 'text-red-600' },
            green: { bg: 'bg-green-100', text: 'text-green-900', icon: 'text-green-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-900', icon: 'text-purple-600' }
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric) => {
                const Icon = metric.icon
                const colors = getColorClasses(metric.color)
                const isPositive = metric.trend > 0
                const TrendIcon = isPositive ? TrendingUp : TrendingDown

                return (
                    <div
                        key={metric.title}
                        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 ${colors.bg} rounded-lg`}>
                                <Icon className={colors.icon} size={24} />
                            </div>
                            {metric.trend !== 0 && (
                                <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    <TrendIcon size={14} />
                                    <span>{Math.abs(metric.trend)}%</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                            {metric.title}
                        </h3>
                        <p className={`text-3xl font-bold ${colors.text} mb-1`}>
                            {metric.value}
                        </p>
                        <p className="text-xs text-gray-500">{metric.trendLabel}</p>
                    </div>
                )
            })}
        </div>
    )
}
