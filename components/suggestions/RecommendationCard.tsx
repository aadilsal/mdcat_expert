'use client'

// ============================================================================
// Recommendation Card Component
// ============================================================================
// Displays individual AI-generated recommendation
// ============================================================================

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Recommendation } from '@/types'

interface RecommendationCardProps {
    recommendation: Recommendation
    index: number
}

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'high':
                return {
                    icon: AlertCircle,
                    color: 'red',
                    bg: 'from-red-50 to-orange-50',
                    border: 'border-red-200',
                    badge: 'bg-red-500',
                    text: 'text-red-700',
                }
            case 'medium':
                return {
                    icon: Info,
                    color: 'blue',
                    bg: 'from-blue-50 to-cyan-50',
                    border: 'border-blue-200',
                    badge: 'bg-blue-500',
                    text: 'text-blue-700',
                }
            default:
                return {
                    icon: CheckCircle2,
                    color: 'green',
                    bg: 'from-green-50 to-emerald-50',
                    border: 'border-green-200',
                    badge: 'bg-green-500',
                    text: 'text-green-700',
                }
        }
    }

    const config = getPriorityConfig(recommendation.priority)
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${config.bg} rounded-xl border-2 ${config.border} overflow-hidden`}
        >
            {/* Header */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-6 h-6 ${config.text} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`${config.badge} text-white text-xs font-bold px-2 py-1 rounded-full uppercase`}>
                                    {recommendation.priority}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {recommendation.what}
                            </h3>
                            <p className={`text-sm ${config.text} leading-relaxed`}>
                                {recommendation.why}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Action Steps (Expanded) */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                    >
                        <h4 className="font-semibold text-gray-900 mb-3">How to improve:</h4>
                        <ol className="space-y-2">
                            {recommendation.how.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className={`${config.badge} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm text-gray-700 flex-1">{step}</span>
                                </li>
                            ))}
                        </ol>

                        {/* Related Topics */}
                        {recommendation.relatedTopics.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Related Topics:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {recommendation.relatedTopics.map((topic, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
