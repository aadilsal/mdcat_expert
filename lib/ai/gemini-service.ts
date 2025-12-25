// ============================================================================
// Gemini AI Service
// ============================================================================
// Service for generating AI explanations using Google's Gemini API
// Includes caching and rate limiting
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import type { QuestionOption, DifficultyLevel, AIExplanation } from '@/types'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// List of available models for v1beta API (these actually exist!)
// Note: v1beta uses different model names than v1 API
const AVAILABLE_MODELS = [
    'gemini-1.5-flash',      // This exists in v1beta
    'gemini-1.5-pro',        // This exists in v1beta  
    'gemini-pro',            // Legacy but still works
]

interface GenerateExplanationParams {
    questionText: string | null
    questionImage?: string | null
    options: {
        A: string
        B: string
        C: string
        D: string
    }
    correctAnswer: QuestionOption
    userAnswer: QuestionOption
    difficulty: DifficultyLevel
    category: string
}

/**
 * Try to generate content with fallback models
 */
async function generateWithFallback(prompt: string): Promise<{ text: string; modelUsed: string }> {
    let lastError: Error | null = null

    for (const modelName of AVAILABLE_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            console.log(`✓ Successfully generated with model: ${modelName}`)
            return { text, modelUsed: modelName }
        } catch (error: any) {
            const errorMessage = error?.message || String(error)

            // If it's a quota error (429), skip to next model
            if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                console.warn(`✗ Model ${modelName} quota exceeded, trying next...`)
                lastError = error as Error
                continue
            }

            // If it's a 404 (model not found), skip to next
            if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                console.warn(`✗ Model ${modelName} not found, trying next...`)
                lastError = error as Error
                continue
            }

            // For other errors, also try next model
            console.warn(`✗ Model ${modelName} failed:`, errorMessage)
            lastError = error as Error
            continue
        }
    }

    // All models failed
    console.error('All Gemini models failed. Last error:', lastError)
    throw new Error('AI explanations temporarily unavailable. Please try again later.')
}

/**
 * Generate AI explanation for a question
 */
export async function generateExplanation(params: GenerateExplanationParams): Promise<{ explanation: string; modelUsed: string }> {
    const {
        questionText,
        questionImage,
        options,
        correctAnswer,
        userAnswer,
        difficulty,
        category,
    } = params

    // Build the prompt
    const isCorrect = correctAnswer === userAnswer
    const questionDisplay = questionText || '[Image-based question]'

    const prompt = `You are an expert MDCAT tutor helping students understand their quiz answers.

Question: ${questionDisplay}
Options:
A) ${options.A}
B) ${options.B}
C) ${options.C}
D) ${options.D}

Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Result: ${isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}
Difficulty: ${difficulty}
Category: ${category}

${isCorrect
            ? `Provide a clear explanation that:
1. Confirms why the student's answer (${userAnswer}) is correct
2. Explains the key concept behind this answer
3. Briefly mentions why other options are incorrect
4. Provides a helpful tip or mnemonic to remember this concept`
            : `Provide a clear explanation that:
1. Explains why the correct answer (${correctAnswer}) is right
2. Explains why the student's answer (${userAnswer}) is wrong
3. Highlights the key concept the student should understand
4. Provides a helpful tip or mnemonic to avoid this mistake in the future`
        }

Keep the explanation under 200 words. Use simple, clear language suitable for medical students. Be encouraging and educational.`

    try {
        const { text, modelUsed } = await generateWithFallback(prompt)
        return {
            explanation: text.trim(),
            modelUsed,
        }
    } catch (error) {
        console.error('Error generating explanation:', error)
        throw error
    }
}

/**
 * Get cached explanation or generate new one
 */
