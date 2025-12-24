'use client'

// ============================================================================
// Testimonials Section Component
// ============================================================================
// Student testimonials with carousel effect
// ============================================================================

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem, viewportOptions } from '@/lib/animations'

const testimonials = [
    {
        name: 'Ayesha Khan',
        role: 'MDCAT 2024 - 192/200',
        image: '/avatars/avatar-1.jpg',
        content:
            'mdcatExpert transformed my preparation! The adaptive quizzes helped me identify weak areas, and the detailed analytics kept me on track. Highly recommended!',
        rating: 5,
    },
    {
        name: 'Ahmed Ali',
        role: 'MDCAT 2024 - 188/200',
        image: '/avatars/avatar-2.jpg',
        content:
            'The image-based questions were exactly like the real MDCAT. The platform helped me practice efficiently and build confidence before the exam.',
        rating: 5,
    },
    {
        name: 'Fatima Malik',
        role: 'MDCAT 2024 - 195/200',
        image: '/avatars/avatar-3.jpg',
        content:
            'Best MDCAT prep platform! The leaderboard feature kept me motivated, and the AI-powered quizzes adapted perfectly to my learning pace.',
        rating: 5,
    },
]

export function Testimonials() {
    return (
        <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Trusted by Top Performers
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Join thousands of students who achieved their MDCAT goals with mdcatExpert
                    </p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            whileHover={{ y: -8 }}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative"
                        >
                            <Quote className="absolute top-6 right-6 text-primary/20" size={48} />

                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="text-yellow-400 fill-current" size={18} />
                                ))}
                            </div>

                            <p className="text-gray-700 leading-relaxed">{testimonial.content}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
