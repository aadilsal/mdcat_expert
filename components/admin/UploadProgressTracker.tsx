'use client'

// ============================================================================
// Upload Progress Tracker Component
// ============================================================================
// Real-time progress tracking for upload operations
// ============================================================================

import { UploadProgress } from '@/types'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface UploadProgressTrackerProps {
    progress: UploadProgress
}

export function UploadProgressTracker({ progress }: UploadProgressTrackerProps) {
    const getIcon = () => {
        switch (progress.stage) {
            case 'complete':
                return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />
            default:
                return <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        }
    }

    const getStageLabel = () => {
        switch (progress.stage) {
            case 'parsing':
                return 'Parsing Excel file...'
            case 'validating':
                return 'Validating data...'
            case 'uploading':
                return 'Uploading questions...'
            case 'complete':
                return 'Upload complete!'
            case 'error':
                return 'Upload failed'
            default:
                return 'Processing...'
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                {getIcon()}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {getStageLabel()}
                    </h3>
                    <p className="text-sm text-gray-600">{progress.message}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                />
            </div>

            {/* Row Count */}
            {progress.processedRows !== undefined && progress.totalRows && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                    {progress.processedRows} / {progress.totalRows} rows processed
                </p>
            )}
        </div>
    )
}
