'use client'

// ============================================================================
// Quiz Results Page
// ============================================================================
// Main page component that displays comprehensive quiz results
// ============================================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ResultsSummary } from '@/components/quiz/results/ResultsSummary'
import { MetricsCards } from '@/components/quiz/results/MetricsCards'
import { QuestionBreakdown } from '@/components/quiz/results/QuestionBreakdown'
import { DifficultyAnalysis } from '@/components/quiz/results/DifficultyAnalysis'
import { TopicPerformance } from '@/components/quiz/results/TopicPerformance'
import { ShareResults } from '@/components/quiz/results/ShareResults'
import type { DetailedQuizResults } from '@/types'

interface QuizResultsPageProps {
    sessionId: string
}

export function QuizResultsPage({ sessionId }: QuizResultsPageProps) {
    const router = useRouter()
    const [results, setResults] = useState<DetailedQuizResults | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`/api/quiz/results/${sessionId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch quiz results')
                }

                const data = await response.json()
                setResults(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load results')
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [sessionId])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your results...</p>
                </div>
            </div>
        )
    }

    if (error || !results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'Failed to load quiz results'}
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Dashboard</span>
                            </button>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {results.quiz_title}
                        </h1>
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
                    {/* Results Summary */}
                    <ResultsSummary
                        score={results.score}
                        totalQuestions={results.total_questions}
                        correctAnswers={results.correct_answers}
                        incorrectAnswers={results.incorrect_answers}
                        accuracyPercentage={results.accuracy_percentage}
                    />

                    {/* Metrics Cards */}
                    <MetricsCards
                        timeTakenSeconds={results.time_taken_seconds}
                        averageTimePerQuestion={results.average_time_per_question}
                        accuracyPercentage={results.accuracy_percentage}
                        totalQuestions={results.total_questions}
                    />

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Difficulty Analysis */}
                        <DifficultyAnalysis difficultyBreakdown={results.difficulty_breakdown} />

                        {/* Topic Performance */}
                        <TopicPerformance topicBreakdown={results.topic_breakdown} />
                    </div>

                    {/* Question Breakdown */}
                    <QuestionBreakdown questions={results.questions} sessionId={sessionId} />

                    {/* Share Results */}
                    <ShareResults sessionId={sessionId} />

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center pb-8">
                        <button
                            onClick={() => router.push('/quiz')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Take Another Quiz
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
                        >
                            View Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
