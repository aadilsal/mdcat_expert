'use client'

// ============================================================================
// QuestionGrid Component
// ============================================================================
// Grid of question numbers showing status (answered/unanswered/bookmarked)
// ============================================================================

import { Bookmark } from 'lucide-react'

interface QuestionGridProps {
    totalQuestions: number
    currentIndex: number
    answeredIndices: number[]
    bookmarkedIndices: number[]
    onQuestionClick: (index: number) => void
}

export function QuestionGrid({
    totalQuestions,
    currentIndex,
    answeredIndices,
    bookmarkedIndices,
    onQuestionClick,
}: QuestionGridProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2" />
                    <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded mr-2" />
                    <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded mr-2" />
                    <span className="text-gray-600">Unanswered</span>
                </div>
                <div className="flex items-center">
                    <Bookmark className="w-4 h-4 text-yellow-600 fill-current mr-2" />
                    <span className="text-gray-600">Bookmarked</span>
                </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: totalQuestions }, (_, index) => {
                    const isCurrent = index === currentIndex
                    const isAnswered = answeredIndices.includes(index)
                    const isBookmarked = bookmarkedIndices.includes(index)

                    let bgColor = 'bg-gray-200 border-gray-300 text-gray-700'
                    if (isCurrent) {
                        bgColor = 'bg-blue-600 border-blue-700 text-white'
                    } else if (isAnswered) {
                        bgColor = 'bg-green-600 border-green-700 text-white'
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => onQuestionClick(index)}
                            className={`relative aspect-square flex items-center justify-center rounded-lg border-2 font-semibold text-sm transition-all hover:scale-105 ${bgColor}`}
                            title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}${isBookmarked ? ' (Bookmarked)' : ''}`}
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
    )
}
