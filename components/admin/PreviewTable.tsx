'use client'

// ============================================================================
// Preview Table Component
// ============================================================================
// Displays preview of parsed questions before upload
// ============================================================================

import { ExcelQuestionRow } from '@/types'

interface PreviewTableProps {
    questions: ExcelQuestionRow[]
    maxRows?: number
}

export function PreviewTable({ questions, maxRows = 10 }: PreviewTableProps) {
    const displayQuestions = questions.slice(0, maxRows)

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Preview ({questions.length} questions)
                </h3>
                {questions.length > maxRows && (
                    <p className="text-sm text-gray-600 mt-1">
                        Showing first {maxRows} rows
                    </p>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Question
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Options
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Answer
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Category
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Difficulty
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayQuestions.map((q, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 px-4 max-w-xs truncate text-gray-900">
                                    {q.question_text || (
                                        <span className="text-blue-600 text-xs">
                                            [Image]
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="text-xs space-y-1 text-gray-900">
                                        <div>A: {q.option_a}</div>
                                        <div>B: {q.option_b}</div>
                                        <div>C: {q.option_c}</div>
                                        <div>D: {q.option_d}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-green-600">
                                    {q.correct_option}
                                </td>
                                <td className="py-3 px-4 text-gray-900">{q.category}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${q.difficulty_level === 'easy'
                                            ? 'bg-green-100 text-green-700'
                                            : q.difficulty_level === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {q.difficulty_level}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
