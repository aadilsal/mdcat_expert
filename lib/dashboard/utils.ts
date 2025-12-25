// ============================================================================
// Dashboard Utilities
// ============================================================================
// Helper functions for dashboard calculations and formatting
// ============================================================================

import type { TrendDirection, RiskLevel, CategoryPerformance, QuizRecommendation } from './types'

/**
 * Calculate streak from activity dates
 */
export function calculateStreak(activityDates: Date[]): {
    currentStreak: number
    longestStreak: number
} {
    if (!activityDates || activityDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 }
    }

    // Sort dates in descending order
    const sortedDates = activityDates
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate current streak
    let prevDate = today
    for (const date of sortedDates) {
        const activityDate = new Date(date)
        activityDate.setHours(0, 0, 0, 0)

        const dayDiff = Math.floor((prevDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff === 0 || dayDiff === 1) {
            currentStreak++
            prevDate = activityDate
        } else {
            break
        }
    }

    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i])
        const prev = new Date(sortedDates[i - 1])
        curr.setHours(0, 0, 0, 0)
        prev.setHours(0, 0, 0, 0)

        const dayDiff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff === 1) {
            tempStreak++
        } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
        }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
}

/**
 * Determine risk level based on performance
 */
export function determineRiskLevel(score: number, accuracy: number): RiskLevel {
    const avgPerformance = (score + accuracy) / 2

    if (avgPerformance >= 70) return 'low'
    if (avgPerformance >= 40) return 'medium'
    return 'high'
}

/**
 * Generate quiz recommendations based on category performance
 */
export function generateRecommendations(
    categoryPerformance: CategoryPerformance[]
): QuizRecommendation[] {
    const recommendations: QuizRecommendation[] = []

    // Sort by accuracy (ascending) to prioritize weak areas
    const sortedCategories = [...categoryPerformance].sort(
        (a, b) => a.accuracyPercentage - b.accuracyPercentage
    )

    // Recommend top 3 weakest categories
    for (let i = 0; i < Math.min(3, sortedCategories.length); i++) {
        const category = sortedCategories[i]

        // Determine difficulty based on current performance
        let difficulty: 'easy' | 'medium' | 'hard'
        if (category.accuracyPercentage < 40) {
            difficulty = 'easy'
        } else if (category.accuracyPercentage < 70) {
            difficulty = 'medium'
        } else {
            difficulty = 'hard'
        }

        // Determine priority
        let priority: 'high' | 'medium' | 'low'
        if (category.accuracyPercentage < 50) {
            priority = 'high'
        } else if (category.accuracyPercentage < 70) {
            priority = 'medium'
        } else {
            priority = 'low'
        }

        recommendations.push({
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            difficulty,
            reason: `Improve ${category.categoryName} - Current accuracy: ${Math.round(category.accuracyPercentage)}%`,
            priority,
            estimatedQuestions: 10
        })
    }

    return recommendations
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`
    }

    return `${hours}h`
}

/**
 * Calculate trend direction from score array
 */
export function calculateTrend(scores: number[]): {
    direction: TrendDirection
    change: number
} {
    if (scores.length < 2) {
        return { direction: 'stable', change: 0 }
    }

    // Calculate average of first half vs second half
    const midpoint = Math.floor(scores.length / 2)
    const firstHalf = scores.slice(0, midpoint)
    const secondHalf = scores.slice(midpoint)

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length

    const change = secondAvg - firstAvg
    const percentChange = (change / firstAvg) * 100

    let direction: TrendDirection
    if (percentChange > 5) {
        direction = 'improving'
    } else if (percentChange < -5) {
        direction = 'declining'
    } else {
        direction = 'stable'
    }

    return { direction, change: percentChange }
}

/**
 * Get achievement progress for locked achievements
 */
export function getAchievementProgress(
    achievementType: string,
    userStats: {
        totalQuizzes: number
        currentStreak: number
        perfectScores: number
    }
): number {
    switch (achievementType) {
        case 'first_quiz':
            return Math.min(100, (userStats.totalQuizzes / 1) * 100)
        case 'quiz_master_10':
            return Math.min(100, (userStats.totalQuizzes / 10) * 100)
        case 'quiz_master_50':
            return Math.min(100, (userStats.totalQuizzes / 50) * 100)
        case 'quiz_master_100':
            return Math.min(100, (userStats.totalQuizzes / 100) * 100)
        case 'streak_7':
            return Math.min(100, (userStats.currentStreak / 7) * 100)
        case 'streak_30':
            return Math.min(100, (userStats.currentStreak / 30) * 100)
        case 'perfect_score':
            return userStats.perfectScores > 0 ? 100 : 0
        default:
            return 0
    }
}

/**
 * Get initials from full name for avatar
 */
export function getInitials(fullName: string): string {
    const parts = fullName.trim().split(' ')
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 30) {
        return then.toLocaleDateString()
    } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
        return 'Just now'
    }
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(rank: number, totalUsers: number): number {
    if (totalUsers === 0) return 0
    return Math.round(((totalUsers - rank + 1) / totalUsers) * 100)
}

/**
 * Get motivational message based on performance
 */
export function getMotivationalMessage(
    accuracyPercentage: number,
    currentStreak: number
): string {
    if (currentStreak >= 30) {
        return "🔥 You're on fire! Keep that streak alive!"
    } else if (currentStreak >= 7) {
        return "💪 Great consistency! You're building a strong habit!"
    } else if (accuracyPercentage >= 90) {
        return "🌟 Outstanding performance! You're mastering this!"
    } else if (accuracyPercentage >= 70) {
        return "👍 Good work! Keep pushing forward!"
    } else if (accuracyPercentage >= 50) {
        return "📈 You're improving! Stay focused!"
    } else {
        return "💡 Every expert was once a beginner. Keep practicing!"
    }
}
