'use client'

// ============================================================================
// ReviewScreen Component
// ============================================================================
// Review all questions before submission
// ============================================================================

import { AlertCircle, Bookmark, CheckCircle, Circle } from 'lucide-react'
import type { Question, QuestionOption } from '@/types'

interface ReviewScreenProps {
    questions: Question[]
    answers: Record<string, QuestionOption>
    bookmarks: Set<string>
    onQuestionClick: (index: number) => void
    onSubmit: () => void
    onCancel: () => void
}

export function ReviewScreen({
    questions,
    answers,
    bookmarks,
    onQuestionClick,
    onSubmit,
    onCancel,
}: ReviewScreenProps) {
    const answeredCount = Object.keys(answers).length
    const unansweredCount = questions.length - answeredCount
    const bookmarkedQuestions = questions.filter(q => bookmarks.has(q.id))

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Answers</h2>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium mb-1">Total Questions</div>
                        <div className="text-2xl font-bold text-blue-900">{questions.length}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium mb-1">Answered</div>
                        <div className="text-2xl font-bold text-green-900">{answeredCount}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-sm text-red-600 font-medium mb-1">Unanswered</div>
                        <div className="text-2xl font-bold text-red-900">{unansweredCount}</div>
                    </div>
                </div>

                {/* Unanswered Warning */}
                {unansweredCount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-yellow-900 text-sm">
                                <p className="font-semibold mb-1">You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}</p>
                                <p>Click on any question below to go back and answer it.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookmarked Questions */}
                {bookmarkedQuestions.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Bookmark className="w-5 h-5 text-yellow-600 fill-current mr-2" />
                            Bookmarked Questions ({bookmarkedQuestions.length})
                        </h3>
                        <div className="space-y-2">
                            {bookmarkedQuestions.map((question, idx) => {
                                const questionIndex = questions.findIndex(q => q.id === question.id)
                                const hasAnswer = question.id in answers

                                return (
                                    <button
                                        key={question.id}
                                        onClick={() => onQuestionClick(questionIndex)}
                                        className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">
                                                Question {questionIndex + 1}
                                            </span>
                                            {hasAnswer ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* All Questions */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">All Questions</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {questions.map((question, index) => {
                            const hasAnswer = question.id in answers
                            const isBookmarked = bookmarks.has(question.id)

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => onQuestionClick(index)}
                                    className={`relative aspect-square flex items-center justify-center rounded-lg border-2 font-semibold text-sm transition-all hover:scale-105 ${hasAnswer
                                            ? 'bg-green-600 border-green-700 text-white'
                                            : 'bg-gray-200 border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {index + 1}
                                    {isBookmarked && (
                                        <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                        Back to Quiz
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    )
}
