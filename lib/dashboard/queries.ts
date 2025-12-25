// ============================================================================
// Dashboard Queries
// ============================================================================
// Centralized data fetching functions for user dashboard
// ============================================================================

import { createClient } from '@/lib/supabase/client'
import type {
    UserProfile,
    PerformanceMetrics,
    QuizAttempt,
    ScoreTrendData,
    CategoryPerformance,
    QuizRecommendation,
    ProgressData,
    ActivityDay,
    Achievement,
    TimeAnalytics,
    StudyPlan,
    LeaderboardPosition,
    QuickStartConfig,
    DashboardData
} from './types'
import { generateRecommendations, calculateTrend, calculatePercentile } from './utils'

/**
 * Get complete dashboard data for a user
 */
export async function getUserDashboardData(userId: string): Promise<DashboardData | null> {
    try {
        const [
            profile,
            performance,
            recentQuizzes,
            scoreTrend,
            categoryPerformance,
            progress,
            achievements,
            timeAnalytics,
            studyPlan,
            leaderboardPosition,
            quickStartConfig
        ] = await Promise.all([
            getUserProfile(userId),
            getUserPerformanceMetrics(userId),
            getRecentQuizAttempts(userId, 10),
            getScoreTrendData(userId, 30),
            getCategoryPerformance(userId),
            getUserProgressData(userId),
            getUserAchievements(userId),
            getTimeAnalytics(userId),
            getStudyPlan(userId),
            getLeaderboardPosition(userId),
            getQuickStartQuizConfig(userId)
        ])

        if (!profile) return null

        // Generate recommendations based on category performance
        const recommendations = generateRecommendations(categoryPerformance)

        return {
            profile,
            performance,
            recentQuizzes,
            scoreTrend,
            categoryPerformance,
            recommendations,
            progress,
            achievements,
            timeAnalytics,
            studyPlan,
            leaderboardPosition,
            quickStartConfig
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
    }
}

/**
 * Get user profile with streak data
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()

    try {
        // Fetch user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, full_name, email, created_at')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            console.error('Error fetching user profile:', userError)
            return null
        }

        // Fetch streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, last_activity_date')
            .eq('user_id', userId)
            .maybeSingle()

        return {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            memberSince: user.created_at,
            currentStreak: streak?.current_streak || 0,
            longestStreak: streak?.longest_streak || 0,
            lastActivityDate: streak?.last_activity_date || null
        }
    } catch (error) {
        console.error('Error in getUserProfile:', error)
        return null
    }
}

/**
 * Get user performance metrics
 */
export async function getUserPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    const supabase = createClient()

    try {
        // Get total quizzes
        const { count: totalQuizzes } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')

        // Get average score and accuracy
        const { data: quizzes } = await supabase
            .from('quiz_attempts')
            .select('score, correct_answers, total_questions')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(20)

        let averageScore = 0
        let accuracyPercentage = 0

        if (quizzes && quizzes.length > 0) {
            const totalScore = quizzes.reduce((sum, q) => sum + (q.score || 0), 0)
            averageScore = totalScore / quizzes.length

            const totalCorrect = quizzes.reduce((sum, q) => sum + (q.correct_answers || 0), 0)
            const totalQuestions = quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0)
            accuracyPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
        }

        // Get rank from user_analytics
        const { data: analytics } = await supabase
            .from('user_analytics')
            .select('total_correct_answers')
            .eq('user_id', userId)
            .maybeSingle()

        const userCorrectAnswers = analytics?.total_correct_answers || 0

        // Get total users count
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user')

        // Get users with more correct answers (to calculate rank)
        const { count: usersAbove } = await supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .gt('total_correct_answers', userCorrectAnswers)

        const currentRank = (usersAbove || 0) + 1

        // Calculate trend
        const scores = quizzes?.map(q => q.score || 0) || []
        const { direction: scoreTrend, change: scoreChange } = calculateTrend(scores)

        return {
            totalQuizzes: totalQuizzes || 0,
            averageScore: Math.round(averageScore * 10) / 10,
            accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
            currentRank,
            totalUsers: totalUsers || 0,
            scoreTrend,
            scoreChange: Math.round(scoreChange * 10) / 10
        }
    } catch (error) {
        console.error('Error in getUserPerformanceMetrics:', error)
        return {
            totalQuizzes: 0,
            averageScore: 0,
            accuracyPercentage: 0,
            currentRank: 0,
            totalUsers: 0,
            scoreTrend: 'stable',
            scoreChange: 0
        }
    }
}

/**
 * Get recent quiz attempts
 */
