'use client'

// ============================================================================
// Questions Listing Page - Main Component
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useRequireAuth'
import { Button } from '@/components/ui/button'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { SortDropdown } from './components/SortDropdown'
import { QuestionCard } from './components/QuestionCard'
import { BulkActionsBar } from './components/BulkActionsBar'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { ArrowLeft, Plus, Download } from 'lucide-react'
import { fetchQuestions, fetchCategories, deleteQuestion, bulkDeleteQuestions } from '@/lib/admin/queries'
import { exportQuestionsToExcel, exportFilteredQuestions } from '@/lib/admin/export'
import { QuestionListSkeleton } from './components/LoadingSkeleton'
import { EmptyState } from './components/EmptyState'
import type { QuestionCategory } from '@/types'

export default function QuestionsPage() {
    const auth = useRequireAuth({ requireEmailVerification: true })
    const router = useRouter()
    const searchParams = useSearchParams()

    const [questions, setQuestions] = useState<any[]>([])
    const [categories, setCategories] = useState<QuestionCategory[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [questionToDelete, setQuestionToDelete] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Get filters from URL
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [filters, setFilters] = useState({
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        difficulties: searchParams.get('difficulties')?.split(',').filter(Boolean) || [],
        questionType: (searchParams.get('type') as 'all' | 'text' | 'image') || 'all'
    })
    const [sort, setSort] = useState({
        field: (searchParams.get('sort') || 'created_at') as any,
        direction: (searchParams.get('dir') || 'desc') as 'asc' | 'desc'
    })

    // Redirect if not admin
    if (!auth.isLoading && auth.role !== 'admin') {
        router.push('/dashboard')
        return null
    }

    // Load categories
    useEffect(() => {
        fetchCategories().then(({ categories }) => setCategories(categories))
    }, [])

    // Load questions
    useEffect(() => {
        setIsLoading(true)
        fetchQuestions(
            { search, ...filters },
            sort,
            { page, perPage: 20 }
        ).then(({ questions, total }) => {
            setQuestions(questions)
            setTotal(total)
            setIsLoading(false)
        })
    }, [search, filters, sort, page])

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (filters.categories.length) params.set('categories', filters.categories.join(','))
        if (filters.difficulties.length) params.set('difficulties', filters.difficulties.join(','))
        if (filters.questionType !== 'all') params.set('type', filters.questionType)
        params.set('sort', sort.field)
        params.set('dir', sort.direction)
        if (page > 1) params.set('page', page.toString())

        router.push(`?${params.toString()}`, { scroll: false })
    }, [search, filters, sort, page])

    // Handlers
    const handleDelete = (id: string) => {
        const question = questions.find(q => q.id === id)
        setQuestionToDelete(question)
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!questionToDelete) return

        setIsDeleting(true)
        const result = await deleteQuestion(questionToDelete.id)
        setIsDeleting(false)

        if (result.success) {
            setDeleteModalOpen(false)
            setQuestionToDelete(null)
            // Refresh list
            fetchQuestions({ search, ...filters }, sort, { page, perPage: 20 })
                .then(({ questions, total }) => {
                    setQuestions(questions)
                    setTotal(total)
                })
        } else {
            alert(result.error)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return

        if (!confirm(`Delete ${selectedIds.length} questions?`)) return

        const result = await bulkDeleteQuestions(selectedIds)

        if (result.success) {
            alert(`Deleted ${result.deletedCount} questions. ${result.skippedCount} questions were skipped (in use).`)
            setSelectedIds([])
            // Refresh list
            fetchQuestions({ search, ...filters }, sort, { page, perPage: 20 })
                .then(({ questions, total }) => {
                    setQuestions(questions)
                    setTotal(total)
                })
        } else {
            alert(result.error)
        }
    }

    const handleBulkExport = () => {
        const selectedQuestions = questions.filter(q => selectedIds.includes(q.id))
        exportQuestionsToExcel(selectedQuestions.map(q => ({
            ...q,
            category_name: q.question_categories?.name,
            usage_count: q.question_usage_stats?.times_attempted || 0
        })))
    }

    const handleSelect = (id: string, selected: boolean) => {
        setSelectedIds(prev =>
            selected ? [...prev, id] : prev.filter(i => i !== id)
        )
    }

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSort({ field: field as any, direction })
    }

    const handleExportFiltered = async () => {
        try {
            await exportFilteredQuestions({ search, ...filters })
        } catch (error) {
            alert('Export failed. Please try again.')
        }
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
                        <QuestionListSkeleton />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Button
                                onClick={() => router.push('/admin/dashboard')}
                                variant="outline"
                                className="mb-4 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                            >
                                <ArrowLeft className="mr-2" size={18} />
                                Back to Admin
                            </Button>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Question Management
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {total} total questions
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleExportFiltered}
                                variant="outline"
                                className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                            >
                                <Download className="mr-2" size={20} />
                                Export All
                            </Button>
                            <Button
                                onClick={() => router.push('/admin/questions/create')}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            >
                                <Plus className="mr-2" size={20} />
                                Add Question
                            </Button>
                        </div>
                    </div>

                    {/* Search, Filters, and Sort */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <SearchBar onSearch={setSearch} initialValue={search} />
                        </div>
                        <FilterPanel
                            categories={categories}
                            onFilterChange={setFilters}
                        />
                        <SortDropdown
                            onSortChange={handleSortChange}
                            currentField={sort.field}
                            currentDirection={sort.direction}
                        />
                    </div>

                    {/* Questions List */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {questions.length === 0 ? (
                            <EmptyState
                                title="No questions found"
                                description="Try adjusting your filters or search terms, or create a new question to get started."
                                actionLabel="Add Question"
                                onAction={() => router.push('/admin/questions/create')}
                            />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {questions.map((q: any) => (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        onDelete={handleDelete}
                                        onSelect={handleSelect}
                                        isSelected={selectedIds.includes(q.id)}
                                        showCheckbox={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bulk Actions Bar */}
                    <BulkActionsBar
                        selectedCount={selectedIds.length}
                        onDelete={handleBulkDelete}
                        onExport={handleBulkExport}
                        onClear={() => setSelectedIds([])}
                    />

                    {/* Delete Modal */}
                    <DeleteConfirmModal
                        isOpen={deleteModalOpen}
                        onClose={() => {
                            setDeleteModalOpen(false)
                            setQuestionToDelete(null)
                        }}
                        onConfirm={confirmDelete}
                        question={questionToDelete}
                        isLoading={isDeleting}
                    />

                    {/* Pagination */}
                    {total > 20 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {page} of {Math.ceil(total / 20)}
                            </span>
                            <Button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / 20)}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
