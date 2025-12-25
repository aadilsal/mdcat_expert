'use client'

// ============================================================================
// Retention Insights Component
// ============================================================================

import { Lightbulb, TrendingDown, BookOpen, Users } from 'lucide-react'

interface RetentionInsightsProps {
    insights: {
        weakCategories: number
        dropoffUsers: number
        insights: string[]
    }
}

export function RetentionInsights({ insights }: RetentionInsightsProps) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Retention Insights</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-orange-600" size={20} />
                        <span className="text-sm font-medium text-orange-900">Drop-off Users</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{insights.dropoffUsers}</p>
                    <p className="text-xs text-orange-700 mt-1">No quiz in 2+ weeks</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="text-blue-600" size={20} />
                        <span className="text-sm font-medium text-blue-900">Struggling Users</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{insights.weakCategories}</p>
                    <p className="text-xs text-blue-700 mt-1">Low performance</p>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Key Recommendations:</h4>
                {insights.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="p-1 bg-purple-100 rounded">
                            <Lightbulb className="text-purple-600" size={16} />
                        </div>
                        <p className="text-sm text-purple-900 flex-1">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
