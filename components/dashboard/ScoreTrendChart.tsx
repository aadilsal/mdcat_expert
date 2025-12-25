'use client'

// ============================================================================
// Score Trend Chart Component
// ============================================================================
// Line chart showing score trends over time using Recharts
// ============================================================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { ScoreTrendData } from '@/lib/dashboard/types'

interface ScoreTrendChartProps {
    data: ScoreTrendData[]
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No trend data available yet. Complete more quizzes to see your progress!</p>
            </div>
        )
    }

    // Format data for chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(item.score),
        accuracy: Math.round(item.accuracy)
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px'
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                />
                <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    strokeWidth={2}
                    name="Score"
                />
                <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                    strokeWidth={2}
                    name="Accuracy"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
