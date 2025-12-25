'use client'

// ============================================================================
// Churn Trend Chart Component
// ============================================================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChurnTrendChartProps {
    data: Array<{
        date: string
        avgChurnProbability: number
        avgEngagementScore: number
        highRiskCount: number
        mediumRiskCount: number
        lowRiskCount: number
    }>
}

export function ChurnTrendChart({ data }: ChurnTrendChartProps) {
    const formattedData = data.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="avgChurnProbability"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Avg Churn Probability"
                        dot={{ fill: '#ef4444' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="avgEngagementScore"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Avg Engagement Score"
                        dot={{ fill: '#8b5cf6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
