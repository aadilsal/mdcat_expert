// ============================================================================
// Privacy Policy Page
// ============================================================================
// Basic privacy policy
// ============================================================================

import Link from 'next/link'
import { SimpleHeader } from '@/components/shared/SimpleHeader'
import Footer from '@/components/shared/Footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <SimpleHeader />
            <div className="flex-1 bg-gray-50">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        Privacy Policy
                    </h1>

                    <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
                        <p className="text-sm text-gray-500">
                            Last updated: December 26, 2025
                        </p>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Information We Collect
                            </h2>
                            <p className="leading-relaxed mb-3">
                                When you create an account, we collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Your name and email address</li>
                                <li>Quiz performance data (questions answered, scores, progress)</li>
                                <li>Usage data (pages visited, features used)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                How We Use Your Information
                            </h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>To provide and improve our service</li>
                                <li>To track your progress and show personalized recommendations</li>
                                <li>To send important updates about the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Data Security
                            </h2>
                            <p className="leading-relaxed">
                                We use industry-standard security measures to protect your data. Your password is encrypted, and we never share your personal information with third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Your Rights
                            </h2>
                            <p className="leading-relaxed">
                                You can request to view, update, or delete your data at any time by contacting us at{' '}
                                <a href="mailto:support@mdcatexpert.com" className="text-blue-600 hover:underline">
                                    support@mdcatexpert.com
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Contact
                            </h2>
                            <p className="leading-relaxed">
                                If you have questions about this Privacy Policy, contact us at{' '}
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
