// ============================================================================
// Animation Utilities - Framer Motion Variants
// ============================================================================
// Reusable animation variants for consistent animations across the landing page
// ============================================================================

import { Variants } from 'framer-motion'

// ============================================================================
// Fade In Animations
// ============================================================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

// ============================================================================
// Slide Animations
// ============================================================================

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

// ============================================================================
// Scale Animations
// ============================================================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
}

// ============================================================================
// Stagger Container
// ============================================================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
}

// ============================================================================
// Button Animations
// ============================================================================

export const buttonHover = {
    scale: 1.05,
    transition: {
        duration: 0.2,
        ease: 'easeInOut',
    },
}

export const buttonTap = {
    scale: 0.95,
}

// ============================================================================
// Card Hover Effect
// ============================================================================

export const cardHover = {
    y: -8,
    transition: {
        duration: 0.3,
        ease: 'easeOut',
    },
}

// ============================================================================
// Viewport Options for Scroll Animations
// ============================================================================

export const viewportOptions = {
    once: true,
    amount: 0.3,
    margin: '0px 0px -100px 0px',
}

// ============================================================================
// Reduced Motion Support
// ============================================================================

export function getReducedMotionVariants(variants: Variants): Variants {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Return variants without animations
        return {
            hidden: { opacity: 1 },
            visible: { opacity: 1 },
        }
    }
    return variants
}
