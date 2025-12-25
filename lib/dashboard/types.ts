// ============================================================================
// Dashboard Types
// ============================================================================
// TypeScript interfaces for dashboard data structures
// ============================================================================

export interface DashboardData {
    profile: UserProfile
    performance: PerformanceMetrics
    recentQuizzes: QuizAttempt[]
    scoreTrend: ScoreTrendData[]
    categoryPerformance: CategoryPerformance[]
    recommendations: QuizRecommendation[]
    progress: ProgressData
    achievements: Achievement[]
    timeAnalytics: TimeAnalytics
    studyPlan: StudyPlan | null
    leaderboardPosition: LeaderboardPosition
    quickStartConfig: QuickStartConfig
}

export interface UserProfile {
    id: string
    fullName: string
    email: string
    memberSince: string
    currentStreak: number
    longestStreak: number
    lastActivityDate: string | null
}

export interface PerformanceMetrics {
    totalQuizzes: number
    averageScore: number
    accuracyPercentage: number
    currentRank: number
    totalUsers: number
    scoreTrend: 'improving' | 'stable' | 'declining'
    scoreChange: number // percentage change
}

export interface QuizAttempt {
    id: string
    categoryId: string | null
    categoryName: string | null
    difficulty: 'easy' | 'medium' | 'hard' | null
    totalQuestions: number
    correctAnswers: number
    score: number
    durationSeconds: number
    completedAt: string
    accuracy: number
}

export interface ScoreTrendData {
    date: string
    score: number
    accuracy: number
}

export interface CategoryPerformance {
    categoryId: string
    categoryName: string
    totalQuestions: number
    correctAnswers: number
    accuracyPercentage: number
    averageScore: number
    quizCount: number
    isStrength: boolean
    isWeakness: boolean
}

export interface QuizRecommendation {
    categoryId: string
    categoryName: string
    difficulty: 'easy' | 'medium' | 'hard'
    reason: string
    priority: 'high' | 'medium' | 'low'
    estimatedQuestions: number
}

export interface ProgressData {
    weeklyActivity: ActivityDay[]
    dailyGoal: number
    weeklyGoal: number
    dailyProgress: number
    weeklyProgress: number
    currentStreak: number
    longestStreak: number
}

export interface ActivityDay {
    date: string
    quizCount: number
    totalQuestions: number
    intensity: number // 0-100
}

export interface Achievement {
    id: string
    achievementType: string
    achievementName: string
    achievementDescription: string
    categoryId: string | null
    categoryName: string | null
    unlockedAt: string | null
    isUnlocked: boolean
    progress?: number // 0-100 for locked achievements
    requirement?: string
}

export interface TimeAnalytics {
    totalTimeSeconds: number
    averageSessionSeconds: number
    totalSessions: number
    timeByCategory: {
        categoryId: string
        categoryName: string
        timeSeconds: number
        percentage: number
    }[]
    timeByDayOfWeek: {
        day: string
        timeSeconds: number
    }[]
}

export interface StudyPlan {
    id: string
    userId: string
    focusAreas: FocusArea[]
    dailyGoals: Goal[]
    weeklyGoals: Goal[]
    recommendedQuizzes: QuizRecommendation[]
    generatedAt: string
    expiresAt: string
}

export interface FocusArea {
    categoryId: string
    categoryName: string
    priority: 'high' | 'medium' | 'low'
    reason: string
    currentAccuracy: number
    targetAccuracy: number
}

export interface Goal {
    id: string
    description: string
    completed: boolean
    targetDate: string | null
    progress?: number
}

export interface LeaderboardPosition {
    currentRank: number
    totalUsers: number
    percentile: number
    rankChange: number // positive = moved up, negative = moved down
    usersAbove: LeaderboardUser[]
    usersBelow: LeaderboardUser[]
    userScore: number
}

export interface LeaderboardUser {
    id: string
    fullName: string
    rank: number
    totalCorrectAnswers: number
    accuracyPercentage: number
}

export interface QuickStartConfig {
    categoryId: string
    categoryName: string
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedQuestions: number
    reason: string
}

// Helper types
export type TrendDirection = 'improving' | 'stable' | 'declining'
export type RiskLevel = 'low' | 'medium' | 'high'
export type Priority = 'high' | 'medium' | 'low'
