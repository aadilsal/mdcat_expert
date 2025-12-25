'use client'

// ============================================================================
// Filter Panel Component
// ============================================================================

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import type { QuestionCategory } from '@/types'

interface FilterPanelProps {
    categories: QuestionCategory[]
    onFilterChange: (filters: {
        categories: string[]
        difficulties: string[]
        questionType: 'all' | 'text' | 'image'
    }) => void
}

export function FilterPanel({ categories, onFilterChange }: FilterPanelProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
    const [questionType, setQuestionType] = useState<'all' | 'text' | 'image'>('all')
    const [isOpen, setIsOpen] = useState(false)

    const difficulties = ['easy', 'medium', 'hard']

    const handleCategoryToggle = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId]

        setSelectedCategories(newCategories)
        onFilterChange({
            categories: newCategories,
            difficulties: selectedDifficulties,
            questionType
        })
    }

    const handleDifficultyToggle = (difficulty: string) => {
        const newDifficulties = selectedDifficulties.includes(difficulty)
            ? selectedDifficulties.filter(d => d !== difficulty)
            : [...selectedDifficulties, difficulty]

        setSelectedDifficulties(newDifficulties)
        onFilterChange({
            categories: selectedCategories,
            difficulties: newDifficulties,
            questionType
        })
    }

    const handleTypeChange = (type: 'all' | 'text' | 'image') => {
        setQuestionType(type)
        onFilterChange({
            categories: selectedCategories,
            difficulties: selectedDifficulties,
            questionType: type
        })
    }

    const clearFilters = () => {
        setSelectedCategories([])
        setSelectedDifficulties([])
        setQuestionType('all')
        onFilterChange({ categories: [], difficulties: [], questionType: 'all' })
    }

    const activeFilterCount = selectedCategories.length + selectedDifficulties.length + (questionType !== 'all' ? 1 : 0)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium"
            >
                <Filter size={20} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                        <div className="space-y-2">
                            {categories.map(category => (
                                <label key={category.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryToggle(category.id)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h4>
                        <div className="space-y-2">
                            {difficulties.map(difficulty => (
                                <label key={difficulty} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedDifficulties.includes(difficulty)}
                                        onChange={() => handleDifficultyToggle(difficulty)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">{difficulty}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question Type */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Question Type</h4>
                        <div className="space-y-2">
                            {(['all', 'text', 'image'] as const).map(type => (
                                <label key={type} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="questionType"
                                        checked={questionType === type}
                                        onChange={() => handleTypeChange(type)}
                                        className="border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
