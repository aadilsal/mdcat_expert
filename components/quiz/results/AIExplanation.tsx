'use client'

// ============================================================================
// AI Explanation Component
// ============================================================================
// Displays AI-generated explanations with loading, caching, and regeneration
// ============================================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface AIExplanationProps {
    sessionId: string
    questionId: string
    initialExplanation?: string
    isCached?: boolean
}

export function AIExplanation({
    sessionId,
    questionId,
    initialExplanation,
    isCached = false,
}: AIExplanationProps) {
    const [explanation, setExplanation] = useState(initialExplanation || '')
    const [isLoading, setIsLoading] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cached, setCached] = useState(isCached)
    const [regenerationsRemaining, setRegenerationsRemaining] = useState<number | null>(null)
    const [showConfirmation, setShowConfirmation] = useState(false)

    // Load explanation if not initially provided
    const loadExplanation = async () => {
        if (explanation) return // Already loaded

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/quiz/results/${sessionId}/explanation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: questionId }),
            })

            if (!response.ok) {
                throw new Error('Failed to load explanation')
            }

            const data = await response.json()
            setExplanation(data.explanation)
            setCached(data.cached)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load explanation')
        } finally {
            setIsLoading(false)
        }
    }

    // Regenerate explanation
    const handleRegenerate = async () => {
        setShowConfirmation(false)
        setIsRegenerating(true)
        setError(null)

        try {
            const response = await fetch(`/api/quiz/results/${sessionId}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: questionId }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to regenerate explanation')
            }

            const data = await response.json()
            setExplanation(data.explanation)
            setRegenerationsRemaining(data.regenerations_remaining)
            setCached(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate explanation')
        } finally {
            setIsRegenerating(false)
        }
    }

    // Auto-load explanation when component mounts
    useState(() => {
        if (!explanation) {
            loadExplanation()
        }
    })

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">AI Explanation</h4>
                    {cached && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Cached
                        </span>
                    )}
                </div>

                {explanation && !isLoading && (
                    <button
                        onClick={() => setShowConfirmation(true)}
                        disabled={isRegenerating}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-800 text-sm">{error}</p>
                        <button
                            onClick={loadExplanation}
                            className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Explanation Content */}
            {explanation && !isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-sm max-w-none"
                >
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {explanation}
                    </p>
                </motion.div>
            )}

            {/* Regeneration Info */}
            {regenerationsRemaining !== null && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>
                        {regenerationsRemaining} regeneration{regenerationsRemaining !== 1 ? 's' : ''} remaining
                    </span>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Regenerate Explanation?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            This will generate a new AI explanation for this question. You have a limited number of regenerations per question.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRegenerate}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                Regenerate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
