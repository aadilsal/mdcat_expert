'use client'

// ============================================================================
// useQuizSession Hook
// ============================================================================
// Main hook for managing complete quiz session state
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import type {
    Question,
    QuestionOption,
    QuizProgress,
} from '@/types'
import {
    createAnswerMap,
    getAnsweredIndices,
    calculateProgress,
} from '../utils/quizHelpers'
import {
    saveAnswerToLocal,
    saveBookmarkToLocal,
    saveQuizStateToLocal,
} from '../utils/storage'

interface UseQuizSessionProps {
    sessionId: string
    questions: Question[]
    initialAnswers?: Record<string, QuestionOption>
    initialBookmarks?: string[]
    initialIndex?: number
}

interface UseQuizSessionReturn {
    // State
    questions: Question[]
    currentIndex: number
    setCurrentIndex: (index: number) => void
    answers: Record<string, QuestionOption>
    bookmarks: Set<string>
    progress: QuizProgress

    // Answer management
    selectAnswer: (questionId: string, option: QuestionOption) => void
    getAnswer: (questionId: string) => QuestionOption | undefined
    hasAnswer: (questionId: string) => boolean

    // Bookmark management
    toggleBookmark: (questionId: string) => void
    isBookmarked: (questionId: string) => boolean

    // Navigation helpers
    getCurrentQuestion: () => Question | null
    getAnsweredIndicesList: () => number[]
    getBookmarkedIndices: () => number[]
    getUnansweredCount: () => number
}

export function useQuizSession({
    sessionId,
    questions,
    initialAnswers = {},
    initialBookmarks = [],
    initialIndex = 0,
}: UseQuizSessionProps): UseQuizSessionReturn {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [answers, setAnswers] = useState<Record<string, QuestionOption>>(
        initialAnswers
    )
    const [bookmarks, setBookmarks] = useState<Set<string>>(
        new Set(initialBookmarks)
    )

    // Calculate answered indices
    const answeredIndices = useMemo(
        () => getAnsweredIndices(questions, answers),
        [questions, answers]
    )

    // Calculate bookmarked indices
    const bookmarkedIndices = useMemo(
        () =>
            questions
                .map((q, index) => (bookmarks.has(q.id) ? index : -1))
                .filter((index) => index !== -1),
        [questions, bookmarks]
    )

    // Calculate progress
    const progress: QuizProgress = useMemo(
        () => ({
            total_questions: questions.length,
            answered_questions: answeredIndices.length,
            bookmarked_questions: bookmarks.size,
            current_index: currentIndex,
            time_remaining: 0, // This will be managed by useQuizTimer
            is_paused: false, // This will be managed externally
        }),
        [questions.length, answeredIndices.length, bookmarks.size, currentIndex]
    )

    // Save complete state to localStorage whenever it changes
    useEffect(() => {
        saveQuizStateToLocal(
            sessionId,
            currentIndex,
            0, // Timer is managed separately
            answers,
            Array.from(bookmarks)
        )
    }, [sessionId, currentIndex, answers, bookmarks])

    // Select answer
    const selectAnswer = useCallback(
        (questionId: string, option: QuestionOption) => {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: option,
            }))
            saveAnswerToLocal(sessionId, questionId, option)
        },
        [sessionId]
    )

    // Get answer for a question
    const getAnswer = useCallback(
        (questionId: string) => answers[questionId],
        [answers]
    )

    // Check if question has an answer
    const hasAnswer = useCallback(
        (questionId: string) => questionId in answers,
        [answers]
    )

    // Toggle bookmark
    const toggleBookmark = useCallback(
        (questionId: string) => {
            setBookmarks((prev) => {
                const newBookmarks = new Set(prev)
                if (newBookmarks.has(questionId)) {
                    newBookmarks.delete(questionId)
                    saveBookmarkToLocal(sessionId, questionId, false)
                } else {
                    newBookmarks.add(questionId)
                    saveBookmarkToLocal(sessionId, questionId, true)
                }
                return newBookmarks
            })
        },
        [sessionId]
    )

    // Check if question is bookmarked
    const isBookmarked = useCallback(
        (questionId: string) => bookmarks.has(questionId),
        [bookmarks]
    )

    // Get current question
    const getCurrentQuestion = useCallback(
        () => questions[currentIndex] || null,
        [questions, currentIndex]
    )

    // Get answered indices list
    const getAnsweredIndicesList = useCallback(
        () => answeredIndices,
        [answeredIndices]
    )

    // Get bookmarked indices
    const getBookmarkedIndices = useCallback(
        () => bookmarkedIndices,
        [bookmarkedIndices]
    )

    // Get unanswered count
    const getUnansweredCount = useCallback(
        () => questions.length - answeredIndices.length,
        [questions.length, answeredIndices.length]
    )

    return {
        questions,
        currentIndex,
        setCurrentIndex,
        answers,
        bookmarks,
        progress,
        selectAnswer,
        getAnswer,
        hasAnswer,
        toggleBookmark,
        isBookmarked,
        getCurrentQuestion,
        getAnsweredIndicesList,
        getBookmarkedIndices,
        getUnansweredCount,
    }
}
