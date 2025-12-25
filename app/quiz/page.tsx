'use client'

// ============================================================================
// Quiz Selection Page
// ============================================================================
// Main page for browsing and selecting quizzes
// ============================================================================

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/hooks/useAuth'
import { getGuestSession } from '@/lib/auth/guest-mode'
import { QuizCard } from '@/components/quiz/QuizCard'
import { QuizFilters } from '@/components/quiz/QuizFilters'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Quiz, QuestionCategory, QuizDifficultyLevel } from '@/types'

export default function QuizPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [guestSession, setGuestSession] = useState(getGuestSession())
    const [quizzes, setQuizzes] = useState<
        (Quiz & { category: QuestionCategory | null })[]
    >([])
    const [categories, setCategories] = useState<QuestionCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedDifficulty, setSelectedDifficulty] = useState<
        QuizDifficultyLevel | 'all'
    >('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch('/api/admin/categories')
                if (!response.ok) throw new Error('Failed to fetch categories')
                const data = await response.json()
                setCategories(data.categories || [])
            } catch (err) {
                console.error('Error fetching categories:', err)
            }
        }
        fetchCategories()
    }, [])

    // Fetch quizzes with filters
    useEffect(() => {
        async function fetchQuizzes() {
            setIsLoading(true)
            setError(null)

            try {
                const params = new URLSearchParams()
                if (selectedCategory !== 'all') {
                    params.append('category_id', selectedCategory)
                }
                if (selectedDifficulty !== 'all') {
                    params.append('difficulty', selectedDifficulty)
                }
                if (searchQuery) {
                    params.append('search', searchQuery)
                }

                const response = await fetch(
                    `/api/quiz/list?${params.toString()}`
                )
                if (!response.ok) throw new Error('Failed to fetch quizzes')

                const data = await response.json()
                setQuizzes(data.quizzes || [])
            } catch (err) {
                console.error('Error fetching quizzes:', err)
                setError('Failed to load quizzes. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        // Debounce search
        const timeoutId = setTimeout(fetchQuizzes, 300)
        return () => clearTimeout(timeoutId)
    }, [selectedCategory, selectedDifficulty, searchQuery])

    // Clear all filters
    const handleClearFilters = () => {
        setSelectedCategory('all')
        setSelectedDifficulty('all')
        setSearchQuery('')
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                {/* Decorative Gradient Orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

                <Loader2 className="w-8 h-8 animate-spin text-purple-600 relative z-10" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
            {/* Decorative Gradient Orbs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />

            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Available Quizzes
                    </h1>
                    <p className="text-gray-700 text-lg font-medium">
                        Select a quiz to test your knowledge and track your progress
                    </p>
                </div>

                {/* Trial Banner for Guest Users */}
                {!user && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">
                                {guestSession.isTrialExpired ? 'Trial Expired' : 'Free Trial'}
                            </h3>
                            {guestSession.isTrialExpired ? (
                                <p className="text-blue-800 text-sm">
                                    You've used all {guestSession.questionsAttempted} free questions.{' '}
                                    <Link href="/register" className="font-semibold underline hover:text-blue-900">
                                        Sign up free
                                    </Link>{' '}
                                    to continue practicing and save your progress.
                                </p>
                            ) : (
                                <p className="text-blue-800 text-sm">
                                    You have <strong>{guestSession.trialRemaining} free questions</strong> remaining.{' '}
                                    <Link href="/register" className="font-semibold underline hover:text-blue-900">
                                        Create a free account
                                    </Link>{' '}
                                    to get unlimited access and save your progress.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <QuizFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    selectedDifficulty={selectedDifficulty}
                    searchQuery={searchQuery}
                    onCategoryChange={setSelectedCategory}
                    onDifficultyChange={setSelectedDifficulty}
                    onSearchChange={setSearchQuery}
                    onClearFilters={handleClearFilters}
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Quiz Grid */}
                {!isLoading && !error && (
                    <>
                        {quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    <QuizCard key={quiz.id} quiz={quiz} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg">
                                <p className="text-gray-600 text-lg mb-4">
                                    No quizzes found matching your filters.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-purple-600 hover:text-purple-700 font-semibold underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
