'use client'

// ============================================================================
// Responsive Navbar Component
// ============================================================================
// Sticky navigation with smooth scroll and mobile menu
// ============================================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: 'Contact' },
]

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('')
    const pathname = usePathname()

    // Handle scroll for sticky navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Handle active section highlighting
    useEffect(() => {
        const handleScroll = () => {
            const sections = navLinks.map(link => link.href.substring(1))
            const scrollPosition = window.scrollY + 100

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(`#${section}`)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Smooth scroll to section
    const scrollToSection = (href: string) => {
        if (href.startsWith('#')) {
            const element = document.getElementById(href.substring(1))
            if (element) {
                const offset = 80 // Header height offset
                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - offset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                })
            }
            setIsMobileMenuOpen(false)
        }
    }

    // Only show navbar on landing page
    if (pathname !== '/') return null

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-md`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            mdcatExpert
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <button
                                key={link.href}
                                onClick={() => scrollToSection(link.href)}
                                className={`text-sm font-medium transition-colors hover:text-purple-600 ${activeSection === link.href ? 'text-purple-600 font-bold' : 'text-gray-700'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/login">
                            <Button variant="outline" className="bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started Free</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-white border-t"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {navLinks.map(link => (
                                <button
                                    key={link.href}
                                    onClick={() => scrollToSection(link.href)}
                                    className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === link.href
                                        ? 'bg-purple-100 text-purple-600 font-bold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <div className="pt-4 space-y-2">
                                <Link href="/login" className="block">
                                    <Button variant="outline" className="w-full">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register" className="block">
                                    <Button className="w-full">Get Started Free</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
