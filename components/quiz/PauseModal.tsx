'use client'

// ============================================================================
// PauseModal Component
// ============================================================================
// Modal for pausing quiz with confirmation
// ============================================================================

import { Pause, Play, X } from 'lucide-react'

interface PauseModalProps {
    isOpen: boolean
    onResume: () => void
    onExit: () => void
}

export function PauseModal({ isOpen, onResume, onExit }: PauseModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <Pause className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Quiz Paused</h2>
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Your progress has been saved. You can resume the quiz anytime from where you left off.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={onResume}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Resume Quiz
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                    >
                        <X className="w-5 h-5 mr-2" />
                        Exit Quiz
                    </button>
                </div>
            </div>
        </div>
    )
}
