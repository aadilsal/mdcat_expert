// ============================================================================
// About Page
// ============================================================================
// Simple about page explaining the platform
// ============================================================================

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { SimpleHeader } from '@/components/shared/SimpleHeader'
import Footer from '@/components/shared/Footer'

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <SimpleHeader />
            <div className="flex-1 bg-gray-50">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        About MDCAT Expert
                    </h1>

                    <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Our Mission
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                MDCAT Expert is a free practice platform designed to help students prepare for the Medical and Dental College Admission Test (MDCAT) in Pakistan. We believe quality education resources should be accessible to everyone, regardless of their financial situation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                What We Offer
                            </h2>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Free MDCAT practice questions across all subjects</li>
                                <li>Instant feedback on your answers</li>
                                <li>Progress tracking to identify strengths and weaknesses</li>
                                <li>No hidden fees or premium tiers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Try Before You Sign Up
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We let you try 10 questions completely free without creating an account. If you find it helpful, create a free account to unlock unlimited practice and save your progress.
                            </p>
                            <Link href="/quiz">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Try Free Questions
                                    <ArrowRight className="ml-2" size={16} />
                                </Button>
                            </Link>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Contact Us
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Have questions or feedback? Email us at{' '}
                                <a href="mailto:support@mdcatexpert.com" className="text-blue-600 hover:underline">
                                    support@mdcatexpert.com
                                </a>
                            </p>
                        </section>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-blue-600 hover:underline">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
