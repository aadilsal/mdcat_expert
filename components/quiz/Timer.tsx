'use client'

// ============================================================================
// Timer Component
// ============================================================================
// Countdown timer with urgency indicators
// ============================================================================

import { Clock, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TimerProps {
    timeRemaining: number
    formattedTime: string
    urgencyLevel: 'normal' | 'warning' | 'critical'
    isPaused: boolean
}

export function Timer({ timeRemaining, formattedTime, urgencyLevel, isPaused }: TimerProps) {
    const [showWarning, setShowWarning] = useState(false)

    // Show warning animation for critical time
    useEffect(() => {
        if (urgencyLevel === 'critical' && !isPaused) {
            const interval = setInterval(() => {
                setShowWarning(prev => !prev)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [urgencyLevel, isPaused])

    const colorClasses = {
        normal: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        critical: showWarning ? 'bg-red-200 text-red-900 border-red-400' : 'bg-red-100 text-red-800 border-red-300'
    }

    const iconColorClasses = {
        normal: 'text-green-600',
        warning: 'text-yellow-600',
        critical: 'text-red-600'
    }

    return (
        <div className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all duration-300 ${colorClasses[urgencyLevel]}`}>
            {urgencyLevel === 'critical' ? (
                <AlertTriangle className={`w-5 h-5 mr-2 ${iconColorClasses[urgencyLevel]}`} />
            ) : (
                <Clock className={`w-5 h-5 mr-2 ${iconColorClasses[urgencyLevel]}`} />
            )}
            <div>
                <div className="text-xs font-medium opacity-75">
                    {isPaused ? 'Paused' : 'Time Remaining'}
                </div>
                <div className="text-lg font-bold font-mono">{formattedTime}</div>
            </div>
        </div>
    )
}
