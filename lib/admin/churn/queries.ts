// ============================================================================
// Churn Prediction Queries & Analytics
// ============================================================================

import { createClient } from '@/lib/supabase/client'

export interface EngagementMetrics {
    userId: string
    daysSinceLastLogin: number
    daysSinceLastQuiz: number
    loginCount7d: number
    loginCount30d: number
    quizCount7d: number
    quizCount30d: number
    avgScore7d: number
    avgScore30d: number
    avgAccuracy7d: number
    recencyScore: number
    frequencyScore: number
    performanceScore: number
    engagementScore: number
    riskLevel: 'low' | 'medium' | 'high'
    churnProbability: number
    lastCalculatedAt: string
}

export interface ChurnOverview {
    totalActiveUsers: number
    atRiskCount: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
    churnRate: number
    retentionRate: number
    avgEngagementScore: number
    trends: {
        activeUsers: number
        churnRate: number
        engagementScore: number
    }
}

export interface AtRiskUser {
    id: string
    name: string
    email: string
    riskLevel: 'low' | 'medium' | 'high'
    churnProbability: number
    engagementScore: number
    lastActive: string
    daysSinceLastLogin: number
    recommendedActions: string[]
}

// ============================================================================
// Fetch churn overview metrics
// ============================================================================

export async function fetchChurnOverview(): Promise<ChurnOverview> {
    const supabase = createClient()

    // Get total active users (logged in within 90 days)
    const { count: totalActive } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Get risk level counts
    const { data: riskCounts } = await supabase
        .from('user_engagement_metrics')
        .select('risk_level')

    const highRisk = riskCounts?.filter(r => r.risk_level === 'high').length || 0
    const mediumRisk = riskCounts?.filter(r => r.risk_level === 'medium').length || 0
    const lowRisk = riskCounts?.filter(r => r.risk_level === 'low').length || 0
    const atRisk = highRisk + mediumRisk

    // Calculate average engagement score
    const { data: avgData } = await supabase
        .from('user_engagement_metrics')
        .select('engagement_score')

    const avgScore = avgData && avgData.length > 0
        ? avgData.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / avgData.length
        : 0

    // Calculate churn and retention rates
    const churnRate = totalActive ? (atRisk / totalActive) * 100 : 0
    const retentionRate = 100 - churnRate

    // Get trends (compare with 7 days ago)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: historicalData } = await supabase
        .from('churn_predictions')
        .select('churn_probability, engagement_score')
        .gte('prediction_date', sevenDaysAgo)

    const trends = {
        activeUsers: 0, // Simplified - would need historical tracking
        churnRate: 0,
        engagementScore: 0
    }

    return {
        totalActiveUsers: totalActive || 0,
        atRiskCount: atRisk,
        highRiskCount: highRisk,
        mediumRiskCount: mediumRisk,
        lowRiskCount: lowRisk,
        churnRate: Math.round(churnRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        avgEngagementScore: Math.round(avgScore * 10) / 10,
        trends
    }
}

// ============================================================================
// Fetch at-risk users
// ============================================================================

export async function fetchAtRiskUsers(
    riskLevel?: 'low' | 'medium' | 'high',
    page = 1,
    limit = 20
): Promise<{ users: AtRiskUser[]; total: number }> {
    const supabase = createClient()
    const offset = (page - 1) * limit

    let query = supabase
        .from('user_engagement_metrics')
        .select(`
            *,
            users!inner(id, name, email)
        `, { count: 'exact' })

    if (riskLevel) {
        query = query.eq('risk_level', riskLevel)
    } else {
        // Default: show medium and high risk only
        query = query.in('risk_level', ['medium', 'high'])
    }

    query = query
        .order('churn_probability', { ascending: false })
        .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    const users: AtRiskUser[] = (data || []).map(metric => ({
        id: metric.users.id,
        name: metric.users.name,
        email: metric.users.email,
        riskLevel: metric.risk_level,
        churnProbability: metric.churn_probability,
        engagementScore: metric.engagement_score,
        lastActive: calculateLastActive(metric.days_since_last_login),
        daysSinceLastLogin: metric.days_since_last_login,
        recommendedActions: generateRecommendations(metric)
    }))

    return { users, total: count || 0 }
}

// ============================================================================
// Generate intervention recommendations
// ============================================================================

function generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    if (metrics.days_since_last_login > 14) {
        recommendations.push('Send re-engagement email')
    }

    if (metrics.days_since_last_quiz > 21) {
        recommendations.push('Suggest personalized quiz based on past performance')
    }

    if (metrics.avg_score_7d < 50) {
        recommendations.push('Offer study resources for weak categories')
    }

    if (metrics.quiz_count_7d === 0) {
        recommendations.push('Send quiz reminder with incentive')
    }

    if (metrics.risk_level === 'high') {
        recommendations.push('Priority outreach - personal message from admin')
    }

    if (recommendations.length === 0) {
        recommendations.push('Monitor engagement trends')
    }

    return recommendations
}

