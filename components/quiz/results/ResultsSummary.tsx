'use client'

// ============================================================================
// Results Summary Component
// ============================================================================
// Displays quiz score with animated circular progress and success indicators
// ============================================================================

import { motion } from 'framer-motion'
import { Trophy, Target, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ResultsSummaryProps {
    score: number
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracyPercentage: number
}

export function ResultsSummary({
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracyPercentage,
}: ResultsSummaryProps) {
    const [animatedScore, setAnimatedScore] = useState(0)
    const isPassed = accuracyPercentage >= 60
    const isExcellent = accuracyPercentage >= 80

    // Animate score counter
    useEffect(() => {
        const duration = 2000
        const steps = 60
        const increment = accuracyPercentage / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= accuracyPercentage) {
                setAnimatedScore(accuracyPercentage)
                clearInterval(timer)
            } else {
                setAnimatedScore(current)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [accuracyPercentage])

    // Confetti effect for excellent scores
    useEffect(() => {
        if (isExcellent) {
            // Simple confetti animation (you can enhance this with a library)
            console.log('🎉 Excellent score!')
        }
    }, [isExcellent])

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="inline-block"
                >
                    <Trophy
                        className={`w-16 h-16 mx-auto mb-4 ${isExcellent
                                ? 'text-yellow-500'
                                : isPassed
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                            }`}
                    />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isExcellent
                        ? '🌟 Excellent Performance!'
                        : isPassed
                            ? '✅ Great Job!'
                            : '💪 Keep Practicing!'}
                </h1>
                <p className="text-gray-600">
                    {isExcellent
                        ? "You're mastering this material!"
                        : isPassed
                            ? 'You passed the quiz successfully!'
                            : "Don't worry, practice makes perfect!"}
                </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke={
                                isExcellent
                                    ? '#10b981'
                                    : isPassed
                                        ? '#3b82f6'
                                        : '#ef4444'
                            }
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 553 }}
                            animate={{
                                strokeDashoffset: 553 - (553 * animatedScore) / 100,
                            }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: 553,
                            }}
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-center"
                        >
                            <div className="text-4xl font-bold text-gray-900">
                                {Math.round(animatedScore)}%
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Accuracy</div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-3 gap-4">
                {/* Total Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center"
                >
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                        {score}/{totalQuestions}
                    </div>
                    <div className="text-sm text-blue-700">Total Score</div>
                </motion.div>

                {/* Correct Answers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center"
                >
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                        {correctAnswers}
                    </div>
                    <div className="text-sm text-green-700">Correct</div>
                </motion.div>

                {/* Incorrect Answers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center"
                >
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                        {incorrectAnswers}
                    </div>
                    <div className="text-sm text-red-700">Incorrect</div>
                </motion.div>
            </div>

            {/* Performance Badge */}
            {isExcellent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 text-center"
                >
                    <TrendingUp className="w-6 h-6 inline-block mr-2" />
                    <span className="font-semibold">Outstanding Achievement!</span>
                </motion.div>
            )}
        </div>
    )
}
