'use client'

// ============================================================================
// Segment Builder Component
// ============================================================================

import { useState, useEffect } from 'react'
import { Filter, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchUserSegments, saveUserSegment } from '@/lib/admin/users/queries'

interface SegmentBuilderProps {
    adminId: string
    onApplySegment: (filters: any) => void
}

export function SegmentBuilder({ adminId, onApplySegment }: SegmentBuilderProps) {
    const [segments, setSegments] = useState<any[]>([])
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [segmentName, setSegmentName] = useState('')
    const [segmentDescription, setSegmentDescription] = useState('')
    const [currentFilters, setCurrentFilters] = useState<any>({})

    useEffect(() => {
        loadSegments()
    }, [adminId])

    const loadSegments = async () => {
        try {
            const data = await fetchUserSegments(adminId)
            setSegments(data || [])
        } catch (error) {
            console.error('Error loading segments:', error)
        }
    }

    const handleSaveSegment = async () => {
        if (!segmentName.trim()) {
            alert('Please enter a segment name')
            return
        }

        try {
            await saveUserSegment(segmentName, segmentDescription, currentFilters, adminId)
            setShowSaveModal(false)
            setSegmentName('')
            setSegmentDescription('')
            loadSegments()
        } catch (error) {
            console.error('Error saving segment:', error)
            alert('Failed to save segment')
        }
    }

    const predefinedSegments = [
        {
            name: 'High Performers',
            description: 'Users with >80% average score',
            filters: { minScore: 80 }
        },
        {
            name: 'Inactive Users',
            description: 'No login in last 30 days',
            filters: { inactiveDays: 30 }
        },
        {
            name: 'New Users',
            description: 'Joined in last 7 days',
            filters: { newUserDays: 7 }
        },
        {
            name: 'At-Risk Users',
            description: 'Score <50% or no recent activity',
            filters: { maxScore: 50, inactiveDays: 14 }
        }
    ]

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">User Segments</h3>
            </div>

            {/* Predefined Segments */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Segments</h4>
                <div className="grid grid-cols-2 gap-3">
                    {predefinedSegments.map((segment) => (
                        <button
                            key={segment.name}
                            onClick={() => onApplySegment(segment.filters)}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 text-left transition-colors"
                        >
                            <div className="font-medium text-gray-900 text-sm">{segment.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{segment.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Saved Segments */}
            {segments.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Saved Segments</h4>
                    <div className="space-y-2">
                        {segments.map((segment) => (
                            <div
                                key={segment.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">{segment.name}</div>
                                    {segment.description && (
                                        <div className="text-xs text-gray-600 mt-1">{segment.description}</div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => onApplySegment(segment.filter_criteria)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Apply
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Current Filters */}
            <Button
                onClick={() => setShowSaveModal(true)}
                variant="outline"
                className="w-full"
            >
                <Save className="mr-2" size={16} />
                Save Current Filters as Segment
            </Button>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Save Segment</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Segment Name *
                            </label>
                            <input
                                type="text"
                                value={segmentName}
                                onChange={(e) => setSegmentName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., Active Premium Users"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={segmentDescription}
                                onChange={(e) => setSegmentDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Optional description..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowSaveModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveSegment}
                                className="flex-1 bg-purple-600 text-white"
                            >
                                Save Segment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