export async function getRecentQuizAttempts(userId: string, limit: number = 10): Promise<QuizAttempt[]> {
    const supabase = createClient()

    try {
        const { data: attempts, error } = await supabase
            .from('quiz_attempts')
            .select(`
                id,
                category_id,
                difficulty,
                total_questions,
                correct_answers,
                score,
                duration_seconds,
                completed_at,
                question_categories (
                    name
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching recent quiz attempts:', error)
            return []
        }

        return (attempts || []).map(attempt => ({
            id: attempt.id,
            categoryId: attempt.category_id,
            categoryName: (attempt.question_categories as any)?.name || 'General',
            difficulty: attempt.difficulty,
            totalQuestions: attempt.total_questions,
            correctAnswers: attempt.correct_answers,
            score: attempt.score,
            durationSeconds: attempt.duration_seconds,
            completedAt: attempt.completed_at,
            accuracy: attempt.total_questions > 0
                ? (attempt.correct_answers / attempt.total_questions) * 100
                : 0
        }))
    } catch (error) {
        console.error('Error in getRecentQuizAttempts:', error)
        return []
    }
}

/**
 * Get score trend data for charts
 */
export async function getScoreTrendData(userId: string, days: number = 30): Promise<ScoreTrendData[]> {
    const supabase = createClient()

    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: attempts, error } = await supabase
            .from('quiz_attempts')
            .select('score, correct_answers, total_questions, completed_at')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('completed_at', startDate.toISOString())
            .order('completed_at', { ascending: true })

        if (error || !attempts) {
            return []
        }

        return attempts.map(attempt => ({
            date: attempt.completed_at,
            score: attempt.score || 0,
            accuracy: attempt.total_questions > 0
                ? (attempt.correct_answers / attempt.total_questions) * 100
                : 0
        }))
    } catch (error) {
        console.error('Error in getScoreTrendData:', error)
        return []
    }
}

/**
 * Get category performance (strengths & weaknesses)
 */
export async function getCategoryPerformance(userId: string): Promise<CategoryPerformance[]> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase.rpc('get_user_performance_by_category', {
            p_user_id: userId
        })

        if (error) {
            console.error('Error fetching category performance:', error)
            return []
        }

        if (!data || data.length === 0) {
            return []
        }

        // Sort by accuracy to identify strengths and weaknesses
        const sorted = [...data].sort((a, b) => b.accuracy_percentage - a.accuracy_percentage)

        return sorted.map((cat, index) => ({
            categoryId: cat.category_id,
            categoryName: cat.category_name,
            totalQuestions: cat.total_questions,
            correctAnswers: cat.correct_answers,
            accuracyPercentage: cat.accuracy_percentage,
            averageScore: cat.accuracy_percentage, // Using accuracy as score for now
            quizCount: Math.ceil(cat.total_questions / 10), // Estimate quiz count
            isStrength: index < 3, // Top 3 are strengths
            isWeakness: index >= sorted.length - 3 // Bottom 3 are weaknesses
        }))
    } catch (error) {
        console.error('Error in getCategoryPerformance:', error)
        return []
    }
}

/**
 * Get user progress data (weekly activity, goals, streaks)
 */
export async function getUserProgressData(userId: string): Promise<ProgressData> {
    const supabase = createClient()

    try {
        // Get last 30 days of activity
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('completed_at, total_questions')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('completed_at', thirtyDaysAgo.toISOString())

        // Group by date
        const activityByDate: { [key: string]: ActivityDay } = {}

        attempts?.forEach(attempt => {
            const date = new Date(attempt.completed_at).toISOString().split('T')[0]
            if (!activityByDate[date]) {
                activityByDate[date] = {
                    date,
                    quizCount: 0,
                    totalQuestions: 0,
                    intensity: 0
                }
            }
            activityByDate[date].quizCount++
            activityByDate[date].totalQuestions += attempt.total_questions
        })

        // Calculate intensity (0-100 based on quiz count)
        const maxQuizCount = Math.max(...Object.values(activityByDate).map(d => d.quizCount), 1)
        Object.values(activityByDate).forEach(day => {
            day.intensity = Math.round((day.quizCount / maxQuizCount) * 100)
        })

        const weeklyActivity = Object.values(activityByDate).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        // Get streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', userId)
            .maybeSingle()

        // Calculate progress towards goals
        const last7Days = weeklyActivity.filter(day => {
            const dayDate = new Date(day.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return dayDate >= sevenDaysAgo
        })

        const dailyGoal = 1 // 1 quiz per day
        const weeklyGoal = 5 // 5 quizzes per week

        const todayQuizzes = last7Days[last7Days.length - 1]?.quizCount || 0
        const weekQuizzes = last7Days.reduce((sum, day) => sum + day.quizCount, 0)

        return {
            weeklyActivity,
            dailyGoal,
            weeklyGoal,
            dailyProgress: Math.min(100, (todayQuizzes / dailyGoal) * 100),
            weeklyProgress: Math.min(100, (weekQuizzes / weeklyGoal) * 100),
            currentStreak: streak?.current_streak || 0,
            longestStreak: streak?.longest_streak || 0
        }
    } catch (error) {
        console.error('Error in getUserProgressData:', error)
        return {
            weeklyActivity: [],
            dailyGoal: 1,
            weeklyGoal: 5,
            dailyProgress: 0,
            weeklyProgress: 0,
            currentStreak: 0,
            longestStreak: 0
        }
    }
}

/**
 * Get user achievements (unlocked and locked)
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
    const supabase = createClient()

    try {
        // Get unlocked achievements
        const { data: unlocked } = await supabase
            .from('user_achievements')
            .select(`
                id,
                achievement_type,
                achievement_name,
                achievement_description,
                category_id,
                unlocked_at,
                question_categories (
                    name
                )
            `)
            .eq('user_id', userId)

        // Define all possible achievements
        const allAchievements = [
            { type: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', requirement: '1 quiz' },
            { type: 'quiz_master_10', name: 'Quiz Novice', desc: 'Complete 10 quizzes', requirement: '10 quizzes' },
            { type: 'quiz_master_50', name: 'Quiz Expert', desc: 'Complete 50 quizzes', requirement: '50 quizzes' },
            { type: 'quiz_master_100', name: 'Quiz Master', desc: 'Complete 100 quizzes', requirement: '100 quizzes' },
            { type: 'perfect_score', name: 'Perfect!', desc: 'Achieve 100% score', requirement: 'Perfect score' },
            { type: 'streak_7', name: 'Week Warrior', desc: '7-day streak', requirement: '7-day streak' },
            { type: 'streak_30', name: 'Month Master', desc: '30-day streak', requirement: '30-day streak' }
        ]

        const unlockedTypes = new Set(unlocked?.map(a => a.achievement_type) || [])

        return allAchievements.map(achievement => {
            const unlockedAchievement = unlocked?.find(a => a.achievement_type === achievement.type)

            return {
                id: unlockedAchievement?.id || achievement.type,
                achievementType: achievement.type,
                achievementName: achievement.name,
                achievementDescription: achievement.desc,
                categoryId: unlockedAchievement?.category_id || null,
                categoryName: (unlockedAchievement?.question_categories as any)?.name || null,
                unlockedAt: unlockedAchievement?.unlocked_at || null,
                isUnlocked: unlockedTypes.has(achievement.type),
                requirement: achievement.requirement
            }
        })
    } catch (error) {
        console.error('Error in getUserAchievements:', error)
        return []
    }
}

/**
 * Get time analytics
 */
export async function getTimeAnalytics(userId: string): Promise<TimeAnalytics> {
    const supabase = createClient()

    try {
        const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select(`
                duration_seconds,
                category_id,
                completed_at,
                question_categories (
                    name
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'completed')

        if (!attempts || attempts.length === 0) {
            return {
                totalTimeSeconds: 0,
                averageSessionSeconds: 0,
                totalSessions: 0,
                timeByCategory: [],
                timeByDayOfWeek: []
            }
        }

        const totalTimeSeconds = attempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0)
        const averageSessionSeconds = totalTimeSeconds / attempts.length

        // Time by category
        const timeByCategory: { [key: string]: { name: string; time: number } } = {}
        attempts.forEach(attempt => {
            const catId = attempt.category_id || 'general'
            const catName = (attempt.question_categories as any)?.name || 'General'
            if (!timeByCategory[catId]) {
                timeByCategory[catId] = { name: catName, time: 0 }
            }
            timeByCategory[catId].time += attempt.duration_seconds || 0
        })

        const timeByDayOfWeek = Array(7).fill(0).map((_, i) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
            timeSeconds: 0
        }))

        attempts.forEach(attempt => {
            const day = new Date(attempt.completed_at).getDay()
            timeByDayOfWeek[day].timeSeconds += attempt.duration_seconds || 0
        })

        return {
            totalTimeSeconds,
            averageSessionSeconds: Math.round(averageSessionSeconds),
            totalSessions: attempts.length,
            timeByCategory: Object.entries(timeByCategory).map(([id, data]) => ({
                categoryId: id,
                categoryName: data.name,
                timeSeconds: data.time,
                percentage: (data.time / totalTimeSeconds) * 100
            })),
            timeByDayOfWeek
        }
    } catch (error) {
        console.error('Error in getTimeAnalytics:', error)
        return {
            totalTimeSeconds: 0,
            averageSessionSeconds: 0,
            totalSessions: 0,
            timeByCategory: [],
            timeByDayOfWeek: []
        }
    }
}

