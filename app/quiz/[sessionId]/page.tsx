'use client'

// ============================================================================
// Main Quiz Page
// ============================================================================
// Complete quiz taking interface with all features
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks/useAuth'
import { incrementGuestCount } from '@/lib/auth/guest-mode'
import { useQuizSession } from '@/lib/quiz/hooks/useQuizSession'
import { useQuizTimer } from '@/lib/quiz/hooks/useQuizTimer'
import { useAutoSave } from '@/lib/quiz/hooks/useAutoSave'
import { useQuizNavigation } from '@/lib/quiz/hooks/useQuizNavigation'
import { useNetworkStatus } from '@/lib/quiz/hooks/useNetworkStatus'
import { QuizHeader } from '@/components/quiz/QuizHeader'
import { QuestionDisplay } from '@/components/quiz/QuestionDisplay'
import { QuestionGrid } from '@/components/quiz/QuestionNavigation'
import { PauseModal } from '@/components/quiz/PauseModal'
import { ReviewScreen } from '@/components/quiz/ReviewScreen'
import { SubmitConfirmation } from '@/components/quiz/SubmitConfirmation'
import { QuizResults } from '@/components/quiz/QuizResults'
import { NetworkStatus } from '@/components/quiz/NetworkStatus'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question, QuestionOption, Quiz, QuizSubmitResponse } from '@/types'

