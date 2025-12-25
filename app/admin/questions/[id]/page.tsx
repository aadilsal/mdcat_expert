'use client'

// ============================================================================
// Question Details/View Page
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useRequireAuth'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, TrendingUp } from 'lucide-react'
import { fetchQuestion, deleteQuestion } from '@/lib/admin/queries'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

export default function QuestionDetailsPage() {
    const auth = useRequireAuth({ requireEmailVerification: true })
    const router = useRouter()
    const params = useParams()
    const questionId = params.id as string

    const [question, setQuestion] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Redirect if not admin
    if (!auth.isLoading && auth.role !== 'admin') {
        router.push('/dashboard')
        return null
    }

    // Load question
    useEffect(() => {
        if (questionId) {
            fetchQuestion(questionId).then(({ question }) => {
                setQuestion(question)
                setIsLoading(false)
            })
        }
    }, [questionId])

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteQuestion(questionId)
        setIsDeleting(false)

        if (result.success) {
            router.push('/admin/questions')
        } else {
            alert(result.error)
        }
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
        )
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Question not found</p>
                    <Button onClick={() => router.push('/admin/questions')} className="mt-4">
                        Back to Questions
                    </Button>
                </div>
            </div>
        )
    }

    const stats = question.question_usage_stats || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            onClick={() => router.push('/admin/questions')}
                            variant="outline"
                            className="mb-4 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2" size={18} />
                            Back to Questions
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Question Details
                                </h1>
                                <div className="flex gap-3">
                                    <span className="text-gray-600">
                                        {question.question_categories?.name || 'Uncategorized'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${question.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                                            question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {question.difficulty_level}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => router.push(`/admin/questions/${questionId}/edit`)}
                                    className="bg-purple-600 text-white"
                                >
                                    <Edit className="mr-2" size={18} />
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => setDeleteModalOpen(true)}
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="mr-2" size={18} />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <TrendingUp className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Times Attempted</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.times_attempted || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <TrendingUp className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Correct Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.correct_percentage?.toFixed(0) || 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Times Correct</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.times_correct || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question</h2>

                        {question.question_image_url ? (
                            <img
                                src={question.question_image_url}
                                alt="Question"
                                className="w-full rounded-lg mb-4"
                            />
                        ) : (
                            <p className="text-gray-900 text-lg mb-6">{question.question_text}</p>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4">
                            {['A', 'B', 'C', 'D'].map(opt => (
                                <div
                                    key={opt}
                                    className={`p-4 rounded-lg border-2 ${opt === question.correct_option
                                            ? 'bg-green-50 border-green-500'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <span className="font-semibold text-gray-700">{opt}:</span>{' '}
                                    <span className="text-gray-900">
                                        {question[`option_${opt.toLowerCase()}`]}
                                    </span>
                                    {opt === question.correct_option && (
                                        <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Explanation</h2>
                            <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Created By</p>
                                <p className="text-gray-900 font-medium">
                                    {question.users?.full_name || 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created At</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(question.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Last Updated</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(question.updated_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Question ID</p>
                                <p className="text-gray-900 font-mono text-xs">{question.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delete Modal */}
                    <DeleteConfirmModal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        question={question}
                        isLoading={isDeleting}
                    />
                </div>
            </div>
        </div>
    )
}
