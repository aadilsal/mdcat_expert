'use client'

// ============================================================================
// Users Listing Page
// ============================================================================

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useAuth'
import { fetchUsers } from '@/lib/admin/users/queries'
import { UserCard } from './components/UserCard'
import { UserSearchBar } from './components/UserSearchBar'
import { UserFilterPanel } from './components/UserFilterPanel'
import { UserListSkeleton } from './components/LoadingSkeleton'
import { ArrowLeft, Download, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportUsersToExcel } from '@/lib/admin/users/export'

export default function UsersPage() {
    const auth = useRequireAuth('admin')
    const router = useRouter()
    const searchParams = useSearchParams()

    const [users, setUsers] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // URL state
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    useEffect(() => {
        if (auth.user) {
            loadUsers()
        }
    }, [page, search, role, status, auth.user])

    const loadUsers = async () => {
        setIsLoading(true)
        try {
            const { data, count } = await fetchUsers({
                page,
                search,
                role,
                status,
                limit: 20
            })
            setUsers(data || [])
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = () => {
        exportUsersToExcel(users)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    const totalPages = Math.ceil(totalCount / 20)

    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-20 bg-gray-200 rounded-lg animate-pulse mb-6" />
                        <UserListSkeleton />
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <UserListSkeleton />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => router.push('/admin/dashboard')}
                                variant="outline"
                                className="border-2 border-gray-800 text-gray-800"
                            >
                                <ArrowLeft className="mr-2" size={20} />
                                Back to Admin
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    User Management
                                </h1>
                                <p className="text-gray-600 mt-2 flex items-center gap-2">
                                    <Users size={18} />
                                    {totalCount} total users
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                        >
                            <Download className="mr-2" size={20} />
                            Export All
                        </Button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-4 mb-6">
                        <UserSearchBar />
                        <UserFilterPanel />
                    </div>

                    {/* Users List */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {users.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No users found
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <UserCard key={user.id} user={user} onUpdate={loadUsers} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
