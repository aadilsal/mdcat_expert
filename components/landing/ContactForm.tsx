'use client'

// ============================================================================
// Contact Form Component
// ============================================================================
// Contact form with validation and submission handling
// ============================================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, viewportOptions } from '@/lib/animations'

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address'
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setStatus('loading')

        try {
            // TODO: Replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000))

            setStatus('success')
            setFormData({ name: '', email: '', message: '' })

            setTimeout(() => setStatus('idle'), 5000)
        } catch (error) {
            setStatus('error')
            setTimeout(() => setStatus('idle'), 5000)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    return (
        <section id="contact" className="py-20 md:py-32 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Get in Touch
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
                        as possible.
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-2xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                                placeholder="Your name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                                placeholder="your@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Message Field */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={6}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none`}
                                placeholder="Your message..."
                            />
                            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            disabled={status === 'loading'}
                            className="w-full text-lg py-6"
                        >
                            {status === 'loading' ? (
                                'Sending...'
                            ) : (
                                <>
                                    Send Message
                                    <Send className="ml-2" size={20} />
                                </>
                            )}
                        </Button>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg">
                                <CheckCircle size={20} />
                                <p>Message sent successfully! We'll get back to you soon.</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg">
                                <AlertCircle size={20} />
                                <p>Failed to send message. Please try again.</p>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </section>
    )
}
