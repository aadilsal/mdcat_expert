'use client'

// ============================================================================
// useQuizNavigation Hook
// ============================================================================
// Custom hook for managing quiz question navigation
// ============================================================================

import { useState, useCallback, useMemo } from 'react'
import type { QuizNavigationState } from '@/types'
import { updateCurrentIndexInLocal } from '../utils/storage'

interface UseQuizNavigationProps {
    totalQuestions: number
    sessionId: string
    currentIndex: number
    setCurrentIndex: (index: number) => void
    answeredIndices?: number[]
    bookmarkedIndices?: number[]
}

interface UseQuizNavigationReturn extends QuizNavigationState {
    goToNext: () => void
    goToPrevious: () => void
    goToQuestion: (index: number) => void
    goToFirstUnanswered: () => void
}

export function useQuizNavigation({
    totalQuestions,
    sessionId,
    currentIndex,
    setCurrentIndex,
    answeredIndices = [],
    bookmarkedIndices = [],
}: UseQuizNavigationProps): UseQuizNavigationReturn {
    // Calculate navigation state
    const canGoNext = useMemo(
        () => currentIndex < totalQuestions - 1,
        [currentIndex, totalQuestions]
    )

    const canGoPrevious = useMemo(() => currentIndex > 0, [currentIndex])

    // Go to next question
    const goToNext = useCallback(() => {
        if (canGoNext) {
            const newIndex = currentIndex + 1
            setCurrentIndex(newIndex)
            updateCurrentIndexInLocal(sessionId, newIndex)
        }
    }, [canGoNext, currentIndex, sessionId, setCurrentIndex])

    // Go to previous question
    const goToPrevious = useCallback(() => {
        if (canGoPrevious) {
            const newIndex = currentIndex - 1
            setCurrentIndex(newIndex)
            updateCurrentIndexInLocal(sessionId, newIndex)
        }
    }, [canGoPrevious, currentIndex, sessionId, setCurrentIndex])

    // Go to specific question
    const goToQuestion = useCallback(
        (index: number) => {
            if (index >= 0 && index < totalQuestions) {
                setCurrentIndex(index)
                updateCurrentIndexInLocal(sessionId, index)
            }
        },
        [totalQuestions, sessionId, setCurrentIndex]
    )

    // Go to first unanswered question
    const goToFirstUnanswered = useCallback(() => {
        for (let i = 0; i < totalQuestions; i++) {
            if (!answeredIndices.includes(i)) {
                goToQuestion(i)
                return
            }
        }
        // If all answered, go to first question
        goToQuestion(0)
    }, [totalQuestions, answeredIndices, goToQuestion])

    return {
        current_index: currentIndex,
        can_go_next: canGoNext,
        can_go_previous: canGoPrevious,
        answered_indices: answeredIndices,
        bookmarked_indices: bookmarkedIndices,
        goToNext,
        goToPrevious,
        goToQuestion,
        goToFirstUnanswered,
    }
}