export async function getOrGenerateExplanation(
    questionId: string,
    userAnswer: QuestionOption
): Promise<{ explanation: string; cached: boolean }> {
    const supabase = await createClient()

    try {
        // Check cache first
        const { data: cached, error: cacheError } = await supabase
            .from('ai_explanations')
            .select('explanation_text')
            .eq('question_id', questionId)
            .eq('user_answer', userAnswer)
            .maybeSingle()

        if (cached && !cacheError) {
            return {
                explanation: cached.explanation_text,
                cached: true,
            }
        }

        // Not in cache, fetch question details and generate
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select(`
                question_text,
                question_image_url,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                difficulty_level,
                category_id,
                question_categories (
                    name
                )
            `)
            .eq('id', questionId)
            .single()

        if (questionError || !question) {
            throw new Error('Question not found')
        }

        // Generate explanation
        const { explanation, modelUsed } = await generateExplanation({
            questionText: question.question_text,
            questionImage: question.question_image_url,
            options: {
                A: question.option_a,
                B: question.option_b,
                C: question.option_c,
                D: question.option_d,
            },
            correctAnswer: question.correct_option as QuestionOption,
            userAnswer,
            difficulty: question.difficulty_level as DifficultyLevel,
            category: (question.question_categories as any)?.name || 'General',
        })

        // Cache the explanation
        await supabase.from('ai_explanations').insert({
            question_id: questionId,
            user_answer: userAnswer,
            correct_answer: question.correct_option,
            explanation_text: explanation,
            model_version: modelUsed,
        })

        return {
            explanation,
            cached: false,
        }
    } catch (error) {
        console.error('Error in getOrGenerateExplanation:', error)
        throw error
    }
}

/**
 * Regenerate explanation (bypasses cache)
 */
export async function regenerateExplanation(
    userId: string,
    questionId: string,
    sessionId: string
): Promise<{ explanation: string; remainingRegenerations: number }> {
    const supabase = await createClient()

    try {
        // Check rate limit
        const { data: rateLimit } = await supabase.rpc('can_regenerate_explanation', {
            p_user_id: userId,
            p_question_id: questionId,
        })

        if (!rateLimit || rateLimit.length === 0 || !rateLimit[0].can_regenerate) {
            throw new Error('Rate limit exceeded. Maximum 5 regenerations per question.')
        }

        // Fetch question details
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select(`
                question_text,
                question_image_url,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                difficulty_level,
                category_id,
                question_categories (
                    name
                )
            `)
            .eq('id', questionId)
            .single()

        if (questionError || !question) {
            throw new Error('Question not found')
        }

        // Get user's answer for this question
        const { data: userAnswerData } = await supabase
            .from('user_answers')
            .select('selected_option')
            .eq('session_id', sessionId)
            .eq('question_id', questionId)
            .single()

        if (!userAnswerData) {
            throw new Error('User answer not found')
        }

        const userAnswer = userAnswerData.selected_option as QuestionOption

        // Generate new explanation
        const { explanation, modelUsed } = await generateExplanation({
            questionText: question.question_text,
            questionImage: question.question_image_url,
            options: {
                A: question.option_a,
                B: question.option_b,
                C: question.option_c,
                D: question.option_d,
            },
            correctAnswer: question.correct_option as QuestionOption,
            userAnswer,
            difficulty: question.difficulty_level as DifficultyLevel,
            category: (question.question_categories as any)?.name || 'General',
        })

        // Update cache with new explanation
        await supabase
            .from('ai_explanations')
            .upsert({
                question_id: questionId,
                user_answer: userAnswer,
                correct_answer: question.correct_option,
                explanation_text: explanation,
                model_version: modelUsed,
                generated_at: new Date().toISOString(),
            })

        // Record regeneration
        await supabase.from('explanation_regenerations').insert({
            user_id: userId,
            question_id: questionId,
            session_id: sessionId,
        })

        return {
            explanation,
            remainingRegenerations: rateLimit[0].regenerations_remaining - 1,
        }
    } catch (error) {
        console.error('Error in regenerateExplanation:', error)
        throw error
    }
}

/**
 * Check if user can regenerate explanation
 */
export async function checkRegenerationStatus(
    userId: string,
    questionId: string
): Promise<{
    can_regenerate: boolean
    regenerations_used: number
    regenerations_remaining: number
    max_regenerations: number
}> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.rpc('can_regenerate_explanation', {
            p_user_id: userId,
            p_question_id: questionId,
        })

        if (error || !data || data.length === 0) {
            throw new Error('Failed to check regeneration status')
        }

        return data[0]
    } catch (error) {
        console.error('Error checking regeneration status:', error)
        return {
            can_regenerate: false,
            regenerations_used: 0,
            regenerations_remaining: 0,
            max_regenerations: 5,
        }
    }
}
