'use client'

// ============================================================================
// QuizHeader Component
// ============================================================================
// Header with timer, progress, and pause button
// ============================================================================

import { Pause, X } from 'lucide-react'
import { Timer } from './Timer'
import { ProgressBar } from './ProgressBar'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import type { SaveStatus } from '@/types'

interface QuizHeaderProps {
    quizTitle: string
    timeRemaining: number
    formattedTime: string
    urgencyLevel: 'normal' | 'warning' | 'critical'
    isPaused: boolean
    answeredCount: number
    totalQuestions: number
    saveStatus: SaveStatus
    allowPause: boolean
    onPause: () => void
    onExit: () => void
    onRetrySave?: () => void
}

export function QuizHeader({
    quizTitle,
    timeRemaining,
    formattedTime,
    urgencyLevel,
    isPaused,
    answeredCount,
    totalQuestions,
    saveStatus,
    allowPause,
    onPause,
    onExit,
    onRetrySave,
}: QuizHeaderProps) {
    return (
        <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900 truncate">{quizTitle}</h1>
                    <div className="flex items-center gap-3">
                        <SaveStatusIndicator status={saveStatus} onRetry={onRetrySave} />
                        {allowPause && (
                            <button
                                onClick={onPause}
                                className="flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </button>
                        )}
                        <button
                            onClick={onExit}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Exit quiz"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0">
                        <Timer
                            timeRemaining={timeRemaining}
                            formattedTime={formattedTime}
                            urgencyLevel={urgencyLevel}
                            isPaused={isPaused}
                        />
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                        <ProgressBar answered={answeredCount} total={totalQuestions} />
                    </div>
                </div>
            </div>
        </div>
    )
}
