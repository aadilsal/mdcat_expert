'use client'

// ============================================================================
// Search Bar Component
// ============================================================================

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
    onSearch: (term: string) => void
    initialValue?: string
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState(initialValue)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, onSearch])

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
        </div>
    )
}
