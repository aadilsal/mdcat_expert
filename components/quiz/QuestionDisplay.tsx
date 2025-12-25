'use client'

// ============================================================================
// QuestionDisplay Component
// ============================================================================
// Display question with text or image support
// ============================================================================

import { Bookmark } from 'lucide-react'
import Image from 'next/image'
import type { Question, QuestionOption } from '@/types'
import { AnswerOptions } from './AnswerOptions'

interface QuestionDisplayProps {
    question: Question
    questionNumber: number
    totalQuestions: number
    selectedOption?: QuestionOption
    isBookmarked: boolean
    onSelectOption: (option: QuestionOption) => void
    onToggleBookmark: () => void
}

export function QuestionDisplay({
    question,
    questionNumber,
    totalQuestions,
    selectedOption,
    isBookmarked,
    onSelectOption,
    onToggleBookmark,
}: QuestionDisplayProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                </div>
                <button
                    onClick={onToggleBookmark}
                    className={`p-2 rounded-lg transition-colors ${isBookmarked
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                        }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark for review'}
                >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Question Content */}
            <div className="mb-6">
                {question.question_text && (
                    <div className="text-lg text-gray-900 leading-relaxed mb-4">
                        {question.question_text}
                    </div>
                )}

                {question.question_image_url && (
                    <div className="relative w-full max-w-2xl mx-auto mb-4">
                        <Image
                            src={question.question_image_url}
                            alt="Question image"
                            width={800}
                            height={600}
                            className="rounded-lg border border-gray-300"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                )}
            </div>

            {/* Answer Options */}
            <AnswerOptions
                options={{
                    A: question.option_a,
                    B: question.option_b,
                    C: question.option_c,
                    D: question.option_d,
                }}
                selectedOption={selectedOption}
                onSelect={onSelectOption}
            />
        </div>
    )
}
