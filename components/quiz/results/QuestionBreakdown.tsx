'use client'

// ============================================================================
// Question Breakdown Component
// ============================================================================
// Displays detailed breakdown of each question with answers
// ============================================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Bookmark, Image as ImageIcon } from 'lucide-react'
import { AIExplanation } from './AIExplanation'
import type { QuestionResult } from '@/types'

interface QuestionBreakdownProps {
    questions: QuestionResult[]
    sessionId: string
}

export function QuestionBreakdown({ questions, sessionId }: QuestionBreakdownProps) {
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

    const toggleQuestion = (questionId: string) => {
        const newExpanded = new Set(expandedQuestions)
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId)
        } else {
            newExpanded.add(questionId)
        }
        setExpandedQuestions(newExpanded)
    }

    const getOptionLabel = (option: string): string => {
        return option.toUpperCase()
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Question-by-Question Breakdown
            </h2>

            {questions.map((question, index) => {
                const isExpanded = expandedQuestions.has(question.question_id)
                const isCorrect = question.is_correct

                return (
                    <motion.div
                        key={question.question_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'
                            }`}
                    >
                        {/* Question Header */}
                        <button
                            onClick={() => toggleQuestion(question.question_id)}
                            className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start gap-4 flex-1 text-left">
                                {/* Question Number & Status */}
                                <div className="flex-shrink-0">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span
                                            className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                }`}
                                        >
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                        {question.is_bookmarked && (
                                            <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                        <span className="text-sm text-gray-500">
                                            • {question.difficulty_level} • {question.category_name}
                                        </span>
                                    </div>

                                    {/* Question Text/Image Preview */}
                                    <div className="text-gray-900">
                                        {question.question_image_url ? (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>Image-based question</span>
                                            </div>
                                        ) : (
                                            <p className="line-clamp-2">{question.question_text}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronUp className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200"
                                >
                                    <div className="p-6 space-y-6">
                                        {/* Full Question */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Question:
                                            </h4>
                                            {question.question_image_url ? (
                                                <img
                                                    src={question.question_image_url}
                                                    alt="Question"
                                                    className="max-w-full h-auto rounded-lg border border-gray-200"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{question.question_text}</p>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Options:
                                            </h4>
                                            <div className="space-y-2">
                                                {['A', 'B', 'C', 'D'].map((option) => {
                                                    const optionKey = `option_${option.toLowerCase()}` as keyof QuestionResult
                                                    const optionText = question[optionKey] as string
                                                    const isUserAnswer = question.user_answer === option
                                                    const isCorrectOption = question.correct_option === option

                                                    return (
                                                        <div
                                                            key={option}
                                                            className={`p-4 rounded-lg border-2 ${isCorrectOption
                                                                ? 'border-green-500 bg-green-50'
                                                                : isUserAnswer && !isCorrect
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-200 bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrectOption
                                                                        ? 'bg-green-500 text-white'
                                                                        : isUserAnswer && !isCorrect
                                                                            ? 'bg-red-500 text-white'
                                                                            : 'bg-gray-300 text-gray-700'
                                                                        }`}
                                                                >
                                                                    {option}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-900">{optionText}</p>
                                                                    {isCorrectOption && (
                                                                        <span className="text-sm font-semibold text-green-700 mt-1 inline-block">
                                                                            ✓ Correct Answer
                                                                        </span>
                                                                    )}
                                                                    {isUserAnswer && !isCorrect && (
                                                                        <span className="text-sm font-semibold text-red-700 mt-1 inline-block">
                                                                            ✗ Your Answer
                                                                        </span>
                                                                    )}
                                                                    {isUserAnswer && isCorrect && (
                                                                        <span className="text-sm font-semibold text-green-700 mt-1 inline-block">
                                                                            ✓ Your Answer (Correct!)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* AI Explanation */}
                                        <AIExplanation
                                            sessionId={sessionId}
                                            questionId={question.question_id}
                                            initialExplanation={question.explanation_text}
                                            isCached={question.explanation_cached || false}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )
            })}
        </div>
    )
}