// ============================================================================
// Calculate last active date
// ============================================================================

function calculateLastActive(daysSince: number): string {
    const date = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)
    return date.toISOString()
}

// ============================================================================
// Fetch churn trends
// ============================================================================

export async function fetchChurnTrends(days = 30) {
    const supabase = createClient()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
        .from('churn_predictions')
        .select('prediction_date, churn_probability, engagement_score, risk_level')
        .gte('prediction_date', startDate)
        .order('prediction_date', { ascending: true })

    if (error) throw error

    // Aggregate by date
    const trendsByDate = (data || []).reduce((acc: any, record) => {
        const date = record.prediction_date
        if (!acc[date]) {
            acc[date] = {
                date,
                avgChurnProb: 0,
                avgEngagement: 0,
                count: 0,
                highRisk: 0,
                mediumRisk: 0,
                lowRisk: 0
            }
        }

        acc[date].avgChurnProb += record.churn_probability
        acc[date].avgEngagement += record.engagement_score
        acc[date].count += 1

        if (record.risk_level === 'high') acc[date].highRisk += 1
        if (record.risk_level === 'medium') acc[date].mediumRisk += 1
        if (record.risk_level === 'low') acc[date].lowRisk += 1

        return acc
    }, {})

    return Object.values(trendsByDate).map((trend: any) => ({
        date: trend.date,
        avgChurnProbability: Math.round((trend.avgChurnProb / trend.count) * 10) / 10,
        avgEngagementScore: Math.round((trend.avgEngagement / trend.count) * 10) / 10,
        highRiskCount: trend.highRisk,
        mediumRiskCount: trend.mediumRisk,
        lowRiskCount: trend.lowRisk
    }))
}

// ============================================================================
// Fetch active alerts
// ============================================================================

export async function fetchActiveAlerts() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('engagement_alerts')
        .select(`
            *,
            users!inner(id, name, email)
        `)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) throw error

    return data || []
}

// ============================================================================
// Dismiss alert
// ============================================================================

export async function dismissAlert(alertId: string, adminId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('engagement_alerts')
        .update({
            is_dismissed: true,
            dismissed_at: new Date().toISOString(),
            dismissed_by: adminId
        })
        .eq('id', alertId)

    if (error) throw error
    return { success: true }
}

// ============================================================================
// Update engagement scores (trigger batch update)
// ============================================================================

export async function updateEngagementScores() {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('update_all_engagement_metrics')

    if (error) throw error
    return { success: true, usersUpdated: data }
}

// ============================================================================
// Get retention insights
// ============================================================================

export async function getRetentionInsights() {
    const supabase = createClient()

    // Find weak categories (low performance)
    const { data: categoryPerf } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .lt('avg_score_30d', 60)

    // Identify drop-off points
    const { data: dropoffs } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .gt('days_since_last_quiz', 14)
        .lt('quiz_count_30d', 3)

    return {
        weakCategories: categoryPerf?.length || 0,
        dropoffUsers: dropoffs?.length || 0,
        insights: [
            `${dropoffs?.length || 0} users haven't taken a quiz in 2+ weeks`,
            `${categoryPerf?.length || 0} users struggling with low scores`,
            'Consider personalized quiz recommendations',
            'Implement weekly engagement reminders'
        ]
    }
}
