'use client'

// ============================================================================
// FAQ Section Component
// ============================================================================
// Accordion-style FAQ with smooth animations
// ============================================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fadeInUp, viewportOptions } from '@/lib/animations'

const faqs = [
    {
        question: 'Is mdcatExpert really free?',
        answer:
            'Yes! mdcatExpert is 100% free for all students. We believe quality MDCAT preparation should be accessible to everyone, regardless of financial background.',
    },
    {
        question: 'How many practice questions are available?',
        answer:
            'We have over 10,000 MDCAT practice questions covering all subjects including Biology, Chemistry, Physics, English, and Logical Reasoning. New questions are added regularly.',
    },
    {
        question: 'Can I track my progress?',
        answer:
            'Absolutely! Our platform provides detailed analytics showing your performance across subjects, question types, and difficulty levels. You can track your improvement over time and identify areas that need more focus.',
    },
    {
        question: 'Are the questions similar to actual MDCAT?',
        answer:
            'Yes! Our questions are designed to match the format, difficulty, and style of actual MDCAT exams. We include image-based questions, diagrams, and charts just like the real test.',
    },
    {
        question: 'Can I use mdcatExpert on my phone?',
        answer:
            'Yes! mdcatExpert is fully responsive and works perfectly on smartphones, tablets, and desktops. Practice anywhere, anytime.',
    },
    {
        question: 'How does the leaderboard work?',
        answer:
            'The leaderboard ranks students based on their quiz performance and accuracy. It updates in real-time and helps you see how you compare with other MDCAT aspirants nationwide.',
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to know about mdcatExpert
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={fadeInUp}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</h3>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0"
                                >
                                    <ChevronDown className="text-gray-600" size={24} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-5">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
