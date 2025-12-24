'use client'

// ============================================================================
// PasswordStrength Component
// ============================================================================
// Visual indicator for password strength
// ============================================================================

import { getPasswordStrength, type PasswordStrength as PasswordStrengthType } from '@/lib/auth/validation'
import { useEffect, useState } from 'react'

interface PasswordStrengthProps {
    password: string
    showFeedback?: boolean
}

export function PasswordStrength({ password, showFeedback = true }: PasswordStrengthProps) {
    const [strength, setStrength] = useState<PasswordStrengthType>({
        score: 0,
        feedback: [],
        isValid: false,
    })

    useEffect(() => {
        if (password) {
            setStrength(getPasswordStrength(password))
        } else {
            setStrength({ score: 0, feedback: [], isValid: false })
        }
    }, [password])

    if (!password) return null

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-blue-500',
        'bg-green-500',
    ]

    const strengthLabel = strengthLabels[strength.score]
    const strengthColor = strengthColors[strength.score]
    const widthPercentage = ((strength.score + 1) / 5) * 100

    return (
        <div className="mt-2 space-y-2">
            {/* Strength bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${widthPercentage}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                    {strengthLabel}
                </span>
            </div>

            {/* Feedback */}
            {showFeedback && strength.feedback.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                    {strength.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
