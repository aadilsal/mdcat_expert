// ============================================================================
// Enhanced Footer Component
// ============================================================================
// Comprehensive footer with links, social media, and legal information
// ============================================================================

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
    product: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '#contact' },
        { label: 'Blog', href: '/blog' },
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
    ],
}

const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export default function Footer() { // Changed to default export to match original file structure
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
                            mdcatExpert
                        </div>
                        <p className="text-gray-400 mb-4 max-w-sm">
                            Your complete MDCAT preparation platform. Practice smarter, perform better, achieve
                            your medical school dreams.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map(social => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map(link => (
                                <li key={link.label}>
                                    <a href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map(link => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map(link => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} mdcatExpert. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Mail size={16} />
                        <a href="mailto:support@mdcatexpert.com" className="text-sm hover:text-white transition-colors">
                            support@mdcatexpert.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
