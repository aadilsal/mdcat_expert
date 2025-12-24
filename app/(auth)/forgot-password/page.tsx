'use client'

// ============================================================================
// Forgot Password Page
// ============================================================================
// Request password reset email
// ============================================================================

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/lib/auth/validation'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate email
        const emailError = validateEmail(email)
        if (emailError) {
            setError(emailError)
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setEmailSent(true)
        } catch (error) {
            setError('An unexpected error occurred. Please try again.')
            console.error('Password reset error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Check your email</h2>
                        <p className="mt-4 text-sm text-gray-600">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            Click the link in the email to reset your password.
                        </p>
                        <div className="mt-6">
                            <Link href="/login">
                                <Button variant="outline">Back to login</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Sending...' : 'Send reset link'}
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-primary hover:text-primary/80">
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
