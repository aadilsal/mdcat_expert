// ============================================================================
// API Route: Churn Overview
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get total active users
        const { count: totalActive } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user')

        // Get risk level counts
        const { data: metrics } = await supabase
            .from('user_engagement_metrics')
            .select('risk_level, engagement_score, churn_probability')

        const highRisk = metrics?.filter(m => m.risk_level === 'high').length || 0
        const mediumRisk = metrics?.filter(m => m.risk_level === 'medium').length || 0
        const lowRisk = metrics?.filter(m => m.risk_level === 'low').length || 0
        const atRisk = highRisk + mediumRisk

        const avgScore = metrics && metrics.length > 0
            ? metrics.reduce((sum, m) => sum + (m.engagement_score || 0), 0) / metrics.length
            : 0
        const churnRate = totalActive ? (atRisk / totalActive) * 100 : 0
        const retentionRate = 100 - churnRate

        return NextResponse.json({
            totalActiveUsers: totalActive || 0,
            atRiskCount: atRisk,
            highRiskCount: highRisk,
            mediumRiskCount: mediumRisk,
            lowRiskCount: lowRisk,
            churnRate: Math.round(churnRate * 10) / 10,
            retentionRate: Math.round(retentionRate * 10) / 10,
            avgEngagementScore: Math.round(avgScore * 10) / 10,
            trends: {
                activeUsers: 0,
                churnRate: 0,
                engagementScore: 0
            }
        })
    } catch (error: any) {
        console.error('Churn overview API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
