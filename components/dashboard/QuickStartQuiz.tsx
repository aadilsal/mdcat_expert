'use client'

// ============================================================================
// Quick Start Quiz Component
// ============================================================================
// Prominent button to start a recommended quiz
// ============================================================================

import { Play, Zap } from 'lucide-react'
import { QuickStartConfig } from '@/lib/dashboard/types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface QuickStartQuizProps {
    config: QuickStartConfig
}

export function QuickStartQuiz({ config }: QuickStartQuizProps) {
    const router = useRouter()

    const handleStartQuiz = () => {
        // Navigate to quiz page with pre-selected category and difficulty
        const params = new URLSearchParams({
            category: config.categoryId,
            difficulty: config.difficulty
        })
        router.push(`/quiz?${params.toString()}`)
    }

    return (
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Zap className="text-white" size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">Ready to Practice?</h3>
                    <p className="text-purple-100">Start your recommended quiz now!</p>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-purple-100 text-sm">Category</p>
                        <p className="font-semibold">{config.categoryName}</p>
                    </div>
                    <div>
                        <p className="text-purple-100 text-sm">Difficulty</p>
                        <p className="font-semibold capitalize">{config.difficulty}</p>
                    </div>
                    <div>
                        <p className="text-purple-100 text-sm">Questions</p>
                        <p className="font-semibold">{config.estimatedQuestions}</p>
                    </div>
                </div>
            </div>

            <p className="text-purple-100 text-sm mb-6">
                💡 {config.reason}
            </p>

            <Button
                onClick={handleStartQuiz}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold py-6 text-lg shadow-lg"
            >
                <Play className="mr-2" size={24} />
                Start Quiz Now
            </Button>
        </div>
    )
}
