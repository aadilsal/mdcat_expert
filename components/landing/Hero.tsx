'use client'

// ============================================================================
// Hero Section Component
// ============================================================================
// Above-the-fold hero with compelling CTAs and animations
// ============================================================================

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
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
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            🎓 Free for All Students
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={staggerItem}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
                    >
                        Ace Your{' '}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            MDCAT
                        </span>{' '}
                        with Confidence
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={staggerItem}
                        className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto"
                    >
                        Master MDCAT with AI-powered quizzes, real-time analytics, and thousands of practice
                        questions. Join thousands of students achieving their medical school dreams.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={staggerItem}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/register">
                            <Button size="lg" className="text-lg px-8 py-6 group">
                                Start Practicing Free
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
                            <Play className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerItem}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">10,000+</div>
                            <div className="text-sm text-gray-600 mt-1">Practice Questions</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">5,000+</div>
                            <div className="text-sm text-gray-600 mt-1">Active Students</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">95%</div>
                            <div className="text-sm text-gray-600 mt-1">Success Rate</div>
                        </div>
                    </motion.div>
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
