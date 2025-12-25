'use client'

// ============================================================================
// Achievements Section Component
// ============================================================================
// Displays earned and locked achievements
// ============================================================================

import { Trophy, Lock } from 'lucide-react'
import { Achievement } from '@/lib/dashboard/types'

interface AchievementsSectionProps {
    achievements: Achievement[]
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
    const unlocked = achievements.filter(a => a.isUnlocked)
    const locked = achievements.filter(a => !a.isUnlocked)

    return (
        <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlocked.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-600" size={20} />
                        Earned Badges ({unlocked.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {unlocked.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl mb-2">🏆</div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">
                                    {achievement.achievementName}
                                </h4>
                                <p className="text-xs text-gray-600">
                                    {achievement.achievementDescription}
                                </p>
                                {achievement.unlockedAt && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {locked.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="text-gray-400" size={20} />
                        Locked Badges ({locked.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {locked.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center opacity-60 hover:opacity-80 transition-opacity"
                            >
                                <div className="text-4xl mb-2 grayscale">🏆</div>
                                <h4 className="font-bold text-gray-700 text-sm mb-1">
                                    {achievement.achievementName}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                    {achievement.achievementDescription}
                                </p>
                                <div className="flex items-center gap-1 justify-center text-xs text-gray-500">
                                    <Lock size={12} />
                                    <span>{achievement.requirement}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {achievements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Trophy className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>Complete quizzes to unlock achievements!</p>
                </div>
            )}
        </div>
    )
}
