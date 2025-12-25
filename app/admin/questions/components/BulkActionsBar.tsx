'use client'

// ============================================================================
// Bulk Actions Bar Component
// ============================================================================

import { Trash2, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkActionsBarProps {
    selectedCount: number
    onDelete: () => void
    onExport: () => void
    onClear: () => void
}

export function BulkActionsBar({
    selectedCount,
    onDelete,
    onExport,
    onClear
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-800 rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 z-50">
            <span className="text-gray-900 font-medium">
                {selectedCount} selected
            </span>

            <div className="h-6 w-px bg-gray-300" />

            <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            >
                <Download size={16} className="mr-2" />
                Export
            </Button>

            <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="rounded-full text-red-700 border-red-300 hover:bg-red-50 font-medium"
            >
                <Trash2 size={16} className="mr-2" />
                Delete
            </Button>

            <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-700"
                title="Clear selection"
            >
                <X size={20} />
            </button>
        </div>
    )
}
