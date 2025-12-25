'use client'

// ============================================================================
// Sort Dropdown Component
// ============================================================================

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SortDropdownProps {
    onSortChange: (field: string, direction: 'asc' | 'desc') => void
    currentField?: string
    currentDirection?: 'asc' | 'desc'
}

export function SortDropdown({
    onSortChange,
    currentField = 'created_at',
    currentDirection = 'desc'
}: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    const sortOptions = [
        { value: 'created_at', label: 'Date Created' },
        { value: 'difficulty_level', label: 'Difficulty' },
        { value: 'category_name', label: 'Category' },
        { value: 'usage_count', label: 'Usage Count' }
    ]

    const handleSort = (field: string) => {
        // If clicking the same field, toggle direction
        if (field === currentField) {
            onSortChange(field, currentDirection === 'asc' ? 'desc' : 'asc')
        } else {
            // New field, default to descending
            onSortChange(field, 'desc')
        }
        setIsOpen(false)
    }

    const currentLabel = sortOptions.find(opt => opt.value === currentField)?.label || 'Sort'

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
            >
                {currentDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {currentLabel}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSort(option.value)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between ${option.value === currentField ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                }`}
                        >
                            <span>{option.label}</span>
                            {option.value === currentField && (
                                currentDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
