'use client'

// ============================================================================
// Reset Password Page
// ============================================================================
// Set new password after clicking reset link
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/auth/validation'
import { AUTH_CONFIG } from '@/lib/auth/config'
import { Button } from '@/components/ui/button'
import { PasswordStrength } from '@/components/auth/PasswordStrength'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isValidToken, setIsValidToken] = useState(false)

    useEffect(() => {
        // Check if we have a valid session (from reset link)
        const checkSession = async () => {
            const supabase = createClient()
            const {
                data: { session },
            } = await supabase.auth.getSession()
            setIsValidToken(!!session)
        }
        checkSession()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate password
        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) {
                setError(error.message)
                return
            }

            // Password updated successfully
            router.push(AUTH_CONFIG.redirects.afterPasswordReset)
        } catch (error) {
            setError('An unexpected error occurred. Please try again.')
            console.error('Password reset error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Button onClick={() => router.push('/forgot-password')}>Request New Link</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Set new password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <PasswordStrength password={password} />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Updating password...' : 'Update password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
