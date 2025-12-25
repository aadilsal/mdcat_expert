'use client'

// ============================================================================
// Delete Confirmation Modal
// ============================================================================

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    question?: any
    isLoading?: boolean
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    question,
    isLoading = false
}: DeleteConfirmModalProps) {
    if (!isOpen || !question) return null

    const usageCount = question.question_usage_stats?.times_attempted || 0

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Delete Question</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {usageCount > 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 font-medium">
                                ⚠️ This question has been used in {usageCount} quiz attempts and cannot be deleted.
                            </p>
                            <p className="text-red-700 text-sm mt-2">
                                Deleting questions that have been used would corrupt historical quiz data.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 font-medium">
                                Are you sure you want to delete this question?
                            </p>
                            <p className="text-yellow-700 text-sm mt-2">
                                This action cannot be undone.
                            </p>
                        </div>
                    )}

                    {/* Question Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 font-medium mb-3">
                            {question.question_text || (
                                <span className="text-blue-600">[Image Question]</span>
                            )}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-2 rounded">A: {question.option_a}</div>
                            <div className="bg-white p-2 rounded">B: {question.option_b}</div>
                            <div className="bg-white p-2 rounded">C: {question.option_c}</div>
                            <div className="bg-white p-2 rounded">D: {question.option_d}</div>
                        </div>

                        <div className="mt-3 flex gap-3 text-sm">
                            <span className="text-gray-600">
                                {question.question_categories?.name || 'Uncategorized'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${question.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                                    question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {question.difficulty_level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    {usageCount === 0 && (
                        <Button
                            onClick={onConfirm}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete Question'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
