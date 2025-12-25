'use client'

// ============================================================================
// Quiz Instructions/Start Page
// ============================================================================
// Display quiz instructions and metadata before starting
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { Clock, FileQuestion, TrendingUp, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { Quiz, QuestionCategory } from '@/types'

export default function QuizStartPage() {
    const { isLoading: authLoading } = useRequireAuth()
    const router = useRouter()
    const params = useParams()
    const quizId = params.quizId as string

    const [quiz, setQuiz] = useState<(Quiz & { category: QuestionCategory | null }) | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isStarting, setIsStarting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch quiz details
    useEffect(() => {
        async function fetchQuiz() {
            try {
                const response = await fetch(`/api/quiz/list`)
                if (!response.ok) throw new Error('Failed to fetch quiz')

                const data = await response.json()
                const foundQuiz = data.quizzes?.find((q: any) => q.id === quizId)

                if (!foundQuiz) {
                    setError('Quiz not found')
                } else {
                    setQuiz(foundQuiz)
                }
            } catch (err) {
                console.error('Error fetching quiz:', err)
                setError('Failed to load quiz details')
            } finally {
                setIsLoading(false)
            }
        }

        if (quizId) {
            fetchQuiz()
        }
    }, [quizId])

    // Start quiz
    const handleStartQuiz = async () => {
        setIsStarting(true)
        setError(null)

        try {
            const response = await fetch('/api/quiz/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz_id: quizId }),
            })

            if (!response.ok) throw new Error('Failed to start quiz')

            const data = await response.json()
            router.push(`/quiz/${data.session_id}`)
        } catch (err) {
            console.error('Error starting quiz:', err)
            setError('Failed to start quiz. Please try again.')
            setIsStarting(false)
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 relative z-10" />
            </div>
        )
    }

    if (error || !quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                            <h2 className="text-xl font-semibold text-red-900">Error</h2>
                        </div>
                        <p className="text-red-800 mb-4">{error || 'Quiz not found'}</p>
                        <button
                            onClick={() => router.push('/quiz')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
            <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
                {/* Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-6 border border-gray-200/50">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">{quiz.title}</h1>
                    {quiz.description && (
                        <p className="text-gray-600 text-lg mb-6">{quiz.description}</p>
                    )}

                    {/* Quiz Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {quiz.category && (
                            <div className="flex items-center text-gray-700">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                <div>
                                    <div className="text-xs text-gray-500">Category</div>
                                    <div className="font-medium">{quiz.category.name}</div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center text-gray-700">
                            <FileQuestion className="w-5 h-5 mr-2 text-purple-600" />
                            <div>
                                <div className="text-xs text-gray-500">Questions</div>
                                <div className="font-medium">{quiz.question_count}</div>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Clock className="w-5 h-5 mr-2 text-orange-600" />
                            <div>
                                <div className="text-xs text-gray-500">Time Limit</div>
                                <div className="font-medium">{quiz.time_limit_minutes} min</div>
                            </div>
                        </div>
                        {quiz.difficulty_level && (
                            <div className="flex items-center text-gray-700">
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                <div>
                                    <div className="text-xs text-gray-500">Difficulty</div>
                                    <div className="font-medium capitalize">{quiz.difficulty_level}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {quiz.is_practice_mode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-blue-900 font-medium">Practice Mode</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-6 border border-gray-200/50">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Instructions</h2>

                    <div className="space-y-4 text-gray-700">
                        <div className="flex items-start">
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-purple-600 font-semibold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Answer All Questions</h3>
                                <p className="text-sm">You have {quiz.question_count} questions to answer within {quiz.time_limit_minutes} minutes.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-blue-600 font-semibold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Navigation</h3>
                                <p className="text-sm">Use Next/Previous buttons or click on question numbers to navigate. You can change your answers anytime before submitting.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-blue-600 font-semibold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Bookmarks</h3>
                                <p className="text-sm">Flag questions you want to review later by clicking the bookmark icon.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-blue-600 font-semibold">4</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Auto-Save</h3>
                                <p className="text-sm">Your answers are automatically saved. You can safely close the browser and resume later.</p>
                            </div>
                        </div>

                        {quiz.allow_pause && (
                            <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                    <span className="text-blue-600 font-semibold">5</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Pause & Resume</h3>
                                    <p className="text-sm">You can pause the quiz at any time and resume later from where you left off.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-blue-600 font-semibold">{quiz.allow_pause ? '6' : '5'}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Submission</h3>
                                <p className="text-sm">Review your answers before final submission. Once submitted, you cannot change your answers.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-yellow-900 text-sm">
                            <p className="font-semibold mb-1">Important</p>
                            <p>The timer will start as soon as you click "Start Quiz". Make sure you're ready before proceeding.</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/quiz')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-lg font-semibold transition-colors"
                        disabled={isStarting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartQuiz}
                        disabled={isStarting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            'Start Quiz'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
