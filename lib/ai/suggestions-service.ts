// ============================================================================
// AI Suggestions Service
// ============================================================================
// Generates personalized study recommendations using Gemini API
// Includes data preprocessing, caching, and rate limiting
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceData {
    userId: string
    overallAccuracy: number
    totalQuizzes: number
    totalQuestions: number
    totalCorrect: number
    avgTimePerQuestion: number
    recentTrend: 'improving' | 'declining' | 'stable'
    weakTopics: Array<{
        topic_id: string
        topic_name: string
        accuracy: number
        questions_attempted: number
    }>
    strongTopics: Array<{
        topic_id: string
        topic_name: string
        accuracy: number
        questions_attempted: number
    }>
    difficultyPerformance: {
        easy?: { accuracy: number; total: number; correct: number }
        medium?: { accuracy: number; total: number; correct: number }
        hard?: { accuracy: number; total: number; correct: number }
    }
    timeAnalysis: {
        avg_time_per_question: number
        total_time_spent: number
    }
}

interface Recommendation {
    id: string
    priority: 'high' | 'medium' | 'low'
    what: string
    why: string
    how: string[]
    relatedTopics: string[]
}

interface StudyPlan {
    dailyGoals: Array<{
        day: string
        topics: string[]
        practiceQuizCount: number
        estimatedTime: number
    }>
    weeklyMilestones: Array<{
        milestone: string
        targetDate: string
        completed: boolean
    }>
    focusAreas: Array<{
        topic: string
        priority: 'high' | 'medium' | 'low'
        reason: string
    }>
}

interface PracticeSuggestion {
    topicId: string
    topicName: string
    currentAccuracy: number
    recommendedDifficulty: 'easy' | 'medium' | 'hard'
    priorityScore: number
    questionCount: number
}

interface MotivationalInsight {
    type: 'progress' | 'streak' | 'achievement' | 'improvement'
    message: string
    data: Record<string, any>
}

interface SuggestionsResponse {
    recommendations: Recommendation[]
    studyPlan: StudyPlan
    practiceSuggestions: PracticeSuggestion[]
    motivationalInsights: MotivationalInsight[]
    generatedAt: string
    expiresAt: string
    cached: boolean
}

// ============================================================================
// DATA PREPROCESSING
// ============================================================================

/**
 * Fetch comprehensive user performance data
 */
export async function getUserPerformanceData(userId: string): Promise<PerformanceData | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.rpc('get_user_performance_summary', {
            p_user_id: userId,
        })

        if (error || !data || data.length === 0) {
            console.error('Error fetching performance data:', error)
            return null
        }

        const perfData = data[0]

        return {
            userId,
            overallAccuracy: parseFloat(perfData.overall_accuracy) || 0,
            totalQuizzes: perfData.total_quizzes || 0,
            totalQuestions: perfData.total_questions || 0,
            totalCorrect: perfData.total_correct || 0,
            avgTimePerQuestion: parseFloat(perfData.avg_time_per_question) || 0,
            recentTrend: perfData.recent_trend || 'stable',
            weakTopics: perfData.weak_topics || [],
            strongTopics: perfData.strong_topics || [],
            difficultyPerformance: perfData.difficulty_performance || {},
            timeAnalysis: perfData.time_analysis || {
                avg_time_per_question: 0,
                total_time_spent: 0,
            },
        }
    } catch (error) {
        console.error('Error in getUserPerformanceData:', error)
        return null
    }
}

/**
 * Calculate performance hash for caching
 */
function calculatePerformanceHash(data: PerformanceData): string {
    const hashInput = JSON.stringify({
        accuracy: Math.round(data.overallAccuracy),
        quizzes: data.totalQuizzes,
        trend: data.recentTrend,
        weakTopics: data.weakTopics.map(t => t.topic_name).sort(),
    })
    return crypto.createHash('md5').update(hashInput).digest('hex')
}

/**
 * Analyze time management patterns
 */
