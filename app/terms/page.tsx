// ============================================================================
// Terms of Service Page
// ============================================================================
// Basic terms of service
// ============================================================================

import Link from 'next/link'
import { SimpleHeader } from '@/components/shared/SimpleHeader'
import Footer from '@/components/shared/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <SimpleHeader />
            <div className="flex-1 bg-gray-50">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        Terms of Service
                    </h1>

                    <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
                        <p className="text-sm text-gray-500">
                            Last updated: December 26, 2025
                        </p>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Acceptance of Terms
                            </h2>
                            <p className="leading-relaxed">
                                By accessing and using MDCAT Expert, you accept and agree to be bound by these Terms of Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Use of Service
                            </h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>You must be at least 13 years old to use this service</li>
                                <li>You are responsible for maintaining the security of your account</li>
                                <li>You may not use the service for any illegal or unauthorized purpose</li>
                                <li>You may not share your account with others</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Content
                            </h2>
                            <p className="leading-relaxed mb-3">
                                All practice questions, explanations, and educational content on MDCAT Expert are provided for educational purposes only. While we strive for accuracy:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>We do not guarantee the accuracy of all content</li>
                                <li>Content should be used as supplementary study material</li>
                                <li>We are not responsible for exam results</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Free Service
                            </h2>
                            <p className="leading-relaxed">
                                MDCAT Expert is provided free of charge. We reserve the right to modify or discontinue the service at any time without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Limitation of Liability
                            </h2>
                            <p className="leading-relaxed">
                                MDCAT Expert is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Contact
                            </h2>
                            <p className="leading-relaxed">
                                Questions about these Terms? Contact us at{' '}
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
