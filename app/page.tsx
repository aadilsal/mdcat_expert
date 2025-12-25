// ============================================================================
// Landing Page - mdcatExpert
// ============================================================================
// Modern, high-conversion landing page with all sections
// ============================================================================

import { Navbar } from '@/components/shared/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTASection'
import { ContactForm } from '@/components/landing/ContactForm'
import Footer from '@/components/shared/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'mdcatExpert - Ace Your MDCAT with AI-Powered Practice',
  description:
    'Master MDCAT with 10,000+ practice questions, AI-powered adaptive quizzes, detailed analytics, and real-time leaderboards. 100% free for students. Join 5,000+ successful MDCAT aspirants.',
  keywords: [
    'MDCAT',
    'MDCAT preparation',
    'MDCAT practice',
    'medical college admission test',
    'MDCAT quizzes',
    'MDCAT questions',
    'Pakistan medical entrance',
  ],
  openGraph: {
    title: 'mdcatExpert - Ace Your MDCAT with AI-Powered Practice',
    description:
      'Master MDCAT with 10,000+ practice questions, AI-powered quizzes, and detailed analytics. 100% free for students.',
    type: 'website',
    url: 'https://mdcatexpert.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'mdcatExpert - MDCAT Preparation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mdcatExpert - Ace Your MDCAT with AI-Powered Practice',
    description:
      'Master MDCAT with 10,000+ practice questions and AI-powered quizzes. 100% free for students.',
    images: ['/og-image.jpg'],
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />

      {/* Mid-page CTA */}
      <CTASection
        title="Ready to Start Your MDCAT Journey?"
        description="Try 10 questions free, no signup required. Create a free account to unlock unlimited practice and track your progress."
        primaryCTA={{
          text: 'Try Free Questions',
          href: '/quiz',
        }}
        secondaryCTA={{
          text: 'Create Free Account',
          href: '/register',
        }}
      />

      <Testimonials />
      <Pricing />
      <FAQ />
      <ContactForm />

      {/* Final CTA */}
      <CTASection
        title="Your Medical School Journey Starts Here"
        description="Start practicing MDCAT questions today. No credit card required. No hidden fees. Just quality practice questions."
        primaryCTA={{
          text: 'Start Practicing Now',
          href: '/quiz',
        }}
        variant="secondary"
      />

      <Footer />
    </main>
  )
}
