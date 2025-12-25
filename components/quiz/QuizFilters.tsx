'use client'

// ============================================================================
// QuizFilters Component
// ============================================================================
// Filter controls for quiz selection (category, difficulty, search)
// ============================================================================

import { Search, X } from 'lucide-react'
import type { QuestionCategory, QuizDifficultyLevel } from '@/types'

interface QuizFiltersProps {
    categories: QuestionCategory[]
    selectedCategory: string
    selectedDifficulty: QuizDifficultyLevel | 'all'
    searchQuery: string
    onCategoryChange: (categoryId: string) => void
    onDifficultyChange: (difficulty: QuizDifficultyLevel | 'all') => void
    onSearchChange: (query: string) => void
    onClearFilters: () => void
}

export function QuizFilters({
    categories,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    onCategoryChange,
    onDifficultyChange,
    onSearchChange,
    onClearFilters,
}: QuizFiltersProps) {
    const hasActiveFilters =
        selectedCategory !== 'all' ||
        selectedDifficulty !== 'all' ||
        searchQuery !== ''

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-blue-600">
                    Filter Quizzes
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search quizzes..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Category
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                    <label
                        htmlFor="difficulty"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Difficulty
                    </label>
                    <select
                        id="difficulty"
                        value={selectedDifficulty}
                        onChange={(e) =>
                            onDifficultyChange(
                                e.target.value as QuizDifficultyLevel | 'all'
                            )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
