'use client'

// ============================================================================
// QuizResults Component
// ============================================================================
// Display quiz results after submission
// ============================================================================

import { Trophy, Target, Clock, TrendingUp, Home, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCompletionMessage, formatTimeHuman } from '@/lib/quiz/utils/quizHelpers'

interface QuizResultsProps {
    score: number
    totalQuestions: number
    accuracyPercentage: number
    timeTakenSeconds: number
    correctAnswers: number
    incorrectAnswers: number
}

export function QuizResults({
    score,
    totalQuestions,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers,
    incorrectAnswers,
}: QuizResultsProps) {
    const router = useRouter()
    const message = getCompletionMessage(score, totalQuestions)

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="bg-white rounded-lg shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                        <Trophy className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
                    <p className="text-xl text-gray-600">{message}</p>
                </div>

                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Your Score</div>
                        <div className="text-5xl font-bold text-blue-600 mb-2">
                            {score}/{totalQuestions}
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {accuracyPercentage}% Accuracy
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-900">{correctAnswers}</div>
                            <div className="text-xs text-green-600">Correct</div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-900">{incorrectAnswers}</div>
                            <div className="text-xs text-red-600">Incorrect</div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900">
                                {formatTimeHuman(timeTakenSeconds)}
                            </div>
                            <div className="text-xs text-blue-600">Time Taken</div>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-900">{accuracyPercentage}%</div>
                            <div className="text-xs text-purple-600">Accuracy</div>
                        </div>
                    </div>
                </div>

                {/* Performance Message */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 text-center">
                        {accuracyPercentage >= 90 && "Outstanding performance! You've mastered this topic."}
                        {accuracyPercentage >= 75 && accuracyPercentage < 90 && "Great work! You have a strong understanding of the material."}
                        {accuracyPercentage >= 60 && accuracyPercentage < 75 && "Good effort! Review the topics you missed to improve further."}
                        {accuracyPercentage >= 50 && accuracyPercentage < 60 && "Keep practicing! Focus on understanding the concepts better."}
                        {accuracyPercentage < 50 && "Don't give up! Review the material and try again."}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Take Another Quiz
                    </button>
                </div>
            </div>
        </div>
    )
}
