'use client'

// ============================================================================
// Suggestions Page Component
// ============================================================================
// Main page for AI-powered personalized suggestions
// ============================================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import { RecommendationCard } from './RecommendationCard'
import { StudyPlanCard } from './StudyPlanCard'
import { PracticeSuggestions } from './PracticeSuggestions'
import { MotivationalInsights } from './MotivationalInsights'
import type { SuggestionsResponse } from '@/types'

export function SuggestionsPage() {
    const router = useRouter()
    const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [regenerationsRemaining, setRegenerationsRemaining] = useState<number | null>(null)
    const [showConfirmation, setShowConfirmation] = useState(false)

    // Fetch suggestions on mount
    useEffect(() => {
        fetchSuggestions()
    }, [])

    const fetchSuggestions = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/suggestions')

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || errorData.error || 'Failed to fetch suggestions')
            }

            const data = await response.json()
            setSuggestions(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load suggestions')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegenerate = async () => {
        setShowConfirmation(false)
        setIsRegenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/suggestions/regenerate', {
                method: 'POST',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to regenerate suggestions')
            }

            const data = await response.json()
            setSuggestions(data)
            setRegenerationsRemaining(data.regenerationsRemaining)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate suggestions')
        } finally {
            setIsRegenerating(false)
        }
    }

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your performance...</p>
                    <p className="text-sm text-gray-500 mt-2">Generating personalized suggestions</p>
                </div>
            </div>
        )
    }

    // Error State
    if (error && !suggestions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Unable to Load Suggestions
                        </h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchSuggestions}
                                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!suggestions) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    AI-Powered Suggestions
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Personalized recommendations based on your performance
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {suggestions.cached && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    Cached
                                </span>
                            )}
                            <button
                                onClick={() => setShowConfirmation(true)}
                                disabled={isRegenerating}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Regeneration Success */}
                    {regenerationsRemaining !== null && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 text-sm">
                                ✓ Suggestions regenerated successfully! {regenerationsRemaining} regeneration{regenerationsRemaining !== 1 ? 's' : ''} remaining today.
                            </p>
                        </div>
                    )}

                    {/* Motivational Insights */}
                    {suggestions.motivationalInsights && suggestions.motivationalInsights.length > 0 && (
                        <MotivationalInsights insights={suggestions.motivationalInsights} />
                    )}

                    {/* AI Recommendations */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Personalized Recommendations
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {suggestions.recommendations.map((rec, index) => (
                                <RecommendationCard
                                    key={rec.id}
                                    recommendation={rec}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Study Plan */}
                    {suggestions.studyPlan && (
                        <StudyPlanCard studyPlan={suggestions.studyPlan} />
                    )}

                    {/* Practice Suggestions */}
                    {suggestions.practiceSuggestions && (
                        <PracticeSuggestions suggestions={suggestions.practiceSuggestions} />
                    )}

                    {/* AI Attribution */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 text-sm text-purple-800">
                                <p className="font-semibold mb-1">AI-Generated Suggestions</p>
                                <p>
                                    These recommendations are generated by AI based on your quiz performance data.
                                    They are meant to guide your study plan but should be adapted to your individual needs.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Regeneration Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Regenerate Suggestions?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            This will generate fresh AI suggestions based on your current performance.
                            You have a limited number of regenerations per day.
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
