// ============================================================================
// Guest Mode - Trial Access Without Signup
// ============================================================================
// Allows users to try 10 questions before requiring signup
// ============================================================================

const TRIAL_LIMIT = 10
const STORAGE_KEY = 'mdcat_trial_count'

export interface GuestSession {
    questionsAttempted: number
    trialRemaining: number
    isTrialExpired: boolean
}

/**
 * Get current guest session status
 */
export function getGuestSession(): GuestSession {
    if (typeof window === 'undefined') {
        return {
            questionsAttempted: 0,
            trialRemaining: TRIAL_LIMIT,
            isTrialExpired: false,
        }
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    const questionsAttempted = stored ? parseInt(stored, 10) : 0

    return {
        questionsAttempted,
        trialRemaining: Math.max(0, TRIAL_LIMIT - questionsAttempted),
        isTrialExpired: questionsAttempted >= TRIAL_LIMIT,
    }
}

/**
 * Increment guest question count
 */
export function incrementGuestCount(): GuestSession {
    if (typeof window === 'undefined') {
        return getGuestSession()
    }

    const current = getGuestSession()
    const newCount = current.questionsAttempted + 1
    localStorage.setItem(STORAGE_KEY, newCount.toString())

    return {
        questionsAttempted: newCount,
        trialRemaining: Math.max(0, TRIAL_LIMIT - newCount),
        isTrialExpired: newCount >= TRIAL_LIMIT,
    }
}

/**
 * Reset guest session (called after signup)
 */
export function resetGuestSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
    }
}

/**
 * Check if user can attempt another question
 */
export function canAttemptQuestion(): boolean {
    const session = getGuestSession()
    return !session.isTrialExpired
}
