'use client'

// ============================================================================
// useQuizTimer Hook
// ============================================================================
// Custom hook for managing quiz countdown timer with persistence
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import type { QuizTimerState } from '@/types'
import { getUrgencyLevel, formatTime } from '../utils/quizHelpers'
import { updateTimerInLocal } from '../utils/storage'

interface UseQuizTimerProps {
    initialTimeSeconds: number
    sessionId: string
    onTimeExpired: () => void
    autoStart?: boolean
}

interface UseQuizTimerReturn extends QuizTimerState {
    formattedTime: string
    start: () => void
    pause: () => void
    resume: () => void
    reset: (newTime?: number) => void
    addTime: (seconds: number) => void
}

export function useQuizTimer({
    initialTimeSeconds,
    sessionId,
    onTimeExpired,
    autoStart = true,
}: UseQuizTimerProps): UseQuizTimerReturn {
    const [timeRemaining, setTimeRemaining] = useState(initialTimeSeconds)
    const [isRunning, setIsRunning] = useState(autoStart)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastSaveRef = useRef<number>(0)

    // Calculate urgency level
    const urgencyLevel = getUrgencyLevel(timeRemaining, initialTimeSeconds)

    // Format time for display
    const formattedTime = formatTime(timeRemaining)

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    // Timer countdown logic
    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1

                // Save to localStorage every 5 seconds
                const now = Date.now()
                if (now - lastSaveRef.current > 5000) {
                    updateTimerInLocal(sessionId, newTime)
                    lastSaveRef.current = now
                }

                // Check if time expired
                if (newTime <= 0) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                        intervalRef.current = null
                    }
                    setIsRunning(false)
                    onTimeExpired()
                    return 0
                }

                return newTime
            })
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isRunning, sessionId, onTimeExpired])

    // Start timer
    const start = useCallback(() => {
        setIsRunning(true)
    }, [])

    // Pause timer
    const pause = useCallback(() => {
        setIsRunning(false)
        updateTimerInLocal(sessionId, timeRemaining)
    }, [sessionId, timeRemaining])

    // Resume timer
    const resume = useCallback(() => {
        setIsRunning(true)
    }, [])

    // Reset timer
    const reset = useCallback((newTime?: number) => {
        const resetTime = newTime ?? initialTimeSeconds
        setTimeRemaining(resetTime)
        setIsRunning(false)
        updateTimerInLocal(sessionId, resetTime)
    }, [initialTimeSeconds, sessionId])

    // Add time to timer
    const addTime = useCallback((seconds: number) => {
        setTimeRemaining((prev) => {
            const newTime = prev + seconds
            updateTimerInLocal(sessionId, newTime)
            return newTime
        })
    }, [sessionId])

    return {
        time_remaining_seconds: timeRemaining,
        is_running: isRunning,
        urgency_level: urgencyLevel,
        formattedTime,
        start,
        pause,
        resume,
        reset,
        addTime,
    }
}
