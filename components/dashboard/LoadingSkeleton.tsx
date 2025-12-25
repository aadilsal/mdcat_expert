'use client'

// ============================================================================
// Loading Skeleton Component
// ============================================================================
// Skeleton loaders for dashboard sections
// ============================================================================

export function LoadingSkeleton({ type = 'card' }: { type?: 'card' | 'list' | 'chart' }) {
    if (type === 'card') {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="w-16 h-6 bg-gray-200 rounded" />
                </div>
                <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-32 h-8 bg-gray-200 rounded" />
            </div>
        )
    }

    if (type === 'list') {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                                <div className="w-1/2 h-3 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (type === 'chart') {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="w-48 h-6 bg-gray-200 rounded mb-6" />
                <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-around p-4">
                    {[40, 60, 80, 50, 70, 90, 65].map((height, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 rounded-t"
                            style={{ height: `${height}%`, width: '12%' }}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return null
}
