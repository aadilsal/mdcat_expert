'use client'

// ============================================================================
// Practice Suggestions Component
// ============================================================================
// Displays recommended practice questions by topic
// ============================================================================

import { motion } from 'framer-motion'
import { Target, TrendingUp, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { PracticeSuggestion } from '@/types'

interface PracticeSuggestionsProps {
    suggestions: PracticeSuggestion[]
}

export function PracticeSuggestions({ suggestions }: PracticeSuggestionsProps) {
    const router = useRouter()

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-700 border-green-300'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300'
            case 'hard':
                return 'bg-red-100 text-red-700 border-red-300'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const handleStartQuiz = (topicId: string, difficulty: string) => {
        // Navigate to quiz with topic and difficulty filters
        router.push(`/quiz?topic=${topicId}&difficulty=${difficulty}`)
    }

    if (suggestions.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practice Suggestions</h3>
                <p className="text-gray-600">Complete more quizzes to get personalized practice recommendations.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Recommended Practice</h2>
            </div>

            <p className="text-gray-600 mb-6">
                Based on your performance, here are the topics you should practice to improve your scores.
            </p>

            <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                    <motion.div
                        key={suggestion.topicId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                {/* Topic Name & Accuracy */}
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {suggestion.topicName}
                                    </h3>
                                    <span className="text-sm text-gray-600">
                                        Current: {suggestion.currentAccuracy.toFixed(1)}%
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${suggestion.currentAccuracy >= 80
                                                    ? 'bg-green-500'
                                                    : suggestion.currentAccuracy >= 60
                                                        ? 'bg-blue-500'
                                                        : 'bg-red-500'
                                                }`}
                                            style={{ width: `${suggestion.currentAccuracy}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Priority: {suggestion.priorityScore.toFixed(0)}/100</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(suggestion.recommendedDifficulty)}`}>
                                        {suggestion.recommendedDifficulty.toUpperCase()}
                                    </span>
                                    <span>{suggestion.questionCount} questions available</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleStartQuiz(suggestion.topicId, suggestion.recommendedDifficulty)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 flex-shrink-0"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Start Quiz
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
