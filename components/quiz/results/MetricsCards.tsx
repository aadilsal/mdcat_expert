'use client'

// ============================================================================
// Metrics Cards Component
// ============================================================================
// Displays time and accuracy metrics in card format
// ============================================================================

import { motion } from 'framer-motion'
import { Clock, Timer, Target, TrendingUp } from 'lucide-react'

interface MetricsCardsProps {
    timeTakenSeconds: number | null
    averageTimePerQuestion: number
    accuracyPercentage: number
    totalQuestions: number
}

export function MetricsCards({
    timeTakenSeconds,
    averageTimePerQuestion,
    accuracyPercentage,
    totalQuestions,
}: MetricsCardsProps) {
    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const metrics = [
        {
            icon: Clock,
            label: 'Total Time',
            value: timeTakenSeconds ? formatTime(timeTakenSeconds) : 'N/A',
            subtext: timeTakenSeconds ? `${timeTakenSeconds} seconds` : '',
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Timer,
            label: 'Avg Time/Question',
            value: `${Math.round(averageTimePerQuestion)}s`,
            subtext: `${totalQuestions} questions`,
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            icon: Target,
            label: 'Accuracy',
            value: `${Math.round(accuracyPercentage)}%`,
            subtext: accuracyPercentage >= 80 ? 'Excellent!' : accuracyPercentage >= 60 ? 'Good!' : 'Keep practicing!',
            color: accuracyPercentage >= 80 ? 'green' : accuracyPercentage >= 60 ? 'blue' : 'orange',
            gradient: accuracyPercentage >= 80
                ? 'from-green-500 to-emerald-500'
                : accuracyPercentage >= 60
                    ? 'from-blue-500 to-indigo-500'
                    : 'from-orange-500 to-red-500',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {metrics.map((metric, index) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-r ${metric.gradient} p-4`}>
                        <metric.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                            {metric.label}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {metric.value}
                        </div>
                        {metric.subtext && (
                            <div className="text-sm text-gray-500">{metric.subtext}</div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
