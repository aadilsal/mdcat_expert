'use client'

// ============================================================================
// Error Table Component
// ============================================================================
// Displays validation errors in a structured table format
// ============================================================================

import { ValidationError } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface ErrorTableProps {
    errors: ValidationError[]
}

export function ErrorTable({ errors }: ErrorTableProps) {
    if (errors.length === 0) return null

    return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">
                    Validation Errors ({errors.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-red-200">
                            <th className="text-left py-2 px-4 font-semibold text-red-900">
                                Row
                            </th>
                            <th className="text-left py-2 px-4 font-semibold text-red-900">
                                Field
                            </th>
                            <th className="text-left py-2 px-4 font-semibold text-red-900">
                                Error
                            </th>
                            <th className="text-left py-2 px-4 font-semibold text-red-900">
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {errors.map((error, index) => (
                            <tr key={index} className="border-b border-red-100">
                                <td className="py-2 px-4 text-red-800">
                                    {error.row || '-'}
                                </td>
                                <td className="py-2 px-4 text-red-800 font-mono text-xs">
                                    {error.field}
                                </td>
                                <td className="py-2 px-4 text-red-700">
                                    {error.message}
                                </td>
                                <td className="py-2 px-4 text-red-600 font-mono text-xs">
                                    {error.value || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
