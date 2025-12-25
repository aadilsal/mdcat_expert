'use client'

// ============================================================================
// Share Results Component
// ============================================================================
// Allows users to share quiz results (privacy-safe)
// ============================================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, CheckCircle, Download } from 'lucide-react'

interface ShareResultsProps {
    sessionId: string
}

export function ShareResults({ sessionId }: ShareResultsProps) {
    const [shareText, setShareText] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateShareText = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/quiz/results/${sessionId}/share`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to generate shareable summary')
            }

            const data = await response.json()
            setShareText(data.share_text)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate share text')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async () => {
        if (!shareText) return

        try {
            await navigator.clipboard.writeText(shareText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
                <Share2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Share Your Results</h2>
            </div>

            <p className="text-gray-600 mb-6">
                Share your quiz performance with friends and colleagues. Your answers and explanations are kept private.
            </p>

            {!shareText ? (
                <button
                    onClick={generateShareText}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Share2 className="w-5 h-5" />
                            Generate Shareable Summary
                        </>
                    )}
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Share Text Preview */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                            {shareText}
                        </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    Copy to Clipboard
                                </>
                            )}
                        </button>

                        <button
                            onClick={generateShareText}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Regenerate
                        </button>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            🔒 <strong>Privacy Protected:</strong> This summary only includes your score and performance metrics. Your answers and AI explanations are not shared.
                        </p>
                    </div>
                </motion.div>
            )}

            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                    {error}
                </div>
            )}
        </div>
    )
}
