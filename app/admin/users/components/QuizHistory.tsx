'use client'

// ============================================================================
// Quiz History Component
// ============================================================================

import { useState, useEffect } from 'react'
import { FileText, Calendar, Trophy, Clock } from 'lucide-react'
import { fetchUserQuizHistory } from '@/lib/admin/users/queries'

interface QuizHistoryProps {
    userId: string
}

export function QuizHistory({ userId }: QuizHistoryProps) {
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadQuizHistory()
    }, [userId])

    const loadQuizHistory = async () => {
        setIsLoading(true)
        try {
            const data = await fetchUserQuizHistory(userId)
            setQuizzes(data || [])
        } catch (error) {
            console.error('Error loading quiz history:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="animate-pulse">Loading quiz history...</div>
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz History</h3>

            {quizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No quizzes attempted yet</p>
            ) : (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="text-purple-600" size={18} />
                                        <h4 className="font-semibold text-gray-900">
                                            {quiz.quizzes?.title || 'Untitled Quiz'}
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="text-yellow-600" size={16} />
                                            <span>Score: {quiz.score}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="text-blue-600" size={16} />
                                            <span>
                                                {new Date(quiz.completed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {quiz.time_taken_seconds && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="text-green-600" size={16} />
                                                <span>
                                                    {Math.floor(quiz.time_taken_seconds / 60)}m {quiz.time_taken_seconds % 60}s
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.score >= 80 ? 'bg-green-100 text-green-700' :
                                            quiz.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {quiz.correct_answers}/{quiz.total_questions} correct
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
