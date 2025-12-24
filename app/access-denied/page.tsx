// ============================================================================
// Access Denied Page
// ============================================================================
// Shown when user tries to access unauthorized resources
// ============================================================================

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg
                        className="h-8 w-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Access Denied</h2>
                    <p className="mt-4 text-gray-600">
                        You don't have permission to access this resource.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link href="/dashboard">
                        <Button className="w-full">Go to Dashboard</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Go to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
