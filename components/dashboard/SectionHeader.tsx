'use client'

// ============================================================================
// Section Header Component
// ============================================================================
// Consistent headers for dashboard sections
// ============================================================================

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SectionHeaderProps {
    title: string
    subtitle?: string
    icon?: LucideIcon
    action?: ReactNode
}

export function SectionHeader({ title, subtitle, icon: Icon, action }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="group/icon p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg hover:scale-110 transition-transform duration-300">
                        <Icon className="text-purple-600 group-hover/icon:animate-pulse" size={24} />
                    </div>
                )}
                <div className="relative">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    {/* Animated Underline */}
                    <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 group-hover:w-full" />
                    {subtitle && (
                        <p className="text-gray-600 text-sm mt-1.5 font-medium">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}
