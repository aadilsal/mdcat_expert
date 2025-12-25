// ============================================================================
// Churn Export Utility
// ============================================================================

import * as XLSX from 'xlsx'

export interface ChurnExportData {
    users: Array<{
        name: string
        email: string
        riskLevel: string
        churnProbability: number
        engagementScore: number
        recencyScore: number
        frequencyScore: number
        performanceScore: number
        daysSinceLastLogin: number
        daysSinceLastQuiz: number
        loginCount7d: number
        quizCount7d: number
        avgScore7d: number
        lastCalculated: string
    }>
}

export function exportChurnDataToExcel(data: ChurnExportData, filename?: string) {
    const exportData = data.users.map((u, index) => ({
        '#': index + 1,
        'Name': u.name,
        'Email': u.email,
        'Risk Level': u.riskLevel.toUpperCase(),
        'Churn Probability %': u.churnProbability,
        'Engagement Score': u.engagementScore,
        'Recency Score': u.recencyScore,
        'Frequency Score': u.frequencyScore,
        'Performance Score': u.performanceScore,
        'Days Since Login': u.daysSinceLastLogin,
        'Days Since Quiz': u.daysSinceLastQuiz,
        'Logins (7d)': u.loginCount7d,
        'Quizzes (7d)': u.quizCount7d,
        'Avg Score (7d)': u.avgScore7d.toFixed(1),
        'Last Updated': new Date(u.lastCalculated).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 12 }, // Risk Level
        { wch: 18 }, // Churn Probability
        { wch: 16 }, // Engagement Score
        { wch: 14 }, // Recency Score
        { wch: 15 }, // Frequency Score
        { wch: 17 }, // Performance Score
        { wch: 16 }, // Days Since Login
        { wch: 16 }, // Days Since Quiz
        { wch: 12 }, // Logins (7d)
        { wch: 13 }, // Quizzes (7d)
        { wch: 14 }, // Avg Score (7d)
        { wch: 15 }, // Last Updated
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Churn Analysis')

    const exportFilename = filename || `churn_analysis_${Date.now()}.xlsx`
    XLSX.writeFile(wb, exportFilename)

    return {
        success: true,
        filename: exportFilename,
        count: data.users.length
    }
}
