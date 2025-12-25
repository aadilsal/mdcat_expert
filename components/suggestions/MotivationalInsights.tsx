'use client'

// ============================================================================
// Motivational Insights Component
// ============================================================================
// Displays data-driven motivational messages
// ============================================================================

import { motion } from 'framer-motion'
import { TrendingUp, Award, Zap, Target } from 'lucide-react'
import type { MotivationalInsight } from '@/types'

interface MotivationalInsightsProps {
    insights: MotivationalInsight[]
}

export function MotivationalInsights({ insights }: MotivationalInsightsProps) {
    const getInsightConfig = (type: string) => {
        switch (type) {
            case 'progress':
                return {
                    icon: TrendingUp,
                    color: 'blue',
                    bg: 'from-blue-500 to-cyan-500',
                }
            case 'achievement':
                return {
                    icon: Award,
                    color: 'yellow',
                    bg: 'from-yellow-500 to-orange-500',
                }
            case 'improvement':
                return {
                    icon: Zap,
                    color: 'green',
                    bg: 'from-green-500 to-emerald-500',
                }
            case 'streak':
                return {
                    icon: Target,
                    color: 'purple',
                    bg: 'from-purple-500 to-pink-500',
                }
            default:
                return {
                    icon: TrendingUp,
                    color: 'blue',
                    bg: 'from-blue-500 to-cyan-500',
                }
        }
    }

    if (insights.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
                const config = getInsightConfig(insight.type)
                const Icon = config.icon

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-r ${config.bg} rounded-xl p-6 text-white shadow-lg`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium leading-relaxed">
                                    {insight.message}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