function analyzeTimeManagement(data: PerformanceData): {
    pattern: 'overthinking' | 'rushing' | 'balanced'
    message: string
} {
    const avgTime = data.avgTimePerQuestion

    // Assuming ideal time is 60-90 seconds per question for MDCAT
    if (avgTime > 120) {
        return {
            pattern: 'overthinking',
            message: 'You tend to spend too much time per question. Practice time management.',
        }
    } else if (avgTime < 45) {
        return {
            pattern: 'rushing',
            message: 'You might be rushing through questions. Take time to read carefully.',
        }
    } else {
        return {
            pattern: 'balanced',
            message: 'Your time management is good. Keep maintaining this pace.',
        }
    }
}

// ============================================================================
// AI GENERATION
// ============================================================================

/**
 * Generate personalized recommendations using Gemini
 */
async function generateRecommendations(data: PerformanceData): Promise<Recommendation[]> {
    const weakTopicsList = data.weakTopics.map(t => `${t.topic_name} (${t.accuracy.toFixed(1)}%)`).join(', ') || 'None identified'
    const strongTopicsList = data.strongTopics.map(t => `${t.topic_name} (${t.accuracy.toFixed(1)}%)`).join(', ') || 'None identified'
    const timeAnalysis = analyzeTimeManagement(data)

    const prompt = `You are an expert MDCAT tutor analyzing student performance to provide actionable improvement recommendations.

**Student Performance Summary:**
- Overall Accuracy: ${data.overallAccuracy.toFixed(1)}%
- Total Quizzes Completed: ${data.totalQuizzes}
- Total Questions Attempted: ${data.totalQuestions}
- Recent Performance Trend: ${data.recentTrend}
- Weak Topics: ${weakTopicsList}
- Strong Topics: ${strongTopicsList}
- Time Management: ${timeAnalysis.message}

**Task:** Generate 3-7 personalized, actionable improvement recommendations.

**Format:** Return ONLY a valid JSON array with this exact structure:
[
  {
    "priority": "high|medium|low",
    "what": "Specific area to improve (concise, max 10 words)",
    "why": "Why this matters for MDCAT success (1-2 sentences)",
    "how": ["Step 1", "Step 2", "Step 3"],
    "relatedTopics": ["Topic1", "Topic2"]
  }
]

**Guidelines:**
1. Prioritize high-impact improvements (weak topics with low accuracy)
2. Be specific and actionable - avoid generic advice
3. Focus on MDCAT-relevant topics
4. Include concrete action steps in "how"
5. Limit to 3-7 recommendations
6. Order by priority (high first)
7. Be encouraging but realistic

Return ONLY the JSON array, no additional text.`

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().trim()

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response')
        }

        const recommendations = JSON.parse(jsonMatch[0])

        // Add IDs and validate
        return recommendations.map((rec: any, index: number) => ({
            id: `rec-${index + 1}`,
            priority: rec.priority || 'medium',
            what: rec.what || '',
            why: rec.why || '',
            how: Array.isArray(rec.how) ? rec.how : [],
            relatedTopics: Array.isArray(rec.relatedTopics) ? rec.relatedTopics : [],
        }))
    } catch (error) {
        console.error('Error generating recommendations:', error)
        // Return fallback recommendations
        return generateFallbackRecommendations(data)
    }
}

/**
 * Generate study plan using Gemini
 */
async function generateStudyPlan(data: PerformanceData): Promise<StudyPlan> {
    const weakTopics = data.weakTopics.map(t => t.topic_name).join(', ') || 'General review'

    const prompt = `Create a personalized 7-day MDCAT study plan.

**Student Profile:**
- Current Accuracy: ${data.overallAccuracy.toFixed(1)}%
- Weak Areas: ${weakTopics}
- Study Time Available: 3-4 hours/day

**Task:** Generate a structured study plan.

**Format:** Return ONLY valid JSON:
{
  "dailyGoals": [
    {
      "day": "Monday",
      "topics": ["Topic1", "Topic2"],
      "practiceQuizCount": 2,
      "estimatedTime": 180
    }
  ],
  "weeklyMilestones": [
    {
      "milestone": "Improve Biology accuracy to 70%",
      "targetDate": "2024-01-07",
      "completed": false
    }
  ],
  "focusAreas": [
    {
      "topic": "Biology",
      "priority": "high",
      "reason": "Current accuracy is low (45%)"
    }
  ]
}

**Guidelines:**
1. Focus on weak topics
2. Progressive difficulty
3. Realistic daily goals
4. Include rest/review days
5. Achievable milestones

Return ONLY the JSON object.`

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('No valid JSON found')
        }

        return JSON.parse(jsonMatch[0])
    } catch (error) {
        console.error('Error generating study plan:', error)
        return generateFallbackStudyPlan(data)
    }
}

