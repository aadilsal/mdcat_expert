// ============================================================================
// User Export Utility
// ============================================================================

import * as XLSX from 'xlsx'

export interface ExportUser {
    id: string
    name: string
    email: string
    role: string
    created_at: string
    user_suspensions?: any[]
    stats?: any
}

export function exportUsersToExcel(users: ExportUser[], filename?: string) {
    const data = users.map((u, index) => ({
        '#': index + 1,
        'Name': u.name,
        'Email': u.email,
        'Role': u.role,
        'Status': u.user_suspensions?.some((s: any) => s.is_active) ? 'Suspended' : 'Active',
        'Total Quizzes': u.stats?.total_quizzes || 0,
        'Avg Score': u.stats?.avg_score?.toFixed(1) || '0.0',
        'Accuracy %': u.stats?.avg_accuracy?.toFixed(1) || '0.0',
        'Login Count': u.stats?.login_count || 0,
        'Last Login': u.stats?.last_login
            ? new Date(u.stats.last_login).toLocaleDateString()
            : 'Never',
        'Last Quiz': u.stats?.last_quiz_date
            ? new Date(u.stats.last_quiz_date).toLocaleDateString()
            : 'Never',
        'Joined': new Date(u.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(data)

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 10 }, // Role
        { wch: 12 }, // Status
        { wch: 12 }, // Total Quizzes
        { wch: 10 }, // Avg Score
        { wch: 12 }, // Accuracy %
        { wch: 12 }, // Login Count
        { wch: 15 }, // Last Login
        { wch: 15 }, // Last Quiz
        { wch: 15 }, // Joined
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')

    const exportFilename = filename || `users_export_${Date.now()}.xlsx`
    XLSX.writeFile(wb, exportFilename)

    return {
        success: true,
        filename: exportFilename,
        count: users.length
    }
}

export async function exportUsersFromApi(filters: any) {
    const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_export_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
}
