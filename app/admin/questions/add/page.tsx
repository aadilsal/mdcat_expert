'use client'

// ============================================================================
// Add Question Page
// ============================================================================
// Admin interface for adding individual questions to quizzes
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    Plus,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react'
import type { Quiz, QuestionCategory, DifficultyLevel } from '@/types'

export default function AddQuestionPage() {
    const { isLoading: authLoading } = useRequireAuth('admin')
    const router = useRouter()

    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [categories, setCategories] = useState<QuestionCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [selectedQuiz, setSelectedQuiz] = useState<string>('')
    const [showNewQuizForm, setShowNewQuizForm] = useState(false)
    const [newQuizTitle, setNewQuizTitle] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')
    const [questionText, setQuestionText] = useState('')
    const [questionImageUrl, setQuestionImageUrl] = useState('')
    const [optionA, setOptionA] = useState('')
    const [optionB, setOptionB] = useState('')
    const [optionC, setOptionC] = useState('')
    const [optionD, setOptionD] = useState('')
    const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A')
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medium')
    const [explanation, setExplanation] = useState('')

    // Fetch quizzes and categories
    useEffect(() => {
        async function fetchData() {
            try {
                const [quizzesRes, categoriesRes] = await Promise.all([
                    fetch('/api/admin/quizzes'),
                    fetch('/api/admin/categories'),
                ])

                const quizzesData = await quizzesRes.json()
                const categoriesData = await categoriesRes.json()

                setQuizzes(quizzesData.quizzes || [])
                setCategories(categoriesData.categories || [])
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Create new quiz
    const handleCreateQuiz = async () => {
        if (!newQuizTitle.trim()) {
            setError('Quiz title is required')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newQuizTitle,
                    category_id: categoryId || null,
                    difficulty_level: difficultyLevel,
                }),
            })

            if (!response.ok) throw new Error('Failed to create quiz')

            const data = await response.json()
            setQuizzes([data.quiz, ...quizzes])
            setSelectedQuiz(data.quiz.id)
            setShowNewQuizForm(false)
            setNewQuizTitle('')
        } catch (err) {
            console.error('Error creating quiz:', err)
            setError('Failed to create quiz')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Submit question
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            if (!selectedQuiz) {
                throw new Error('Please select a quiz')
            }

            if (!questionText && !questionImageUrl) {
                throw new Error('Either question text or image URL is required')
            }

            if (!optionA || !optionB || !optionC || !optionD) {
                throw new Error('All options are required')
            }

            const response = await fetch('/api/admin/questions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: selectedQuiz,
                    category_id: categoryId || null,
                    question_text: questionText || null,
                    question_image_url: questionImageUrl || null,
                    option_a: optionA,
                    option_b: optionB,
                    option_c: optionC,
                    option_d: optionD,
                    correct_option: correctOption,
                    difficulty_level: difficultyLevel,
                    explanation: explanation || null,
                }),
            })

            if (!response.ok) throw new Error('Failed to create question')

            // Show success and reset form
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)

            // Reset form
            setQuestionText('')
            setQuestionImageUrl('')
            setOptionA('')
            setOptionB('')
            setOptionC('')
            setOptionD('')
            setCorrectOption('A')
            setExplanation('')
        } catch (err: any) {
            console.error('Error creating question:', err)
            setError(err.message || 'Failed to create question')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Button
                    onClick={() => router.push('/admin/dashboard')}
                    variant="ghost"
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Add Question</h1>
                <p className="text-gray-600 mt-2">
                    Add a new question to an existing quiz or create a new quiz
                </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                    <CheckCircle className="text-green-600 mr-2" size={20} />
                    <span className="text-green-800 font-medium">
                        Question added successfully!
                    </span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                    <AlertCircle className="text-red-600 mr-2" size={20} />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Selection */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Select Quiz
                    </h2>

                    {!showNewQuizForm ? (
                        <>
                            <select
                                value={selectedQuiz}
                                onChange={(e) => setSelectedQuiz(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                required
                            >
                                <option value="">Select a quiz...</option>
                                {quizzes.map((quiz) => (
                                    <option key={quiz.id} value={quiz.id}>
                                        {quiz.title} ({quiz.question_count} questions)
                                    </option>
                                ))}
                            </select>

                            <Button
                                type="button"
                                onClick={() => setShowNewQuizForm(true)}
                                variant="outline"
                            >
                                <Plus className="mr-2" size={16} />
                                Create New Quiz
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Quiz Title *
                                </label>
                                <input
                                    type="text"
                                    value={newQuizTitle}
                                    onChange={(e) => setNewQuizTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Biology Practice Test"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleCreateQuiz}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" size={16} />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Quiz'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setShowNewQuizForm(false)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Question Details
                    </h2>

                    <div className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select category...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Text
                            </label>
                            <textarea
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter the question..."
                            />
                        </div>

                        {/* Question Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Image URL (optional)
                            </label>
                            <input
                                type="url"
                                value={questionImageUrl}
                                onChange={(e) => setQuestionImageUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Option A *
                                </label>
                                <input
                                    type="text"
                                    value={optionA}
                                    onChange={(e) => setOptionA(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Option B *
                                </label>
                                <input
                                    type="text"
                                    value={optionB}
                                    onChange={(e) => setOptionB(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Option C *
                                </label>
                                <input
                                    type="text"
                                    value={optionC}
                                    onChange={(e) => setOptionC(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Option D *
                                </label>
                                <input
                                    type="text"
                                    value={optionD}
                                    onChange={(e) => setOptionD(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Correct Option */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correct Option *
                            </label>
                            <select
                                value={correctOption}
                                onChange={(e) =>
                                    setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty Level *
                            </label>
                            <select
                                value={difficultyLevel}
                                onChange={(e) =>
                                    setDifficultyLevel(e.target.value as DifficultyLevel)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Explanation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Explanation (optional)
                            </label>
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Explain why this is the correct answer..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        onClick={() => router.push('/admin/dashboard')}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedQuiz}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={16} />
                                Adding Question...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2" size={16} />
                                Add Question
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
