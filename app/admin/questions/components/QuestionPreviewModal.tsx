'use client'

// ============================================================================
// Question Preview Modal
// ============================================================================

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuestionPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    question: any
}

export function QuestionPreviewModal({ isOpen, onClose, question }: QuestionPreviewModalProps) {
    if (!isOpen || !question) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Question Preview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Question */}
                    <div className="mb-8">
                        {question.question_image_url ? (
                            <img
                                src={question.question_image_url}
                                alt="Question"
                                className="w-full rounded-lg border border-gray-200"
                            />
                        ) : (
                            <p className="text-xl text-gray-900 leading-relaxed">
                                {question.question_text}
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <button
                                key={opt}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${opt === question.correct_option
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-white border-gray-200 hover:border-purple-300'
                                    }`}
                                disabled
                            >
                                <span className="font-semibold text-gray-700">{opt}.</span>{' '}
                                <span className="text-gray-900">
                                    {question[`option_${opt.toLowerCase()}`]}
                                </span>
                                {opt === question.correct_option && (
                                    <span className="ml-2 text-green-600 font-medium">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Explanation:</p>
                            <p className="text-blue-800">{question.explanation}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-6 flex gap-3 text-sm">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                            {question.question_categories?.name || 'Uncategorized'}
                        </span>
                        <span className={`px-3 py-1 rounded-full font-medium ${question.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                                question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {question.difficulty_level}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <Button onClick={onClose} className="w-full">
                        Close Preview
                    </Button>
                </div>
            </div>
        </div>
    )
}
