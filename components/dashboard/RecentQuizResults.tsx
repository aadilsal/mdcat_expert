'use client'

// ============================================================================
// Recent Quiz Results Component
// ============================================================================
// Displays recent quiz attempts in a table/card format
// ============================================================================

import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { QuizAttempt } from '@/lib/dashboard/types'
import { formatDuration, formatRelativeTime } from '@/lib/dashboard/utils'
import { EmptyState } from './EmptyState'
import { BookOpen } from 'lucide-react'

interface RecentQuizResultsProps {
    quizzes: QuizAttempt[]
}

export function RecentQuizResults({ quizzes }: RecentQuizResultsProps) {
    if (quizzes.length === 0) {
        return (
            <EmptyState
                icon={BookOpen}
                title="No Quizzes Yet"
                description="Start taking quizzes to see your results here!"
                actionLabel="Start Your First Quiz"
                onAction={() => window.location.href = '/quiz'}
            />
        )
    }

    return (
        <div className="space-y-3">
            {quizzes.map((quiz) => (
                <div
                    key={quiz.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${quiz.score >= 80
                                    ? 'bg-green-100'
                                    : quiz.score >= 60
                                        ? 'bg-yellow-100'
                                        : 'bg-red-100'
                                }`}>
                                {quiz.score >= 60 ? (
                                    <CheckCircle className={
                                        quiz.score >= 80 ? 'text-green-600' : 'text-yellow-600'
                                    } size={20} />
                                ) : (
                                    <XCircle className="text-red-600" size={20} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    {quiz.categoryName || 'General Quiz'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {formatRelativeTime(quiz.completedAt)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{quiz.score}%</p>
                            <p className="text-xs text-gray-500">
                                {quiz.correctAnswers}/{quiz.totalQuestions}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDuration(quiz.durationSeconds)}</span>
                        </div>
                        {quiz.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${quiz.difficulty === 'easy'
                                    ? 'bg-green-100 text-green-700'
                                    : quiz.difficulty === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                            </span>
                        )}
                        <span className="ml-auto text-gray-500">
                            Accuracy: {Math.round(quiz.accuracy)}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
