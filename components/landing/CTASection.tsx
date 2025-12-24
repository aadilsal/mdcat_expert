'use client'

// ============================================================================
// CTA Section Component
// ============================================================================
// Reusable call-to-action section for conversions
// ============================================================================

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, scaleIn, viewportOptions } from '@/lib/animations'

interface CTASectionProps {
    title: string
    description: string
    primaryCTA: {
        text: string
        href: string
    }
    secondaryCTA?: {
        text: string
        href: string
    }
    variant?: 'primary' | 'secondary'
}

export function CTASection({
    title,
    description,
    primaryCTA,
    secondaryCTA,
    variant = 'primary',
}: CTASectionProps) {
    const bgClass =
        variant === 'primary'
            ? 'bg-gradient-to-br from-primary to-blue-600'
            : 'bg-gradient-to-br from-gray-900 to-gray-800'

    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className={`${bgClass} rounded-3xl p-8 md:p-16 text-center`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={scaleIn}
                >
                    <motion.h2
                        variants={fadeInUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8"
                    >
                        {description}
                    </motion.p>
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href={primaryCTA.href}>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100 group"
                            >
                                {primaryCTA.text}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        {secondaryCTA && (
                            <Link href={secondaryCTA.href}>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                                >
                                    {secondaryCTA.text}
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
