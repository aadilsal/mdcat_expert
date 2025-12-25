'use client'

// ============================================================================
// Metric Card Component
// ============================================================================
// Reusable card for displaying key metrics with icons and trends
// ============================================================================

import { LucideIcon } from 'lucide-react'
import { TrendIndicator } from './TrendIndicator'

interface MetricCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        direction: 'up' | 'down' | 'neutral'
        value: number
        label?: string
    }
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
    subtitle?: string
}

const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
    pink: 'from-pink-500 to-rose-600'
}

const bgColorClasses = {
    blue: 'from-blue-50 to-cyan-50',
    green: 'from-green-50 to-emerald-50',
    purple: 'from-purple-50 to-pink-50',
    orange: 'from-orange-50 to-red-50',
    pink: 'from-pink-50 to-rose-50'
}

const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    pink: 'text-pink-600'
}

const borderColorClasses = {
    blue: 'from-blue-400 via-cyan-400 to-blue-400',
    green: 'from-green-400 via-emerald-400 to-green-400',
    purple: 'from-purple-400 via-pink-400 to-purple-400',
    orange: 'from-orange-400 via-red-400 to-orange-400',
    pink: 'from-pink-400 via-rose-400 to-pink-400'
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    subtitle
}: MetricCardProps) {
    return (
        <div className="group relative">
            {/* Gradient Border */}
            <div className={`absolute inset-0 bg-gradient-to-r ${borderColorClasses[color]} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />

            {/* Card Content */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                    {/* Animated Icon Background */}
                    <div className={`relative p-3 bg-gradient-to-br ${bgColorClasses[color]} rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Icon className={`${iconColorClasses[color]} relative z-10`} size={24} />
                    </div>
                    {trend && <TrendIndicator {...trend} />}
                </div>

                <p className="text-gray-600 text-sm mb-1 font-medium">{title}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
                    {value}
                </p>

                {subtitle && (
                    <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
                )}
            </div>
        </div>
    )
}
