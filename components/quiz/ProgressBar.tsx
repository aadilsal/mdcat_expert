'use client'

// ============================================================================
// ProgressBar Component
// ============================================================================
// Visual progress indicator with answered/total count
// ============================================================================

interface ProgressBarProps {
    answered: number
    total: number
}

export function ProgressBar({ answered, total }: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Progress
                </span>
                <span className="text-sm font-semibold text-gray-900">
                    {answered} / {total} ({percentage}%)
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
