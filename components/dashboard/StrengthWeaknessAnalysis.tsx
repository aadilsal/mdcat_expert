'use client'

// ============================================================================
// Strength & Weakness Analysis Component
// ============================================================================
// Displays category performance with horizontal bar charts
// ============================================================================

import { TrendingUp, TrendingDown } from 'lucide-react'
import { CategoryPerformance } from '@/lib/dashboard/types'
import { EmptyState } from './EmptyState'
import { BookOpen } from 'lucide-react'

interface StrengthWeaknessAnalysisProps {
    categories: CategoryPerformance[]
}

export function StrengthWeaknessAnalysis({ categories }: StrengthWeaknessAnalysisProps) {
    if (categories.length === 0) {
        return (
            <EmptyState
                icon={BookOpen}
                title="No Category Data"
                description="Complete quizzes in different categories to see your strengths and weaknesses!"
            />
        )
    }

    // Sort by accuracy
    const sortedCategories = [...categories].sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)

    return (
        <div className="space-y-4">
            {sortedCategories.map((category, index) => {
                const isStrength = index < 3
                const isWeakness = index >= sortedCategories.length - 3

                return (
                    <div key={category.categoryId} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                    {category.categoryName}
                                </span>
                                {isStrength && (
                                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        <TrendingUp size={12} />
                                        Strength
                                    </span>
                                )}
                                {isWeakness && (
                                    <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                        <TrendingDown size={12} />
                                        Needs Work
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {Math.round(category.accuracyPercentage)}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isStrength
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        : isWeakness
                                            ? 'bg-gradient-to-r from-orange-500 to-red-600'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                    }`}
                                style={{ width: `${category.accuracyPercentage}%` }}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>{category.correctAnswers}/{category.totalQuestions} correct</span>
                            <span>•</span>
                            <span>{category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