/**
 * Generate motivational insights
 */
function generateMotivationalInsights(data: PerformanceData): MotivationalInsight[] {
    const insights: MotivationalInsight[] = []

    // Progress insight
    if (data.totalQuizzes > 0) {
        insights.push({
            type: 'progress',
            message: `You've completed ${data.totalQuizzes} quiz${data.totalQuizzes > 1 ? 'zes' : ''} and answered ${data.totalQuestions} questions. Keep building your knowledge!`,
            data: { quizzes: data.totalQuizzes, questions: data.totalQuestions },
        })
    }

    // Trend insight
    if (data.recentTrend === 'improving') {
        insights.push({
            type: 'improvement',
            message: `📈 Your performance is improving! Your recent scores show positive growth. Keep up the momentum!`,
            data: { trend: 'improving' },
        })
    }

    // Achievement insight
    if (data.overallAccuracy >= 80) {
        insights.push({
            type: 'achievement',
            message: `🌟 Excellent work! You're maintaining ${data.overallAccuracy.toFixed(1)}% accuracy. You're on track for MDCAT success!`,
            data: { accuracy: data.overallAccuracy },
        })
    } else if (data.overallAccuracy >= 60) {
        insights.push({
            type: 'progress',
            message: `You're making solid progress with ${data.overallAccuracy.toFixed(1)}% accuracy. Focus on weak areas to reach 80%+.`,
            data: { accuracy: data.overallAccuracy },
        })
    }

    return insights
}

// ============================================================================
// FALLBACK FUNCTIONS
// ============================================================================

function generateFallbackRecommendations(data: PerformanceData): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Add recommendations based on weak topics
    data.weakTopics.slice(0, 3).forEach((topic, index) => {
        recommendations.push({
            id: `rec-${index + 1}`,
            priority: 'high',
            what: `Improve ${topic.topic_name}`,
            why: `Your current accuracy in ${topic.topic_name} is ${topic.accuracy.toFixed(1)}%, which needs improvement for MDCAT success.`,
            how: [
                `Review ${topic.topic_name} concepts from your textbook`,
                `Practice 10-15 ${topic.topic_name} questions daily`,
                `Take focused quizzes on ${topic.topic_name}`,
            ],
            relatedTopics: [topic.topic_name],
        })
    })

    // Add time management if needed
    const timeAnalysis = analyzeTimeManagement(data)
    if (timeAnalysis.pattern !== 'balanced') {
        recommendations.push({
            id: `rec-time`,
            priority: 'medium',
            what: 'Improve time management',
            why: timeAnalysis.message,
            how: [
                'Practice with a timer',
                'Aim for 60-90 seconds per question',
                'Skip difficult questions and return later',
            ],
            relatedTopics: [],
        })
    }

    return recommendations
}

