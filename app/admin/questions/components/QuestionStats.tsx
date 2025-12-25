'use client'

// ============================================================================
// Question Stats Component
// ============================================================================

import { TrendingUp, Target, Clock } from 'lucide-react'

interface QuestionStatsProps {
    timesAttempted: number
    correctPercentage: number
    avgResponseTime?: number
}

export function QuestionStats({
    timesAttempted,
    correctPercentage,
    avgResponseTime
}: QuestionStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Times Attempted */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-blue-600" size={18} />
                    <span className="text-sm text-blue-700 font-medium">Attempts</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{timesAttempted}</p>
            </div>

            {/* Correct Percentage */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="text-green-600" size={18} />
                    <span className="text-sm text-green-700 font-medium">Accuracy</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-green-900">{correctPercentage.toFixed(0)}%</p>
                    <div className="mt-2 bg-green-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${correctPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Average Response Time */}
            {avgResponseTime !== undefined && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-purple-600" size={18} />
                        <span className="text-sm text-purple-700 font-medium">Avg Time</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                        {(avgResponseTime / 1000).toFixed(1)}s
                    </p>
                </div>
            )}
        </div>
    )
}
