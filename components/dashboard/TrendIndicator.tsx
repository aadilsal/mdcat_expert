'use client'

// ============================================================================
// Trend Indicator Component
// ============================================================================
// Shows up/down arrows with percentage changes
// ============================================================================

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendIndicatorProps {
    direction: 'up' | 'down' | 'neutral'
    value: number
    label?: string
}

export function TrendIndicator({ direction, value, label }: TrendIndicatorProps) {
    const isPositive = direction === 'up'
    const isNeutral = direction === 'neutral'

    const colorClass = isNeutral
        ? 'text-gray-600 bg-gray-100'
        : isPositive
            ? 'text-green-600 bg-green-100'
            : 'text-red-600 bg-red-100'

    const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${colorClass}`}>
            <Icon size={16} />
            <span className="text-sm font-medium">
                {Math.abs(value).toFixed(1)}%
            </span>
            {label && <span className="text-xs ml-1">{label}</span>}
        </div>
    )
}
