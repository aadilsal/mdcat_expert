'use client'

// ============================================================================
// User Statistics Component
// ============================================================================

import { TrendingUp, Target, Clock, Award } from 'lucide-react'

interface UserStatsProps {
    stats: {
        total_quizzes?: number
        avg_score?: number
        avg_accuracy?: number
        last_quiz_date?: string
        login_count?: number
        last_login?: string
    }
}

export function UserStats({ stats }: UserStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Quizzes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Quizzes</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.total_quizzes || 0}
                        </p>
                    </div>
                </div>
                {stats.last_quiz_date && (
                    <p className="text-xs text-gray-500">
                        Last: {new Date(stats.last_quiz_date).toLocaleDateString()}
                    </p>
                )}
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <Award className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Avg Score</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {stats.avg_score?.toFixed(0) || 0}%
                        </p>
                    </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.avg_score || 0}%` }}
                    />
                </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Target className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Accuracy</p>
                        <p className="text-3xl font-bold text-green-600">
                            {stats.avg_accuracy?.toFixed(0) || 0}%
                        </p>
                    </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.avg_accuracy || 0}%` }}
                    />
                </div>
            </div>

            {/* Login Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <Clock className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Logins</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.login_count || 0}
                        </p>
                    </div>
                </div>
                {stats.last_login && (
                    <p className="text-xs text-gray-500">
                        Last: {new Date(stats.last_login).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    )
}
