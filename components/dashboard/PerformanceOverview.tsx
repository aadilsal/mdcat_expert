'use client'

// ============================================================================
// Performance Overview Component
// ============================================================================
// Displays key performance metrics in a grid of metric cards
// ============================================================================

import { BookOpen, Target, TrendingUp, Trophy } from 'lucide-react'
import { PerformanceMetrics } from '@/lib/dashboard/types'
import { MetricCard } from './MetricCard'

interface PerformanceOverviewProps {
    metrics: PerformanceMetrics
}

export function PerformanceOverview({ metrics }: PerformanceOverviewProps) {
    const getTrendDirection = (trend: string): 'up' | 'down' | 'neutral' => {
        if (trend === 'improving') return 'up'
        if (trend === 'declining') return 'down'
        return 'neutral'
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Quizzes */}
            <div className="animate-fade-in-up delay-100">
                <MetricCard
                    title="Total Quizzes"
                    value={metrics.totalQuizzes.toLocaleString()}
                    icon={BookOpen}
                    color="blue"
                    subtitle="Completed"
                />
            </div>

            {/* Average Score */}
            <div className="animate-fade-in-up delay-200">
                <MetricCard
                    title="Average Score"
                    value={`${metrics.averageScore}%`}
                    icon={Target}
                    color="green"
                    trend={{
                        direction: getTrendDirection(metrics.scoreTrend),
                        value: metrics.scoreChange
                    }}
                />
            </div>

            {/* Accuracy */}
            <div className="animate-fade-in-up delay-300">
                <MetricCard
                    title="Accuracy"
                    value={`${metrics.accuracyPercentage}%`}
                    icon={TrendingUp}
                    color="purple"
                    subtitle="Overall performance"
                />
            </div>

            {/* Current Rank */}
            <div className="animate-fade-in-up delay-400">
                <MetricCard
                    title="Current Rank"
                    value={`#${metrics.currentRank}`}
                    icon={Trophy}
                    color="orange"
                    subtitle={`of ${metrics.totalUsers} users`}
                />
            </div>
        </div>
    )
}
