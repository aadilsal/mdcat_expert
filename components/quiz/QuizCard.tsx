'use client'

// ============================================================================
// QuizCard Component
// ============================================================================
// Displays quiz information card with metadata and start button
// ============================================================================

import { Clock, FileQuestion, TrendingUp, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { Quiz, QuestionCategory } from '@/types'

interface QuizCardProps {
    quiz: Quiz & { category: QuestionCategory | null }
}

export function QuizCard({ quiz }: QuizCardProps) {
    const difficultyColors = {
        easy: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800',
        mixed: 'bg-blue-100 text-blue-800',
    }

    const difficultyColor =
        difficultyColors[quiz.difficulty_level || 'mixed']

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200/50 group hover:-translate-y-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {quiz.title}
                    </h3>
                    {quiz.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                            {quiz.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="space-y-3 mb-4">
                {/* Category */}
                {quiz.category && (
                    <div className="flex items-center text-sm text-gray-700">
                        <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                        <span>{quiz.category.name}</span>
                    </div>
                )}

                {/* Question Count */}
                <div className="flex items-center text-sm text-gray-700">
                    <FileQuestion className="w-4 h-4 mr-2 text-pink-600" />
                    <span>{quiz.question_count} Questions</span>
                </div>

                {/* Time Limit */}
                <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>
                        {quiz.time_limit_minutes} Minutes
                        {quiz.is_practice_mode && ' (Practice Mode)'}
                    </span>
                </div>

                {/* Difficulty */}
                {quiz.difficulty_level && (
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}
                        >
                            {quiz.difficulty_level.charAt(0).toUpperCase() +
                                quiz.difficulty_level.slice(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Start Button */}
            <Link
                href={`/quiz/start/${quiz.id}`}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
                Start Quiz
            </Link>
        </div>
    )
}
