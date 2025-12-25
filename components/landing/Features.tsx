'use client'

// ============================================================================
// Features Section Component
// ============================================================================
// Showcase core platform features with scroll animations
// ============================================================================

import { motion } from 'framer-motion'
import { Brain, BarChart3, Image, Trophy } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem, viewportOptions } from '@/lib/animations'

const features = [
    {
        icon: Brain,
        title: 'Smart Quizzes',
        description:
            'AI-powered adaptive quizzes that adjust to your skill level and focus on your weak areas for maximum learning efficiency.',
    },
    {
        icon: BarChart3,
        title: 'Performance Analytics',
        description:
            'Track your progress with detailed analytics, identify patterns, and get personalized insights to improve your scores.',
    },
    {
        icon: Image,
        title: 'Image-Based Questions',
        description:
            'Practice with real MDCAT-style image questions including diagrams, charts, and medical illustrations.',
    },
    {
        icon: Trophy,
        title: 'Competitive Leaderboards',
        description:
            'Compete with peers nationwide, track your ranking, and stay motivated with our real-time leaderboard system.',
    },
]

export function Features() {
    return (
        <section id="features" className="py-20 md:py-32 bg-gradient-to-br from-gray-100 to-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Everything You Need to Succeed
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Comprehensive tools and features designed specifically for MDCAT preparation
                    </p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            whileHover={{ y: -8 }}
                            className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <feature.icon className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
