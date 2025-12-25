'use client'

// ============================================================================
// Empty State Component
// ============================================================================

import { FileQuestion, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
                <FileQuestion size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="bg-purple-600 text-white">
                    <Plus className="mr-2" size={18} />
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
