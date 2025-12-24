'use client'

// ============================================================================
// Email Verification Page
// ============================================================================
// Email verification status and resend functionality
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resendVerificationEmail } from '@/lib/auth/session'
import { AUTH_CONFIG } from '@/lib/auth/config'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
    const router = useRouter()
    const [email, setEmail] = useState<string | null>(null)
    const [isVerified, setIsVerified] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendMessage, setResendMessage] = useState<string | null>(null)

    useEffect(() => {
        checkVerificationStatus()
    }, [])

    async function checkVerificationStatus() {
        const supabase = createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        setEmail(user.email || null)
        setIsVerified(user.email_confirmed_at !== null)

        // If already verified, redirect to dashboard
        if (user.email_confirmed_at) {
            setTimeout(() => {
                router.push(AUTH_CONFIG.redirects.afterLogin)
            }, 2000)
        }
    }

    async function handleResend() {
        setIsResending(true)
        setResendMessage(null)

        const { error } = await resendVerificationEmail()

        if (error) {
            setResendMessage('Failed to resend email. Please try again.')
        } else {
            setResendMessage('Verification email sent! Check your inbox.')
        }

        setIsResending(false)
    }

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                    <p className="text-gray-600">
                        Your email has been verified. Redirecting to dashboard...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Verify your email</h2>
                    <p className="mt-4 text-sm text-gray-600">
                        We've sent a verification email to:
                    </p>
                    <p className="mt-2 text-base font-medium text-gray-900">{email}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                        Click the link in the email to verify your account. You may need to check your spam
                        folder.
                    </p>
                </div>

                {resendMessage && (
                    <div
                        className={`rounded-md p-4 ${resendMessage.includes('sent')
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                    >
                        <p className="text-sm">{resendMessage}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        onClick={handleResend}
                        disabled={isResending}
                        variant="outline"
                        className="w-full"
                    >
                        {isResending ? 'Sending...' : 'Resend verification email'}
                    </Button>

                    <Button onClick={() => router.push('/login')} variant="ghost" className="w-full">
                        Back to login
                    </Button>
                </div>
            </div>
        </div>
    )
}
