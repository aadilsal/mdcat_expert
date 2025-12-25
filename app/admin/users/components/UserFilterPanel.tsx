'use client'

// ============================================================================
// User Filter Panel Component
// ============================================================================

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'

export function UserFilterPanel() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)

    const currentRole = searchParams.get('role') || ''
    const currentStatus = searchParams.get('status') || ''

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('role')
        params.delete('status')
        params.delete('dateFrom')
        params.delete('dateTo')
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    const activeFilterCount = [currentRole, currentStatus].filter(Boolean).length

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

                    {/* Role Filter */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                        <div className="space-y-2">
                            {['', 'admin', 'user'].map((role) => (
                                <label key={role} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        checked={currentRole === role}
                                        onChange={() => updateFilter('role', role)}
                                        className="border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">
                                        {role || 'All Roles'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                        <div className="space-y-2">
                            {['', 'active', 'suspended'].map((status) => (
                                <label key={status} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={currentStatus === status}
                                        onChange={() => updateFilter('status', status)}
                                        className="border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">
                                        {status || 'All Statuses'}
                                    </span>
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
