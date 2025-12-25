'use client'

// ============================================================================
// Loading Skeleton Component
// ============================================================================

export function QuestionCardSkeleton() {
    return (
        <div className="p-6 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex gap-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    )
}

export function QuestionListSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => (
                    <QuestionCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
