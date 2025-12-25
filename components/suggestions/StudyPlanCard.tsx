'use client'

// ============================================================================
// Study Plan Card Component
// ============================================================================
// Displays AI-generated study plan with daily goals
// ============================================================================

import { motion } from 'framer-motion'
import { Calendar, Clock, Target, BookOpen } from 'lucide-react'
import type { StudyPlan } from '@/types'

interface StudyPlanCardProps {
    studyPlan: StudyPlan
}

export function StudyPlanCard({ studyPlan }: StudyPlanCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Study Plan</h2>
            </div>

            {/* Focus Areas */}
            {studyPlan.focusAreas && studyPlan.focusAreas.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Focus Areas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {studyPlan.focusAreas.map((area, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl border-2 ${area.priority === 'high'
                                        ? 'bg-red-50 border-red-200'
                                        : area.priority === 'medium'
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-green-50 border-green-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{area.topic}</h4>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full ${area.priority === 'high'
                                                ? 'bg-red-500 text-white'
                                                : area.priority === 'medium'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-green-500 text-white'
                                            }`}
                                    >
                                        {area.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{area.reason}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Daily Goals */}
            {studyPlan.dailyGoals && studyPlan.dailyGoals.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Study Schedule</h3>
                    <div className="space-y-3">
                        {studyPlan.dailyGoals.map((goal, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{goal.day}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Target className="w-4 h-4" />
                                            <span>{goal.practiceQuizCount} quizzes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{Math.round(goal.estimatedTime / 60)} min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {goal.topics.map((topic, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200 flex items-center gap-1"
                                        >
                                            <BookOpen className="w-3 h-3" />
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Milestones */}
            {studyPlan.weeklyMilestones && studyPlan.weeklyMilestones.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Milestones</h3>
                    <div className="space-y-3">
                        {studyPlan.weeklyMilestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                    {milestone.completed && (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{milestone.milestone}</p>
                                    <p className="text-sm text-gray-600 mt-1">Target: {milestone.targetDate}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
