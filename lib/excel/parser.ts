// ============================================================================
// Excel Upload - Parser Utilities
// ============================================================================
// Excel file parsing and template generation
// ============================================================================

import * as XLSX from 'xlsx'
import { ParsedExcelData, ExcelQuestionRow, ValidationError } from '@/types'
import { validateQuestionRow, sanitizeRow } from './validation'

const REQUIRED_COLUMNS = [
    'question_text',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_option',
    'category',
    'difficulty_level',
]

/**
 * Parses Excel file and validates data
 */
export async function parseExcelFile(
    file: File,
    categories: string[]
): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })

                // Get first sheet
                const sheetName = workbook.SheetNames[0]
                if (!sheetName) {
                    reject(new Error('No sheets found in Excel file'))
                    return
                }

                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: '',
                    raw: false,
                })

                // Validate columns
                if (jsonData.length === 0) {
                    reject(new Error('Excel file is empty'))
                    return
                }

                const firstRow = jsonData[0] as any
                const columns = Object.keys(firstRow).map((col) =>
                    col.toLowerCase().trim()
                )

                const missingColumns = REQUIRED_COLUMNS.filter(
                    (col) => !columns.includes(col)
                )

                if (missingColumns.length > 0) {
                    reject(
                        new Error(
                            `Missing required columns: ${missingColumns.join(', ')}`
                        )
                    )
                    return
                }

                // Parse and validate rows
                const validRows: ExcelQuestionRow[] = []
                const invalidRows: ValidationError[] = []

                jsonData.forEach((row: any, index) => {
                    const rowNumber = index + 2 // Excel row (1-indexed + header)

                    // Normalize column names
                    const normalizedRow: any = {}
                    Object.keys(row).forEach((key) => {
                        normalizedRow[key.toLowerCase().trim()] = row[key]
                    })

                    // Skip empty rows
                    if (
                        !normalizedRow.question_text &&
                        !normalizedRow.question_image_url
                    ) {
                        return
                    }

                    // Validate row
                    const errors = validateQuestionRow(
                        normalizedRow,
                        rowNumber,
                        categories
                    )

                    if (errors.length > 0) {
                        invalidRows.push(...errors)
                    } else {
                        validRows.push(sanitizeRow(normalizedRow))
                    }
                })

                resolve({
                    rows: validRows,
                    totalRows: jsonData.length,
                    validRows: validRows.length,
                    invalidRows,
                })
            } catch (error) {
                reject(error)
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsBinaryString(file)
    })
}

/**
 * Generates Excel template for download
 */
export function generateExcelTemplate(): void {
    const template = [
        {
            question_text: 'What is the powerhouse of the cell?',
            question_image_url: '',
            option_a: 'Nucleus',
            option_b: 'Mitochondria',
            option_c: 'Ribosome',
            option_d: 'Golgi apparatus',
            correct_option: 'B',
            category: 'Biology',
            difficulty_level: 'easy',
            explanation: 'Mitochondria are known as the powerhouse of the cell',
        },
        {
            question_text: 'What is the chemical formula for water?',
            question_image_url: '',
            option_a: 'H2O',
            option_b: 'CO2',
            option_c: 'O2',
            option_d: 'N2',
            correct_option: 'A',
            category: 'Chemistry',
            difficulty_level: 'easy',
            explanation: 'Water consists of two hydrogen atoms and one oxygen atom',
        },
        {
            question_text: 'What is the SI unit of force?',
            question_image_url: '',
            option_a: 'Joule',
            option_b: 'Newton',
            option_c: 'Watt',
            option_d: 'Pascal',
            correct_option: 'B',
            category: 'Physics',
            difficulty_level: 'medium',
            explanation: 'The Newton (N) is the SI unit of force',
        },
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 50 }, // question_text
        { wch: 30 }, // question_image_url
        { wch: 30 }, // option_a
        { wch: 30 }, // option_b
        { wch: 30 }, // option_c
        { wch: 30 }, // option_d
        { wch: 15 }, // correct_option
        { wch: 20 }, // category
        { wch: 15 }, // difficulty_level
        { wch: 50 }, // explanation
    ]

    // Download
    XLSX.writeFile(workbook, 'question_template.xlsx')
}
