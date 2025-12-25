'use client'

// ============================================================================
// Loading Skeleton Component
// ============================================================================

export function UserCardSkeleton() {
    return (
        <div className="p-6 border-b border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-64 mb-2" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded w-16" />
                            <div className="h-6 bg-gray-200 rounded w-16" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <div className="h-8 bg-gray-200 rounded w-12 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="text-center">
                        <div className="h-8 bg-gray-200 rounded w-12 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="text-center">
                        <div className="h-8 bg-gray-200 rounded w-12 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function UserListSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <UserCardSkeleton key={i} />
            ))}
        </div>
    )
}
