'use client'

// ============================================================================
// SaveStatusIndicator Component
// ============================================================================
// Shows save status (saving/saved/error)
// ============================================================================

import { Check, Loader2, AlertCircle } from 'lucide-react'
import type { SaveStatus } from '@/types'

interface SaveStatusIndicatorProps {
    status: SaveStatus
    onRetry?: () => void
}

export function SaveStatusIndicator({ status, onRetry }: SaveStatusIndicatorProps) {
    if (status === 'idle') return null

    return (
        <div className="flex items-center text-sm">
            {status === 'saving' && (
                <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin text-blue-600" />
                    <span className="text-blue-600">Saving...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-green-600">Saved</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                    <span className="text-red-600">Save failed</span>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                            Retry
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
