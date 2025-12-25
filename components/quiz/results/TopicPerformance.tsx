'use client'

// ============================================================================
// Topic Performance Component
// ============================================================================
// Displays performance breakdown by topic/category
// ============================================================================

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { TopicBreakdown } from '@/types'

interface TopicPerformanceProps {
    topicBreakdown: TopicBreakdown
}

export function TopicPerformance({ topicBreakdown }: TopicPerformanceProps) {
    // Convert to array and sort by accuracy
    const topics = Object.values(topicBreakdown).sort((a, b) => b.accuracy - a.accuracy)

    // Identify strong and weak topics
    const strongTopics = topics.filter(t => t.accuracy >= 70)
    const weakTopics = topics.filter(t => t.accuracy < 50)

    const getAccuracyColor = (accuracy: number): string => {
        if (accuracy >= 80) return 'bg-green-500'
        if (accuracy >= 60) return 'bg-blue-500'
        if (accuracy >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getAccuracyTextColor = (accuracy: number): string => {
        if (accuracy >= 80) return 'text-green-700'
        if (accuracy >= 60) return 'text-blue-700'
        if (accuracy >= 40) return 'text-yellow-700'
        return 'text-red-700'
    }

    const getAccuracyBgColor = (accuracy: number): string => {
        if (accuracy >= 80) return 'bg-green-50 border-green-200'
        if (accuracy >= 60) return 'bg-blue-50 border-blue-200'
        if (accuracy >= 40) return 'bg-yellow-50 border-yellow-200'
        return 'bg-red-50 border-red-200'
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Performance by Topic
            </h2>

            {/* Insights */}
            {(strongTopics.length > 0 || weakTopics.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Strong Topics */}
                    {strongTopics.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <h3 className="font-semibold text-green-900">Strong Topics</h3>
                            </div>
                            <ul className="space-y-2">
                                {strongTopics.slice(0, 3).map((topic) => (
                                    <li key={topic.category_id} className="text-sm text-green-800">
                                        • {topic.category_name} ({topic.accuracy.toFixed(0)}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weak Topics */}
                    {weakTopics.length > 0 && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                                <h3 className="font-semibold text-orange-900">Focus Areas</h3>
                            </div>
                            <ul className="space-y-2">
                                {weakTopics.slice(0, 3).map((topic) => (
                                    <li key={topic.category_id} className="text-sm text-orange-800">
                                        • {topic.category_name} ({topic.accuracy.toFixed(0)}%)
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-orange-700 mt-3">
                                💡 Practice more quizzes in these topics to improve
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Topic List */}
            <div className="space-y-4">
                {topics.map((topic, index) => (
                    <motion.div
                        key={topic.category_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-6 border-2 ${getAccuracyBgColor(topic.accuracy)}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <BookOpen className={`w-5 h-5 ${getAccuracyTextColor(topic.accuracy)}`} />
                                <h4 className="font-semibold text-gray-900">
                                    {topic.category_name}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2">
                                {topic.accuracy >= 70 ? (
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : topic.accuracy < 50 ? (
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                ) : null}
                                <span className={`text-2xl font-bold ${getAccuracyTextColor(topic.accuracy)}`}>
                                    {topic.accuracy.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${topic.accuracy}%` }}
                                    transition={{ duration: 1, delay: index * 0.05 }}
                                    className={`h-full ${getAccuracyColor(topic.accuracy)} rounded-full`}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {topic.correct} / {topic.total} correct
                            </span>
                            <span className="text-gray-600">
                                {topic.total} question{topic.total !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* No Data */}
            {topics.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No topic data available</p>
                </div>
            )}
        </div>
    )
}
