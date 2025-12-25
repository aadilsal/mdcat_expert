'use client'

// ============================================================================
// Hero Section Component
// ============================================================================
// Simplified, honest hero section without fake stats
// ============================================================================

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20">
            {/* Simplified Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Content */}
            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div variants={staggerItem} className="inline-block mb-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-white border-2 border-blue-600 text-blue-600 text-sm font-medium shadow-sm">
                            🎓 Try 10 Questions Free
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={staggerItem}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
                    >
                        Ace Your{' '}
                        <span className="text-blue-600">
                            MDCAT
                        </span>{' '}
                        with Confidence
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={staggerItem}
                        className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto"
                    >
                        Practice MDCAT questions with instant feedback. No signup required to try.
                        Create a free account to track your progress and unlock unlimited practice.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={staggerItem}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/quiz">
                            <Button size="lg" className="text-lg px-8 py-6 group bg-blue-600 hover:bg-blue-700 text-white">
                                Try 10 Questions Free
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6 group bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600">
                                Create Free Account
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Removed fake stats - will show real data when available */}
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
                </div>
            </motion.div>
        </section>
    )
}
