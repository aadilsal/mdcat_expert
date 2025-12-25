'use client'

// ============================================================================
// Admin Upload Page
// ============================================================================
// Main interface for bulk question upload via Excel
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExcelUploadZone } from '@/components/admin/ExcelUploadZone'
import { UploadProgressTracker } from '@/components/admin/UploadProgressTracker'
import { ErrorTable } from '@/components/admin/ErrorTable'
import { PreviewTable } from '@/components/admin/PreviewTable'
import { parseExcelFile, generateExcelTemplate } from '@/lib/excel/parser'
import { validateFile } from '@/lib/excel/validation'
import { createClient } from '@/lib/supabase/client'
import {
    ParsedExcelData,
    UploadProgress,
    UploadResult,
    ValidationError,
} from '@/types'
import { Download, Upload, ArrowLeft } from 'lucide-react'
import { useRequireAuth } from '@/lib/auth/hooks/useRequireAuth'

export default function UploadPage() {
    const auth = useRequireAuth({ requireEmailVerification: true })
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null)
    const [progress, setProgress] = useState<UploadProgress | null>(null)
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const [fileErrors, setFileErrors] = useState<ValidationError[]>([])

    // Redirect if not admin
    if (!auth.isLoading && auth.role !== 'admin') {
        router.push('/dashboard')
        return null
    }

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file)
        setParsedData(null)
        setUploadResult(null)
        setFileErrors([])

        // Validate file
        const errors = validateFile(file)
        if (errors.length > 0) {
            setFileErrors(errors)
            return
        }

        // Parse file
        try {
            setProgress({
                stage: 'parsing',
                progress: 10,
                message: 'Reading Excel file...',
            })

            const supabase = createClient()
            const { data: categories } = await supabase
                .from('question_categories')
                .select('name')

            const categoryNames = categories?.map((c) => c.name) || []

            const data = await parseExcelFile(file, categoryNames)
            setParsedData(data)

            setProgress({
                stage: 'validating',
                progress: 100,
                message: `Parsed ${data.validRows} valid rows`,
            })
        } catch (error) {
            setProgress({
                stage: 'error',
                progress: 0,
                message: error instanceof Error ? error.message : 'Parsing failed',
            })
        }
    }

    const handleUpload = async () => {
        if (!parsedData || !selectedFile) return

        try {
            setProgress({
                stage: 'uploading',
                progress: 0,
                message: 'Uploading questions...',
                processedRows: 0,
                totalRows: parsedData.validRows,
            })

            const response = await fetch('/api/admin/upload/bulk-insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questions: parsedData.rows,
                    fileName: selectedFile.name,
                }),
            })

            const result: UploadResult = await response.json()
            setUploadResult(result)

            if (result.success) {
                setProgress({
                    stage: 'complete',
                    progress: 100,
                    message: `Successfully uploaded ${result.successCount} questions!`,
                })
            } else {
                setProgress({
                    stage: 'error',
                    progress: 0,
                    message: 'Upload failed',
                })
            }
        } catch (error) {
            setProgress({
                stage: 'error',
                progress: 0,
                message: 'Upload failed',
            })
        }
    }

    const handleReset = () => {
        setSelectedFile(null)
        setParsedData(null)
        setProgress(null)
        setUploadResult(null)
        setFileErrors([])
    }

    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-700 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Button
                                onClick={() => router.push('/admin/dashboard')}
                                variant="outline"
                                className="mb-4 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                            >
                                <ArrowLeft className="mr-2" size={18} />
                                Back to Admin
                            </Button>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Bulk Question Upload
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Upload Excel files to import questions in bulk
                            </p>
                        </div>
                        <Button
                            onClick={generateExcelTemplate}
                            variant="outline"
                            className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                        >
                            <Download className="mr-2" size={18} />
                            Download Template
                        </Button>
                    </div>

                    {/* Upload Zone */}
                    {!uploadResult && (
                        <div className="mb-8">
                            <ExcelUploadZone
                                onFileSelect={handleFileSelect}
                                disabled={progress?.stage === 'uploading'}
                            />
                        </div>
                    )}

                    {/* File Errors */}
                    {fileErrors.length > 0 && (
                        <div className="mb-8">
                            <ErrorTable errors={fileErrors} />
                        </div>
                    )}

                    {/* Progress */}
                    {progress && (
                        <div className="mb-8">
                            <UploadProgressTracker progress={progress} />
                        </div>
                    )}

                    {/* Validation Errors */}
                    {parsedData && parsedData.invalidRows.length > 0 && (
                        <div className="mb-8">
                            <ErrorTable errors={parsedData.invalidRows} />
                        </div>
                    )}

                    {/* Preview */}
                    {parsedData && parsedData.validRows > 0 && !uploadResult && (
                        <div className="mb-8">
                            <PreviewTable questions={parsedData.rows} />
                        </div>
                    )}

                    {/* Upload Button */}
                    {parsedData && parsedData.validRows > 0 && !uploadResult && (
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50 px-8 py-6 text-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={progress?.stage === 'uploading'}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 text-lg hover:from-purple-700 hover:to-pink-700"
                            >
                                <Upload className="mr-2" size={20} />
                                Upload {parsedData.validRows} Questions
                            </Button>
                        </div>
                    )}

                    {/* Upload Result */}
                    {uploadResult && (
                        <div
                            className={`p-6 rounded-2xl ${uploadResult.success
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-red-50 border-2 border-red-200'
                                }`}
                        >
                            <h3
                                className={`text-xl font-bold mb-4 ${uploadResult.success
                                    ? 'text-green-900'
                                    : 'text-red-900'
                                    }`}
                            >
                                {uploadResult.success
                                    ? '✓ Upload Successful!'
                                    : '✗ Upload Failed'}
                            </h3>

                            {/* Quiz Info */}
                            {uploadResult.quizTitle && (
                                <div className="bg-white rounded-lg p-4 mb-4 border border-green-300">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                        Created Quiz:
                                    </p>
                                    <p className="text-lg font-bold text-purple-600">
                                        {uploadResult.quizTitle}
                                    </p>
                                    {uploadResult.quizId && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Quiz ID: {uploadResult.quizId}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="text-sm space-y-2 mb-6">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Total Rows:</span>{' '}
                                    {uploadResult.totalRows}
                                </p>
                                <p className="text-green-700">
                                    <span className="font-semibold">Success:</span>{' '}
                                    {uploadResult.successCount}
                                </p>
                                {uploadResult.failureCount > 0 && (
                                    <p className="text-red-700">
                                        <span className="font-semibold">Failed:</span>{' '}
                                        {uploadResult.failureCount}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleReset}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                    Upload Another File
                                </Button>
                                {uploadResult.quizId && (
                                    <Button
                                        onClick={() => router.push(`/quiz/start/${uploadResult.quizId}`)}
                                        variant="outline"
                                        className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                                    >
                                        View Quiz
                                    </Button>
                                )}
                                <Button
                                    onClick={() => router.push('/admin/questions')}
                                    variant="outline"
                                    className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                                >
                                    View Questions
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
