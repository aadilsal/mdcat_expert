'use client'

// ============================================================================
// Difficulty Analysis Component
// ============================================================================
// Visualizes performance breakdown by difficulty level
// ============================================================================

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DifficultyBreakdown } from '@/types'

interface DifficultyAnalysisProps {
    difficultyBreakdown: DifficultyBreakdown
}

export function DifficultyAnalysis({ difficultyBreakdown }: DifficultyAnalysisProps) {
    // Prepare data for charts
    const pieData = [
        { name: 'Easy', value: difficultyBreakdown.easy.total, color: '#10b981' },
        { name: 'Medium', value: difficultyBreakdown.medium.total, color: '#f59e0b' },
        { name: 'Hard', value: difficultyBreakdown.hard.total, color: '#ef4444' },
    ].filter(item => item.value > 0)

    const barData = [
        {
            difficulty: 'Easy',
            accuracy: difficultyBreakdown.easy.accuracy,
            correct: difficultyBreakdown.easy.correct,
            total: difficultyBreakdown.easy.total,
        },
        {
            difficulty: 'Medium',
            accuracy: difficultyBreakdown.medium.accuracy,
            correct: difficultyBreakdown.medium.correct,
            total: difficultyBreakdown.medium.total,
        },
        {
            difficulty: 'Hard',
            accuracy: difficultyBreakdown.hard.accuracy,
            correct: difficultyBreakdown.hard.correct,
            total: difficultyBreakdown.hard.total,
        },
    ].filter(item => item.total > 0)

    const getTrendIcon = (accuracy: number) => {
        if (accuracy >= 70) return <TrendingUp className="w-5 h-5 text-green-600" />
        if (accuracy >= 50) return <Minus className="w-5 h-5 text-yellow-600" />
        return <TrendingDown className="w-5 h-5 text-red-600" />
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Performance by Difficulty
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart - Question Distribution */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Question Distribution
                    </h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>

                {/* Bar Chart - Accuracy by Difficulty */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Accuracy by Difficulty
                    </h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="difficulty" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                                    <p className="font-semibold">{data.difficulty}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Accuracy: {data.accuracy.toFixed(1)}%
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Correct: {data.correct}/{data.total}
                                                    </p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {/* Easy */}
                {difficultyBreakdown.easy.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-green-900">Easy</h4>
                            {getTrendIcon(difficultyBreakdown.easy.accuracy)}
                        </div>
                        <div className="text-3xl font-bold text-green-900 mb-1">
                            {difficultyBreakdown.easy.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-700">
                            {difficultyBreakdown.easy.correct}/{difficultyBreakdown.easy.total} correct
                        </div>
                    </motion.div>
                )}

                {/* Medium */}
                {difficultyBreakdown.medium.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-yellow-900">Medium</h4>
                            {getTrendIcon(difficultyBreakdown.medium.accuracy)}
                        </div>
                        <div className="text-3xl font-bold text-yellow-900 mb-1">
                            {difficultyBreakdown.medium.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-sm text-yellow-700">
                            {difficultyBreakdown.medium.correct}/{difficultyBreakdown.medium.total} correct
                        </div>
                    </motion.div>
                )}

                {/* Hard */}
                {difficultyBreakdown.hard.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-red-900">Hard</h4>
                            {getTrendIcon(difficultyBreakdown.hard.accuracy)}
                        </div>
                        <div className="text-3xl font-bold text-red-900 mb-1">
                            {difficultyBreakdown.hard.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-sm text-red-700">
                            {difficultyBreakdown.hard.correct}/{difficultyBreakdown.hard.total} correct
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
