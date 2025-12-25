'use client'

// ============================================================================
// AnswerOptions Component
// ============================================================================
// Display and handle answer option selection (A-D)
// ============================================================================

import { Check } from 'lucide-react'
import type { QuestionOption } from '@/types'

interface AnswerOptionsProps {
    options: {
        A: string
        B: string
        C: string
        D: string
    }
    selectedOption?: QuestionOption
    onSelect: (option: QuestionOption) => void
    disabled?: boolean
}

export function AnswerOptions({ options, selectedOption, onSelect, disabled = false }: AnswerOptionsProps) {
    const optionKeys: QuestionOption[] = ['A', 'B', 'C', 'D']

    return (
        <div className="space-y-3">
            {optionKeys.map((key) => {
                const isSelected = selectedOption === key

                return (
                    <button
                        key={key}
                        onClick={() => !disabled && onSelect(key)}
                        disabled={disabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-start">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3 ${isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                {isSelected ? <Check className="w-5 h-5" /> : key}
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-gray-900">{options[key]}</p>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
