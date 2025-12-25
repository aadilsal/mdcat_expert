'use client'

// ============================================================================
// Excel Upload Zone Component
// ============================================================================
// Drag-and-drop file upload interface
// ============================================================================

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet } from 'lucide-react'

interface ExcelUploadZoneProps {
    onFileSelect: (file: File) => void
    disabled?: boolean
}

export function ExcelUploadZone({ onFileSelect, disabled }: ExcelUploadZoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0])
            }
        },
        [onFileSelect]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx',
            ],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1,
        disabled,
    })

    return (
        <div
            {...getRootProps()}
            className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                {isDragActive ? (
                    <FileSpreadsheet className="w-16 h-16 text-purple-500" />
                ) : (
                    <Upload className="w-16 h-16 text-gray-400" />
                )}
                <div>
                    <p className="text-lg font-semibold text-gray-900">
                        {isDragActive
                            ? 'Drop your Excel file here'
                            : 'Drag & drop your Excel file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Supported formats: .xlsx, .xls (Max 10MB)
                    </p>
                </div>
            </div>
        </div>
    )
}
