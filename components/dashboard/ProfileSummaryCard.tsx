'use client'

// ============================================================================
// Profile Summary Card Component
// ============================================================================
// Displays user profile with avatar, name, streak, and member info
// ============================================================================

import { User, Calendar, Flame } from 'lucide-react'
import { UserProfile } from '@/lib/dashboard/types'
import { getInitials, formatRelativeTime } from '@/lib/dashboard/utils'

interface ProfileSummaryCardProps {
    profile: UserProfile
}

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
    const initials = getInitials(profile.fullName)
    const memberSince = new Date(profile.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{profile.fullName}</h3>
                    <p className="text-gray-600">{profile.email}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Member Since */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Member Since</p>
                        <p className="text-sm font-semibold text-gray-900">{memberSince}</p>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Flame className="text-orange-600" size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Current Streak</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {profile.currentStreak} {profile.currentStreak === 1 ? 'day' : 'days'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Longest Streak */}
            {profile.longestStreak > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            🏆 Longest Streak: <span className="font-bold">{profile.longestStreak} days</span>
                        </span>
                        {profile.currentStreak === profile.longestStreak && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                                Record!
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Last Activity */}
            {profile.lastActivityDate && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Last active: {formatRelativeTime(profile.lastActivityDate)}
                </p>
            )}
        </div>
    )
}