/**
 * Get or generate study plan
 */
export async function getStudyPlan(userId: string): Promise<StudyPlan | null> {
    const supabase = createClient()

    try {
        // Check for existing active study plan
        const { data: existingPlan } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (existingPlan) {
            return existingPlan as StudyPlan
        }

        // Generate new study plan based on performance
        const categoryPerformance = await getCategoryPerformance(userId)
        const recommendations = generateRecommendations(categoryPerformance)

        // Create focus areas from weak categories
        const focusAreas = categoryPerformance
            .filter(cat => cat.isWeakness)
            .map(cat => ({
                categoryId: cat.categoryId,
                categoryName: cat.categoryName,
                priority: cat.accuracyPercentage < 40 ? 'high' as const : 'medium' as const,
                reason: `Current accuracy: ${Math.round(cat.accuracyPercentage)}%`,
                currentAccuracy: cat.accuracyPercentage,
                targetAccuracy: 80
            }))

        const dailyGoals = [
            { id: '1', description: 'Complete 1 quiz', completed: false, targetDate: null },
            { id: '2', description: 'Review weak areas', completed: false, targetDate: null }
        ]

        const weeklyGoals = [
            { id: '1', description: 'Complete 5 quizzes', completed: false, targetDate: null },
            { id: '2', description: 'Improve accuracy by 5%', completed: false, targetDate: null }
        ]

        const newPlan = {
            user_id: userId,
            focus_areas: focusAreas,
            daily_goals: dailyGoals,
            weekly_goals: weeklyGoals,
            recommended_quizzes: recommendations
        }

        const { data: createdPlan } = await supabase
            .from('study_plans')
            .insert(newPlan)
            .select()
            .single()

        return createdPlan as StudyPlan
    } catch (error) {
        console.error('Error in getStudyPlan:', error)
        return null
    }
}