export default function QuizTakingPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string

    // State
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPauseModal, setShowPauseModal] = useState(false)
    const [showReview, setShowReview] = useState(false)
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [results, setResults] = useState<QuizSubmitResponse | null>(null)

    // Network status
    const { isOnline, wasOffline } = useNetworkStatus()

    // Initialize quiz session
    useEffect(() => {
        async function initializeQuiz() {
            try {
                setIsLoading(true)

                // Fetch session data from API
                const response = await fetch(`/api/quiz/session/${sessionId}`)

                if (!response.ok) {
                    throw new Error('Failed to load quiz session')
                }

                const data = await response.json()

                // Set quiz and questions data
                setQuiz(data.quiz)
                setQuestions(data.questions || [])
                setIsLoading(false)
            } catch (err) {
                console.error('Error initializing quiz:', err)
                setError('Failed to load quiz')
                setIsLoading(false)
            }
        }

        if (sessionId) {
            initializeQuiz()
        }
    }, [sessionId])

    // Quiz session hook
    const {
        currentIndex,
        setCurrentIndex,
        answers,
        bookmarks,
        progress,
        selectAnswer,
        getAnswer,
        toggleBookmark,
        isBookmarked,
        getCurrentQuestion,
        getAnsweredIndicesList,
        getBookmarkedIndices,
        getUnansweredCount,
    } = useQuizSession({
        sessionId,
        questions,
        initialIndex: 0,
    })

    // Navigation hook
    const {
        goToNext,
        goToPrevious,
        goToQuestion,
        can_go_next,
        can_go_previous,
    } = useQuizNavigation({
        totalQuestions: questions.length,
        sessionId,
        currentIndex,
        setCurrentIndex,
        answeredIndices: getAnsweredIndicesList(),
        bookmarkedIndices: getBookmarkedIndices(),
    })

    // Auto-save hook
    const { saveStatus, saveAnswer, retrySave } = useAutoSave({
        sessionId,
        onSave: async (questionId, option) => {
            const response = await fetch('/api/quiz/save-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, question_id: questionId, selected_option: option }),
            })
            if (!response.ok) throw new Error('Failed to save answer')
        },
    })

    // Timer hook
    const {
        formattedTime,
        urgency_level,
        is_running,
        pause: pauseTimer,
        resume: resumeTimer,
    } = useQuizTimer({
        initialTimeSeconds: (quiz?.time_limit_minutes || 60) * 60,
        sessionId,
        onTimeExpired: handleTimeExpired,
        autoStart: true,
    })

    // Handle answer selection
    const handleSelectAnswer = useCallback((option: QuestionOption) => {
        const currentQuestion = getCurrentQuestion()
        if (!currentQuestion) return

        selectAnswer(currentQuestion.id, option)
        saveAnswer(currentQuestion.id, option)
    }, [getCurrentQuestion, selectAnswer, saveAnswer])

    // Handle bookmark toggle
    const handleToggleBookmark = useCallback(() => {
        const currentQuestion = getCurrentQuestion()
        if (!currentQuestion) return

        toggleBookmark(currentQuestion.id)

        // Save bookmark to server
        fetch('/api/quiz/bookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, question_id: currentQuestion.id }),
        }).catch(err => console.error('Failed to save bookmark:', err))
    }, [getCurrentQuestion, toggleBookmark, sessionId])

    // Handle pause
    const handlePause = useCallback(() => {
        pauseTimer()
        setShowPauseModal(true)

        // Save state to server
        fetch('/api/quiz/pause', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
        }).catch(err => console.error('Failed to pause quiz:', err))
    }, [pauseTimer, sessionId])

    // Handle resume
    const handleResume = useCallback(() => {
        resumeTimer()
        setShowPauseModal(false)

        // Resume on server
        fetch('/api/quiz/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
        }).catch(err => console.error('Failed to resume quiz:', err))
    }, [resumeTimer, sessionId])

    // Handle time expired
    function handleTimeExpired() {
        handleSubmitQuiz()
    }

    // Handle submit quiz
    const handleSubmitQuiz = useCallback(async () => {
        // For guest users, redirect to signup
        if (!user) {
            router.push('/register?from=quiz')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId }),
            })

            if (!response.ok) throw new Error('Failed to submit quiz')

            const data: QuizSubmitResponse = await response.json()
            setResults(data)
            setShowSubmitConfirm(false)
        } catch (err) {
            console.error('Error submitting quiz:', err)
            setError('Failed to submit quiz')
        } finally {
            setIsSubmitting(false)
        }
    }, [sessionId, user, router])

    // Handle exit
    const handleExit = useCallback(() => {
        if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
            router.push('/quiz')
        }
    }, [router])

    // Loading state
    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        )
    }

    // Results view - redirect to comprehensive results page
    if (results) {
        router.push(`/quiz/results/${sessionId}`)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    // Review screen
    if (showReview) {
        return (
            <ReviewScreen
                questions={questions}
                answers={answers}
                bookmarks={bookmarks}
                onQuestionClick={(index) => {
                    setShowReview(false)
                    goToQuestion(index)
                }}
                onSubmit={() => setShowSubmitConfirm(true)}
                onCancel={() => setShowReview(false)}
            />
        )
    }

    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">No questions available</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Network Status Banner */}
            <NetworkStatus isOnline={isOnline} wasOffline={wasOffline} />

            {/* Header */}
            <QuizHeader
                quizTitle={quiz?.title || 'Quiz'}
                timeRemaining={0}
                formattedTime={formattedTime}
                urgencyLevel={urgency_level}
                isPaused={!is_running}
                answeredCount={progress.answered_questions}
                totalQuestions={progress.total_questions}
                saveStatus={saveStatus}
                allowPause={quiz?.allow_pause || true}
                onPause={handlePause}
                onExit={handleExit}
                onRetrySave={retrySave}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Question Display */}
                    <div className="lg:col-span-2">
                        <QuestionDisplay
                            question={currentQuestion}
                            questionNumber={currentIndex + 1}
                            totalQuestions={questions.length}
                            selectedOption={getAnswer(currentQuestion.id)}
                            isBookmarked={isBookmarked(currentQuestion.id)}
                            onSelectOption={handleSelectAnswer}
                            onToggleBookmark={handleToggleBookmark}
                        />

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={goToPrevious}
                                disabled={!can_go_previous}
                                className="flex-1 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Previous
                            </button>
                            {can_go_next ? (
                                <button
                                    onClick={goToNext}
                                    className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowReview(true)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Review & Submit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Question Grid */}
                    <div className="lg:col-span-1">
                        <QuestionGrid
                            totalQuestions={questions.length}
                            currentIndex={currentIndex}
                            answeredIndices={getAnsweredIndicesList()}
                            bookmarkedIndices={getBookmarkedIndices()}
                            onQuestionClick={goToQuestion}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PauseModal
                isOpen={showPauseModal}
                onResume={handleResume}
                onExit={handleExit}
            />

            <SubmitConfirmation
                isOpen={showSubmitConfirm}
                unansweredCount={getUnansweredCount()}
                timeRemaining={formattedTime}
                onConfirm={handleSubmitQuiz}
                onCancel={() => setShowSubmitConfirm(false)}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
