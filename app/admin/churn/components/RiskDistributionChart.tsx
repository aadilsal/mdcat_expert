'use client'

// ============================================================================
// Risk Distribution Chart Component
// ============================================================================

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface RiskDistributionChartProps {
    data: {
        highRiskCount: number
        mediumRiskCount: number
        lowRiskCount: number
    }
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
    const chartData = [
        { name: 'High Risk', count: data.highRiskCount, color: '#ef4444' },
        { name: 'Medium Risk', count: data.mediumRiskCount, color: '#f97316' },
        { name: 'Low Risk', count: data.lowRiskCount, color: '#22c55e' }
    ]

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
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
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
