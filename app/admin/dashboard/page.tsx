'use client'

// ============================================================================
// Admin Dashboard Page
// ============================================================================
// Central hub for admin operations
// ============================================================================

import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/hooks/useRequireAuth'
import { Button } from '@/components/ui/button'
import {
    Upload,
    Users,
    BookOpen,
    BarChart3,
    ArrowLeft,
} from 'lucide-react'

export default function AdminDashboardPage() {
    const auth = useRequireAuth({ requireEmailVerification: true })
    const router = useRouter()

    // Redirect if not admin
    if (!auth.isLoading && auth.role !== 'admin') {
        router.push('/dashboard')
        return null
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

    const adminCards = [
        {
            title: 'Bulk Upload',
            description: 'Upload questions via Excel file (auto-creates quiz)',
            icon: Upload,
            href: '/admin/upload',
            color: 'from-purple-600 to-pink-600',
        },
        {
            title: 'Add Question',
            description: 'Add individual questions to quizzes',
            icon: BookOpen,
            href: '/admin/questions/add',
            color: 'from-indigo-600 to-purple-600',
        },
        {
            title: 'Manage Questions',
            description: 'View and edit all questions',
            icon: BookOpen,
            href: '/admin/questions',
            color: 'from-blue-600 to-cyan-600',
        },
        {
            title: 'Manage Users',
            description: 'View and manage user accounts',
            icon: Users,
            href: '/admin/users',
            color: 'from-green-600 to-emerald-600',
        },
        {
            title: 'Analytics',
            description: 'View platform analytics',
            icon: BarChart3,
            href: '/admin/analytics',
            color: 'from-orange-600 to-red-600',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="mb-4 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2" size={18} />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage questions, users, and platform settings
                        </p>
                    </div>

                    {/* Admin Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {adminCards.map((card) => (
                            <div
                                key={card.href}
                                onClick={() => router.push(card.href)}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                    >
                                        <card.icon className="text-white" size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {card.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