function generateFallbackStudyPlan(data: PerformanceData): StudyPlan {
    const weakTopics = data.weakTopics.map(t => t.topic_name)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return {
        dailyGoals: days.map((day, index) => ({
            day,
            topics: weakTopics.slice(index % weakTopics.length, (index % weakTopics.length) + 2),
            practiceQuizCount: 2,
            estimatedTime: 180,
        })),
        weeklyMilestones: [
            {
                milestone: 'Complete 10 practice quizzes',
                targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
            },
        ],
        focusAreas: data.weakTopics.slice(0, 3).map(topic => ({
            topic: topic.topic_name,
            priority: 'high' as const,
            reason: `Current accuracy: ${topic.accuracy.toFixed(1)}%`,
        })),
    }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get or generate AI suggestions (with caching)
 */
export async function getOrGenerateSuggestions(userId: string): Promise<SuggestionsResponse | null> {
    const supabase = await createClient()

    try {
        // Get performance data
        const performanceData = await getUserPerformanceData(userId)
        if (!performanceData) {
            return null
        }

        // Calculate performance hash
        const perfHash = calculatePerformanceHash(performanceData)

        // Check cache
        const { data: cached } = await supabase
            .from('ai_suggestions')
            .select('*')
            .eq('user_id', userId)
            .eq('performance_hash', perfHash)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (cached) {
            return {
                recommendations: cached.suggestions_data,
                studyPlan: cached.study_plan,
                practiceSuggestions: cached.practice_suggestions,
                motivationalInsights: cached.motivational_insights,
                generatedAt: cached.generated_at,
                expiresAt: cached.expires_at,
                cached: true,
            }
        }

        // Generate new suggestions
        const [recommendations, studyPlan, practiceSuggestions] = await Promise.all([
            generateRecommendations(performanceData),
            generateStudyPlan(performanceData),
            getPracticeSuggestions(userId),
        ])

        const motivationalInsights = generateMotivationalInsights(performanceData)

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        // Cache the results
        await supabase.from('ai_suggestions').upsert({
            user_id: userId,
            performance_hash: perfHash,
            suggestions_data: recommendations,
            study_plan: studyPlan,
            practice_suggestions: practiceSuggestions,
            motivational_insights: motivationalInsights,
            expires_at: expiresAt,
        })

        return {
            recommendations,
            studyPlan,
            practiceSuggestions,
            motivationalInsights,
            generatedAt: new Date().toISOString(),
            expiresAt,
            cached: false,
        }
    } catch (error) {
        console.error('Error in getOrGenerateSuggestions:', error)
        return null
    }
}

/**
 * Regenerate suggestions (bypass cache)
 */
export async function regenerateSuggestions(userId: string): Promise<{
    suggestions: SuggestionsResponse | null
    regenerationsRemaining: number
}> {
    const supabase = await createClient()

    try {
        // Check rate limit
        const { data: rateLimit } = await supabase.rpc('can_regenerate_suggestions', {
            p_user_id: userId,
        })

        if (!rateLimit || rateLimit.length === 0 || !rateLimit[0].can_regenerate) {
            throw new Error('Rate limit exceeded. Maximum 3 regenerations per day.')
        }

        // Get performance data
        const performanceData = await getUserPerformanceData(userId)
        if (!performanceData) {
            return { suggestions: null, regenerationsRemaining: 0 }
        }

        // Generate new suggestions (bypass cache)
        const [recommendations, studyPlan, practiceSuggestions] = await Promise.all([
            generateRecommendations(performanceData),
            generateStudyPlan(performanceData),
            getPracticeSuggestions(userId),
        ])

        const motivationalInsights = generateMotivationalInsights(performanceData)

        const perfHash = calculatePerformanceHash(performanceData)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        // Update cache
        await supabase.from('ai_suggestions').upsert({
            user_id: userId,
            performance_hash: perfHash,
            suggestions_data: recommendations,
            study_plan: studyPlan,
            practice_suggestions: practiceSuggestions,
            motivational_insights: motivationalInsights,
            expires_at: expiresAt,
            generated_at: new Date().toISOString(),
        })

        // Record regeneration
        await supabase.from('suggestion_regenerations').insert({
            user_id: userId,
        })

        return {
            suggestions: {
                recommendations,
                studyPlan,
                practiceSuggestions,
                motivationalInsights,
                generatedAt: new Date().toISOString(),
                expiresAt,
                cached: false,
            },
            regenerationsRemaining: rateLimit[0].regenerations_remaining - 1,
        }
    } catch (error) {
        console.error('Error in regenerateSuggestions:', error)
        throw error
    }
}

/**
 * Get practice question suggestions
 */
export async function getPracticeSuggestions(userId: string): Promise<PracticeSuggestion[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.rpc('get_practice_recommendations', {
            p_user_id: userId,
            p_limit: 5,
        })

        if (error || !data) {
            return []
        }

        return data.map((item: any) => ({
            topicId: item.topic_id,
            topicName: item.topic_name,
            currentAccuracy: parseFloat(item.current_accuracy),
            recommendedDifficulty: item.recommended_difficulty,
            priorityScore: parseFloat(item.priority_score),
            questionCount: item.question_count,
        }))
    } catch (error) {
        console.error('Error getting practice suggestions:', error)
        return []
    }
}
