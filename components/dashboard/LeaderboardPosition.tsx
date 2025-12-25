'use client'

// ============================================================================
// Leaderboard Position Component
// ============================================================================
// Shows user's rank and nearby users
// ============================================================================

import { Trophy, TrendingUp, Medal } from 'lucide-react'
import { LeaderboardPosition } from '@/lib/dashboard/types'

interface LeaderboardPositionProps {
    position: LeaderboardPosition
}

export function LeaderboardPositionComponent({ position }: LeaderboardPositionProps) {
    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            {/* Current Rank */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-bold mb-3">
                    {position.currentRank <= 3 ? getMedalEmoji(position.currentRank) : `#${position.currentRank}`}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Rank</h3>
                <p className="text-gray-600">
                    Top {position.percentile}% of {position.totalUsers.toLocaleString()} users
                </p>
            </div>

            {/* Users Above */}
            {position.usersAbove.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Above You</p>
                    <div className="space-y-2">
                        {position.usersAbove.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        {getMedalEmoji(user.rank)}
                                    </span>
                                    <span className="text-sm text-gray-900">{user.fullName}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                    {user.totalCorrectAnswers}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current User Highlight */}
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-purple-600" size={20} />
                        <span className="font-bold text-gray-900">You</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                        {position.userScore}
                    </span>
                </div>
            </div>

            {/* Users Below */}
            {position.usersBelow.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Below You</p>
                    <div className="space-y-2">
                        {position.usersBelow.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        #{user.rank}
                                    </span>
                                    <span className="text-sm text-gray-900">{user.fullName}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                    {user.totalCorrectAnswers}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
