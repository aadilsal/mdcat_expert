// ============================================================================
// Auth Validation Utilities
// ============================================================================
// Client and server-side validation for authentication
// ============================================================================

import { AUTH_CONFIG } from './config'

// ============================================================================
// Email Validation
// ============================================================================

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validateEmail(email: string): string | null {
    if (!email) {
        return 'Email is required'
    }
    if (!isValidEmail(email)) {
        return 'Please enter a valid email address'
    }
    return null
}

// ============================================================================
// Password Validation
// ============================================================================

export interface PasswordStrength {
    score: number // 0-4
    feedback: string[]
    isValid: boolean
}

export function validatePassword(password: string): string | null {
    const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar } =
        AUTH_CONFIG.password

    if (!password) {
        return 'Password is required'
    }

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long`
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter'
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter'
    }

    if (requireNumber && !/\d/.test(password)) {
        return 'Password must contain at least one number'
    }

    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain at least one special character'
    }

    return null
}

export function getPasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = []
    let score = 0

    if (!password) {
        return { score: 0, feedback: ['Password is required'], isValid: false }
    }

    // Length check
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    else feedback.push('Use 12+ characters for better security')

    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++
    } else {
        feedback.push('Include both uppercase and lowercase letters')
    }

    if (/\d/.test(password)) {
        score++
    } else {
        feedback.push('Include at least one number')
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score++
    } else {
        feedback.push('Include at least one special character')
    }

    // Common patterns (weak)
    const commonPatterns = ['password', '12345', 'qwerty', 'abc123']
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        score = Math.max(0, score - 2)
        feedback.push('Avoid common patterns')
    }

    const isValid = validatePassword(password) === null

    return {
        score: Math.min(4, score),
        feedback,
        isValid,
    }
}

// ============================================================================
// Name Validation
// ============================================================================

export function validateFullName(name: string): string | null {
    if (!name || name.trim().length === 0) {
        return 'Full name is required'
    }

    if (name.trim().length < 2) {
        return 'Full name must be at least 2 characters'
    }

    if (name.trim().length > 100) {
        return 'Full name must be less than 100 characters'
    }

    return null
}

// ============================================================================
// Password Confirmation
// ============================================================================

export function validatePasswordConfirmation(
    password: string,
    confirmPassword: string
): string | null {
    if (!confirmPassword) {
        return 'Please confirm your password'
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match'
    }

    return null
}

// ============================================================================
// Form Validation
// ============================================================================

export interface SignupFormData {
    fullName: string
    email: string
    password: string
    confirmPassword: string
}

export interface SignupFormErrors {
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
}

export function validateSignupForm(data: SignupFormData): SignupFormErrors {
    const errors: SignupFormErrors = {}

    const nameError = validateFullName(data.fullName)
    if (nameError) errors.fullName = nameError

    const emailError = validateEmail(data.email)
    if (emailError) errors.email = emailError

    const passwordError = validatePassword(data.password)
    if (passwordError) errors.password = passwordError

    const confirmError = validatePasswordConfirmation(data.password, data.confirmPassword)
    if (confirmError) errors.confirmPassword = confirmError

    return errors
}

export interface LoginFormData {
    email: string
    password: string
}

export interface LoginFormErrors {
    email?: string
    password?: string
}

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
    const errors: LoginFormErrors = {}

    const emailError = validateEmail(data.email)
    if (emailError) errors.email = emailError

    if (!data.password) {
        errors.password = 'Password is required'
    }

    return errors
}
