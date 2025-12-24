'use client'

// ============================================================================
// Pricing Section Component
// ============================================================================
// Free-for-students pricing with feature highlights
// ============================================================================

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, scaleIn, viewportOptions } from '@/lib/animations'

const features = [
    'Unlimited practice quizzes',
    'AI-powered adaptive learning',
    '10,000+ MDCAT questions',
    'Detailed performance analytics',
    'Image-based questions',
    'Real-time leaderboards',
    'Progress tracking',
    'Mobile-friendly platform',
    'Regular content updates',
    'Community support',
]

export function Pricing() {
    return (
        <section id="pricing" className="py-20 md:py-32 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                        <Sparkles className="mr-2" size={16} />
                        Limited Time Offer
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        100% Free for Students
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        We believe quality education should be accessible to everyone. That's why mdcatExpert is
                        completely free for all students.
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-3xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={scaleIn}
                >
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-1">
                        <div className="bg-white rounded-3xl p-8 md:p-12">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Student Plan</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                        FREE
                                    </span>
                                    <span className="text-gray-600">forever</span>
                                </div>
                                <p className="text-gray-600 mt-4">
                                    All features included. No credit card required.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <Check className="text-green-600" size={14} />
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/register" className="block">
                                <Button size="lg" className="w-full text-lg py-6">
                                    Start Learning for Free
                                </Button>
                            </Link>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Join 5,000+ students already preparing with mdcatExpert
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
