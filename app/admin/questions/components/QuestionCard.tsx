'use client'

// ============================================================================
// Question Card Component
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuestionCardProps {
    question: any
    onDelete?: (id: string) => void
    onSelect?: (id: string, selected: boolean) => void
    isSelected?: boolean
    showCheckbox?: boolean
}

export function QuestionCard({
    question,
    onDelete,
    onSelect,
    isSelected = false,
    showCheckbox = false
}: QuestionCardProps) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/questions/${question.id}`)
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/admin/questions/${question.id}/edit`)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onDelete) {
            onDelete(question.id)
        }
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        if (onSelect) {
            onSelect(question.id, e.target.checked)
        }
    }

    return (
        <div
            className="p-6 hover:bg-gray-50 cursor-pointer transition-colors relative"
            onClick={handleView}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                {showCheckbox && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Question Text */}
                    <p className="text-gray-900 font-medium mb-2 line-clamp-2">
                        {question.question_text || (
                            <span className="text-blue-600 flex items-center gap-2">
                                <span>📷</span> [Image Question]
                            </span>
                        )}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-800 font-medium">
                            {question.question_categories?.name || 'Uncategorized'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${question.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                                question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {question.difficulty_level}
                        </span>
                        <span className="text-gray-700 font-medium">
                            Used {question.question_usage_stats?.times_attempted || 0} times
                        </span>
                        {question.question_usage_stats?.correct_percentage !== undefined && (
                            <span className="text-gray-700 font-medium">
                                {question.question_usage_stats.correct_percentage.toFixed(0)}% correct
                            </span>
                        )}
                    </div>
                </div>

                {/* Date and Actions */}
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 text-right">
                        {new Date(question.created_at).toLocaleDateString()}
                    </div>

                    {/* Action Buttons (shown on hover) */}
                    {isHovered && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleView}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                title="View"
                            >
                                <Eye size={16} />
                            </Button>
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
