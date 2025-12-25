// ============================================================================
// Excel Upload - Validation Utilities
// ============================================================================
// File and data validation for Excel uploads
// ============================================================================

import { ValidationError, ExcelQuestionRow } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
]
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls']

/**
 * Validates uploaded file for type, size, and extension
 */
export function validateFile(file: File): ValidationError[] {
    const errors: ValidationError[] = []

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
        errors.push({
            row: 0,
            field: 'file',
            message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            value: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push({
            row: 0,
            field: 'file',
            message: 'Invalid file type. Only .xlsx and .xls files are allowed',
            value: file.type,
        })
    }

    // Extension validation
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        errors.push({
            row: 0,
            field: 'file',
            message: 'Invalid file extension',
            value: extension,
        })
    }

    return errors
}

/**
 * Validates individual question row data
 */
export function validateQuestionRow(
    row: any,
    rowNumber: number,
    categories: string[]
): ValidationError[] {
    const errors: ValidationError[] = []

    // Required fields validation
    if (!row.option_a?.trim()) {
        errors.push({
            row: rowNumber,
            field: 'option_a',
            message: 'Option A is required',
        })
    }

    if (!row.option_b?.trim()) {
        errors.push({
            row: rowNumber,
            field: 'option_b',
            message: 'Option B is required',
        })
    }

    if (!row.option_c?.trim()) {
        errors.push({
            row: rowNumber,
            field: 'option_c',
            message: 'Option C is required',
        })
    }

    if (!row.option_d?.trim()) {
        errors.push({
            row: rowNumber,
            field: 'option_d',
            message: 'Option D is required',
        })
    }

    // Question content validation (either text or image required)
    if (!row.question_text?.trim() && !row.question_image_url?.trim()) {
        errors.push({
            row: rowNumber,
            field: 'question_text',
            message: 'Either question text or image URL is required',
        })
    }

    // Correct option validation
    const validOptions = ['A', 'B', 'C', 'D']
    if (!validOptions.includes(row.correct_option?.toUpperCase())) {
        errors.push({
            row: rowNumber,
            field: 'correct_option',
            message: 'Correct option must be A, B, C, or D',
            value: row.correct_option,
        })
    }

    // Category validation
    if (row.category && !categories.includes(row.category)) {
        errors.push({
            row: rowNumber,
            field: 'category',
            message: `Invalid category. Must be one of: ${categories.join(', ')}`,
            value: row.category,
        })
    }

    // Difficulty validation
    const validDifficulties = ['easy', 'medium', 'hard']
    if (
        row.difficulty_level &&
        !validDifficulties.includes(row.difficulty_level.toLowerCase())
    ) {
        errors.push({
            row: rowNumber,
            field: 'difficulty_level',
            message: 'Difficulty must be easy, medium, or hard',
            value: row.difficulty_level,
        })
    }

    return errors
}

/**
 * Sanitizes and normalizes row data
 */
export function sanitizeRow(row: any): ExcelQuestionRow {
    return {
        question_text: row.question_text?.trim() || undefined,
        question_image_url: row.question_image_url?.trim() || undefined,
        option_a: row.option_a?.trim() || '',
        option_b: row.option_b?.trim() || '',
        option_c: row.option_c?.trim() || '',
        option_d: row.option_d?.trim() || '',
        correct_option: row.correct_option?.toUpperCase() as any,
        category: row.category?.trim() || '',
        difficulty_level: row.difficulty_level?.toLowerCase() as any,
        explanation: row.explanation?.trim() || undefined,
    }
}
