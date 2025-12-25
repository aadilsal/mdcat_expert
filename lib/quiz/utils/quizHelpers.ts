// ============================================================================
// Quiz Helper Utilities
// ============================================================================
// Utility functions for quiz operations, calculations, and formatting
// ============================================================================

import type {
    QuizProgress,
    QuizTimerState,
    Question,
    UserAnswer,
    QuestionOption,
} from '@/types'

/**
 * Calculate quiz progress percentage
 */
export function calculateProgress(
    answeredCount: number,
    totalQuestions: number
): number {
    if (totalQuestions === 0) return 0
    return Math.round((answeredCount / totalQuestions) * 100)
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
    if (seconds < 0) return '00:00'

    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time in seconds to human-readable format (e.g., "1h 30m", "45m", "5m 30s")
 */
export function formatTimeHuman(seconds: number): string {
    if (seconds < 0) return '0s'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }

    if (minutes > 0) {
        return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
    }

    return `${secs}s`
}

/**
 * Get urgency level based on time remaining
 */
export function getUrgencyLevel(
    timeRemaining: number,
    totalTime: number
): 'normal' | 'warning' | 'critical' {
    const percentage = (timeRemaining / totalTime) * 100

    if (percentage <= 10) return 'critical' // Last 10%
    if (percentage <= 25) return 'warning' // Last 25%
    return 'normal'
}

/**
 * Get list of unanswered question indices
 */
export function getUnansweredQuestions(
    totalQuestions: number,
    answeredIndices: number[]
): number[] {
    const allIndices = Array.from({ length: totalQuestions }, (_, i) => i)
    return allIndices.filter((index) => !answeredIndices.includes(index))
}

/**
 * Validate quiz session state
 */
export function validateQuizSession(
    sessionId: string | null,
    questions: Question[],
    currentIndex: number
): { isValid: boolean; error?: string } {
    if (!sessionId) {
        return { isValid: false, error: 'No session ID provided' }
    }

    if (questions.length === 0) {
        return { isValid: false, error: 'No questions available' }
    }

    if (currentIndex < 0 || currentIndex >= questions.length) {
        return { isValid: false, error: 'Invalid question index' }
    }

    return { isValid: true }
}

/**
 * Check if quiz can be submitted
 */
export function canSubmitQuiz(
    answeredCount: number,
    totalQuestions: number,
    requireAllAnswered: boolean = false
): boolean {
    if (requireAllAnswered) {
        return answeredCount === totalQuestions
    }
    return answeredCount > 0
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(
    correctCount: number,
    totalCount: number
): number {
    if (totalCount === 0) return 0
    return Math.round((correctCount / totalCount) * 100)
}

/**
 * Get question status for display
 */
export function getQuestionStatus(
    index: number,
    currentIndex: number,
    answeredIndices: number[],
    bookmarkedIndices: number[]
): {
    isCurrent: boolean
    isAnswered: boolean
    isBookmarked: boolean
    statusText: string
} {
    const isCurrent = index === currentIndex
    const isAnswered = answeredIndices.includes(index)
    const isBookmarked = bookmarkedIndices.includes(index)

    let statusText = 'Not Answered'
    if (isAnswered) statusText = 'Answered'
    if (isBookmarked) statusText += ' (Flagged)'
    if (isCurrent) statusText = 'Current'

    return {
        isCurrent,
        isAnswered,
        isBookmarked,
        statusText,
    }
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

/**
 * Create answer map from user answers array
 */
export function createAnswerMap(
    answers: UserAnswer[]
): Record<string, QuestionOption> {
    return answers.reduce(
        (acc, answer) => {
            acc[answer.question_id] = answer.selected_option
            return acc
        },
        {} as Record<string, QuestionOption>
    )
}

/**
 * Get answered question indices from answer map
 */
export function getAnsweredIndices(
    questions: Question[],
    answerMap: Record<string, QuestionOption>
): number[] {
    return questions
        .map((q, index) => (answerMap[q.id] ? index : -1))
        .filter((index) => index !== -1)
}

/**
 * Check if quiz time has expired
 */
export function isTimeExpired(timeRemaining: number): boolean {
    return timeRemaining <= 0
}

/**
 * Calculate time taken in seconds
 */
export function calculateTimeTaken(
    timeLimitMinutes: number,
    timeRemainingSeconds: number
): number {
    const totalSeconds = timeLimitMinutes * 60
    return totalSeconds - timeRemainingSeconds
}

/**
 * Get quiz completion message
 */
export function getCompletionMessage(
    score: number,
    totalQuestions: number
): string {
    const percentage = calculateAccuracy(score, totalQuestions)

    if (percentage >= 90) return 'Excellent work! 🎉'
    if (percentage >= 75) return 'Great job! 👏'
    if (percentage >= 60) return 'Good effort! 👍'
    if (percentage >= 50) return 'Keep practicing! 💪'
    return 'Don\'t give up! 📚'
}

/**
 * Validate answer option
 */
export function isValidOption(option: string): option is QuestionOption {
    return ['A', 'B', 'C', 'D'].includes(option)
}

/**
 * Get option label (A, B, C, D)
 */
export function getOptionLabel(index: number): QuestionOption {
    const labels: QuestionOption[] = ['A', 'B', 'C', 'D']
    return labels[index] || 'A'
}

/**
 * Check if should show time warning
 */
export function shouldShowTimeWarning(
    timeRemaining: number,
    lastWarningTime: number | null,
    warningThresholds: number[] = [600, 300, 60] // 10min, 5min, 1min
): number | null {
    for (const threshold of warningThresholds) {
        if (
            timeRemaining <= threshold &&
            (lastWarningTime === null || lastWarningTime > threshold)
        ) {
            return threshold
        }
    }
    return null
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(later, wait)
    }
}
