// ============================================================================
// Quiz Local Storage Utilities
// ============================================================================
// Functions for persisting quiz state to localStorage as backup
// ============================================================================

import type {
    QuizState,
    QuestionOption,
    BookmarkedQuestion,
} from '@/types'

const STORAGE_PREFIX = 'mdcat_quiz_'

interface LocalQuizState {
    sessionId: string
    currentIndex: number
    timeRemaining: number
    answers: Record<string, QuestionOption>
    bookmarks: string[]
    lastSaved: number
}

/**
 * Save quiz state to localStorage
 */
export function saveQuizStateToLocal(
    sessionId: string,
    currentIndex: number,
    timeRemaining: number,
    answers: Record<string, QuestionOption>,
    bookmarks: string[]
): void {
    try {
        const state: LocalQuizState = {
            sessionId,
            currentIndex,
            timeRemaining,
            answers,
            bookmarks,
            lastSaved: Date.now(),
        }

        localStorage.setItem(
            `${STORAGE_PREFIX}${sessionId}`,
            JSON.stringify(state)
        )
    } catch (error) {
        console.error('Failed to save quiz state to localStorage:', error)
    }
}

/**
 * Retrieve quiz state from localStorage
 */
export function getQuizStateFromLocal(
    sessionId: string
): LocalQuizState | null {
    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`)
        if (!stored) return null

        const state: LocalQuizState = JSON.parse(stored)

        // Check if state is not too old (24 hours)
        const MAX_AGE = 24 * 60 * 60 * 1000
        if (Date.now() - state.lastSaved > MAX_AGE) {
            clearQuizStateFromLocal(sessionId)
            return null
        }

        return state
    } catch (error) {
        console.error('Failed to retrieve quiz state from localStorage:', error)
        return null
    }
}

/**
 * Clear quiz state from localStorage
 */
export function clearQuizStateFromLocal(sessionId: string): void {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`)
    } catch (error) {
        console.error('Failed to clear quiz state from localStorage:', error)
    }
}

/**
 * Clear all quiz states from localStorage
 */
export function clearAllQuizStates(): void {
    try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key)
            }
        })
    } catch (error) {
        console.error('Failed to clear all quiz states:', error)
    }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
    try {
        const test = '__storage_test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
    } catch {
        return false
    }
}

/**
 * Save answer to localStorage (immediate backup)
 */
export function saveAnswerToLocal(
    sessionId: string,
    questionId: string,
    option: QuestionOption
): void {
    try {
        const state = getQuizStateFromLocal(sessionId)
        if (state) {
            state.answers[questionId] = option
            state.lastSaved = Date.now()
            localStorage.setItem(
                `${STORAGE_PREFIX}${sessionId}`,
                JSON.stringify(state)
            )
        }
    } catch (error) {
        console.error('Failed to save answer to localStorage:', error)
    }
}

/**
 * Save bookmark to localStorage
 */
export function saveBookmarkToLocal(
    sessionId: string,
    questionId: string,
    isBookmarked: boolean
): void {
    try {
        const state = getQuizStateFromLocal(sessionId)
        if (state) {
            if (isBookmarked) {
                if (!state.bookmarks.includes(questionId)) {
                    state.bookmarks.push(questionId)
                }
            } else {
                state.bookmarks = state.bookmarks.filter(
                    (id) => id !== questionId
                )
            }
            state.lastSaved = Date.now()
            localStorage.setItem(
                `${STORAGE_PREFIX}${sessionId}`,
                JSON.stringify(state)
            )
        }
    } catch (error) {
        console.error('Failed to save bookmark to localStorage:', error)
    }
}

/**
 * Update timer in localStorage
 */
export function updateTimerInLocal(
    sessionId: string,
    timeRemaining: number
): void {
    try {
        const state = getQuizStateFromLocal(sessionId)
        if (state) {
            state.timeRemaining = timeRemaining
            state.lastSaved = Date.now()
            localStorage.setItem(
                `${STORAGE_PREFIX}${sessionId}`,
                JSON.stringify(state)
            )
        }
    } catch (error) {
        console.error('Failed to update timer in localStorage:', error)
    }
}

/**
 * Update current index in localStorage
 */
export function updateCurrentIndexInLocal(
    sessionId: string,
    currentIndex: number
): void {
    try {
        const state = getQuizStateFromLocal(sessionId)
        if (state) {
            state.currentIndex = currentIndex
            state.lastSaved = Date.now()
            localStorage.setItem(
                `${STORAGE_PREFIX}${sessionId}`,
                JSON.stringify(state)
            )
        }
    } catch (error) {
        console.error('Failed to update current index in localStorage:', error)
    }
}
