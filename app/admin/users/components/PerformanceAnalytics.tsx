'use client'

// ============================================================================
// Performance Analytics Component
// ============================================================================

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Award } from 'lucide-react'
import { fetchUserPerformanceByCategory } from '@/lib/admin/users/queries'

interface PerformanceAnalyticsProps {
    userId: string
}

export function PerformanceAnalytics({ userId }: PerformanceAnalyticsProps) {
    const [performance, setPerformance] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadPerformance()
    }, [userId])

    const loadPerformance = async () => {
        setIsLoading(true)
        try {
            const data = await fetchUserPerformanceByCategory(userId)
            setPerformance(data || [])
        } catch (error) {
            console.error('Error loading performance:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="animate-pulse">Loading performance data...</div>
    }

    if (performance.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance by Category
                </h3>
                <p className="text-gray-500 text-center py-8">
                    No performance data available yet
                </p>
            </div>
        )
    }

    // Find strengths and weaknesses
    const sortedByAccuracy = [...performance].sort((a, b) => b.accuracy_percentage - a.accuracy_percentage)
    const strengths = sortedByAccuracy.slice(0, 3)
    const weaknesses = sortedByAccuracy.slice(-3).reverse()

    return (
        <div className="space-y-6">
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="text-green-600" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
                    </div>
                    <div className="space-y-3">
                        {strengths.map((cat) => (
                            <div key={cat.category_id} className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">{cat.category_name}</span>
                                <span className="text-green-600 font-bold">
                                    {cat.accuracy_percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weaknesses */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="text-orange-600" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900">Areas to Improve</h3>
                    </div>
                    <div className="space-y-3">
                        {weaknesses.map((cat) => (
                            <div key={cat.category_id} className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">{cat.category_name}</span>
                                <span className="text-orange-600 font-bold">
                                    {cat.accuracy_percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Performance */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-purple-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Performance by Category
                    </h3>
                </div>
                <div className="space-y-4">
                    {performance.map((cat) => (
                        <div key={cat.category_id}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-700 font-medium">{cat.category_name}</span>
                                <span className="text-sm text-gray-600">
                                    {cat.correct_answers}/{cat.total_questions} correct
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${cat.accuracy_percentage >= 80 ? 'bg-green-600' :
                                                cat.accuracy_percentage >= 60 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                            }`}
                                        style={{ width: `${cat.accuracy_percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-12 text-right">
                                    {cat.accuracy_percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
