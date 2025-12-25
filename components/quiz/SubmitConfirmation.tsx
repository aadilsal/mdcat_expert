'use client'

// ============================================================================
// SubmitConfirmation Component
// ============================================================================
// Final confirmation modal before submitting quiz
// ============================================================================

import { AlertTriangle, Clock, FileQuestion } from 'lucide-react'

interface SubmitConfirmationProps {
    isOpen: boolean
    unansweredCount: number
    timeRemaining: string
    onConfirm: () => void
    onCancel: () => void
    isSubmitting: boolean
}

export function SubmitConfirmation({
    isOpen,
    unansweredCount,
    timeRemaining,
    onConfirm,
    onCancel,
    isSubmitting,
}: SubmitConfirmationProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Submit Quiz?
                </h2>

                <div className="space-y-3 mb-6">
                    {unansweredCount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center text-red-900">
                                <FileQuestion className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">
                                    {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center text-blue-900">
                            <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium">
                                Time remaining: {timeRemaining}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-900 text-sm">
                        <strong>Warning:</strong> Once you submit, you cannot change your answers. Make sure you've reviewed all questions.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Yes, Submit Quiz'}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
