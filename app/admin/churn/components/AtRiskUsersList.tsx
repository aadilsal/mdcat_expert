'use client'

// ============================================================================
// At-Risk Users List Component
// ============================================================================

import { useState } from 'react'
import { AlertTriangle, Mail, TrendingDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AtRiskUser {
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

interface AtRiskUsersListProps {
    users: AtRiskUser[]
    onFilterChange: (filter: 'all' | 'high' | 'medium' | 'low') => void
}

export function AtRiskUsersList({ users, onFilterChange }: AtRiskUsersListProps) {
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
    const [expandedUser, setExpandedUser] = useState<string | null>(null)

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter)
        onFilterChange(newFilter === 'all' ? 'all' : newFilter)
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200'
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'low': return 'bg-green-100 text-green-700 border-green-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getChurnColor = (probability: number) => {
        if (probability >= 70) return 'text-red-600'
        if (probability >= 40) return 'text-orange-600'
        return 'text-green-600'
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header with filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">At-Risk Users</h2>
                    <span className="text-sm text-gray-600">{users.length} users</span>
                </div>

                <div className="flex gap-2">
                    {['all', 'high', 'medium', 'low'].map((f) => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} Risk
                        </button>
                    ))}
                </div>
            </div>

            {/* Users list */}
            <div className="divide-y divide-gray-100">
                {users.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No at-risk users found
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                                {/* User info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(user.riskLevel)}`}>
                                            {user.riskLevel.toUpperCase()} RISK
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <Mail size={14} />
                                        <span>{user.email}</span>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-600">Churn Probability</p>
                                            <p className={`text-lg font-bold ${getChurnColor(user.churnProbability)}`}>
                                                {user.churnProbability}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Engagement Score</p>
                                            <p className="text-lg font-bold text-purple-600">
                                                {user.engagementScore}/100
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Last Active</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {user.daysSinceLastLogin}d ago
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    {expandedUser === user.id && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                                Recommended Actions:
                                            </h4>
                                            <ul className="space-y-1">
                                                {user.recommendedActions.map((action, idx) => (
                                                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                                        <span className="text-blue-600 mt-0.5">•</span>
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {expandedUser === user.id ? 'Hide' : 'View'} Actions
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-purple-600 text-white"
                                    >
                                        Contact
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
