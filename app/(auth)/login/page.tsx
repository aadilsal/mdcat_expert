'use client'

// ============================================================================
// Login Page
// ============================================================================
// User login with email/password and "Remember Me" functionality
// ============================================================================

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateLoginForm, type LoginFormData, type LoginFormErrors } from '@/lib/auth/validation'
import { AUTH_CONFIG } from '@/lib/auth/config'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })
    const [rememberMe, setRememberMe] = useState(false)
    const [errors, setErrors] = useState<LoginFormErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
        setServerError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)

        // Client-side validation
        const validationErrors = validateLoginForm(formData)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()

            // Sign in user
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (error) {
                // Generic error message to prevent user enumeration
                setServerError('Invalid email or password')
                return
            }

            if (data.user) {
                // Check email verification
                if (AUTH_CONFIG.emailVerification.required && !data.user.email_confirmed_at) {
                    router.push('/verify-email')
                    return
                }

                // Redirect to dashboard
                router.push(AUTH_CONFIG.redirects.afterLogin)
            }
        } catch (error) {
            setServerError('An unexpected error occurred. Please try again.')
            console.error('Login error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            Create one now
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Server Error */}
                    {serverError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{serverError}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email */}
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
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/forgot-password"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