/**
 * Get leaderboard position
 */
export async function getLeaderboardPosition(userId: string): Promise<LeaderboardPosition> {
    const supabase = createClient()

    try {
        const { data: leaderboard } = await supabase
            .from('leaderboard')
            .select('*')
            .order('rank', { ascending: true })
            .limit(100)

        if (!leaderboard) {
            return {
                currentRank: 0,
                totalUsers: 0,
                percentile: 0,
                rankChange: 0,
                usersAbove: [],
                usersBelow: [],
                userScore: 0
            }
        }

        const userIndex = leaderboard.findIndex(u => u.id === userId)
        const currentUser = leaderboard[userIndex]

        if (!currentUser) {
            return {
                currentRank: 0,
                totalUsers: leaderboard.length,
                percentile: 0,
                rankChange: 0,
                usersAbove: [],
                usersBelow: [],
                userScore: 0
            }
        }

        const usersAbove = leaderboard
            .slice(Math.max(0, userIndex - 3), userIndex)
            .map(u => ({
                id: u.id,
                fullName: u.full_name,
                rank: u.rank,
                totalCorrectAnswers: u.total_correct_answers,
                accuracyPercentage: u.accuracy_percentage
            }))

        const usersBelow = leaderboard
            .slice(userIndex + 1, userIndex + 4)
            .map(u => ({
                id: u.id,
                fullName: u.full_name,
                rank: u.rank,
                totalCorrectAnswers: u.total_correct_answers,
                accuracyPercentage: u.accuracy_percentage
            }))

        return {
            currentRank: currentUser.rank,
            totalUsers: leaderboard.length,
            percentile: calculatePercentile(currentUser.rank, leaderboard.length),
            rankChange: 0, // Would need historical data
            usersAbove,
            usersBelow,
            userScore: currentUser.total_correct_answers
        }
    } catch (error) {
        console.error('Error in getLeaderboardPosition:', error)
        return {
            currentRank: 0,
            totalUsers: 0,
            percentile: 0,
            rankChange: 0,
            usersAbove: [],
            usersBelow: [],
            userScore: 0
        }
    }
}

/**
 * Get quick start quiz configuration
 */
export async function getQuickStartQuizConfig(userId: string): Promise<QuickStartConfig> {
    const categoryPerformance = await getCategoryPerformance(userId)
    const recommendations = generateRecommendations(categoryPerformance)

    if (recommendations.length > 0) {
        const topRecommendation = recommendations[0]
        return {
            categoryId: topRecommendation.categoryId,
            categoryName: topRecommendation.categoryName,
            difficulty: topRecommendation.difficulty,
            estimatedQuestions: 10,
            reason: topRecommendation.reason
        }
    }

    // Default to a random category if no recommendations
    return {
        categoryId: '',
        categoryName: 'General',
        difficulty: 'medium',
        estimatedQuestions: 10,
        reason: 'Start your learning journey!'
    }
}
