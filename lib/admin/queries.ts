// ============================================================================
// Admin Question Management - Utility Functions
// ============================================================================

import { createClient } from '@/lib/supabase/client'
import type { Question, QuestionCategory } from '@/types'

export interface QuestionFilters {
    search?: string
    categories?: string[]
    difficulties?: string[]
    questionType?: 'text' | 'image' | 'all'
}

export interface QuestionSort {
    field: 'created_at' | 'difficulty_level' | 'category_name' | 'usage_count'
    direction: 'asc' | 'desc'
}

export interface PaginationParams {
    page: number
    perPage: number
}

// ============================================================================
// Fetch Questions with Filters, Sort, and Pagination
// ============================================================================

export async function fetchQuestions(
    filters: QuestionFilters = {},
    sort: QuestionSort = { field: 'created_at', direction: 'desc' },
    pagination: PaginationParams = { page: 1, perPage: 20 }
) {
    const supabase = createClient()

    const start = (pagination.page - 1) * pagination.perPage
    const end = start + pagination.perPage - 1

    let query = supabase
        .from('questions')
        .select(`
            *,
            question_categories(id, name),
            question_usage_stats(times_attempted, correct_percentage)
        `, { count: 'exact' })
        .is('deleted_at', null)

    // Apply search
    if (filters.search && filters.search.trim()) {
        query = query.textSearch('question_text', filters.search.trim())
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
        query = query.in('category_id', filters.categories)
    }

    // Apply difficulty filter
    if (filters.difficulties && filters.difficulties.length > 0) {
        query = query.in('difficulty_level', filters.difficulties)
    }

    // Apply question type filter
    if (filters.questionType === 'text') {
        query = query.not('question_text', 'is', null)
    } else if (filters.questionType === 'image') {
        query = query.not('question_image_url', 'is', null)
    }

    // Apply sorting
    if (sort.field === 'category_name') {
        // Special handling for category name sorting
        query = query.order('question_categories(name)', { ascending: sort.direction === 'asc' })
    } else if (sort.field === 'usage_count') {
        // Special handling for usage count sorting
        query = query.order('question_usage_stats(times_attempted)', { ascending: sort.direction === 'asc' })
    } else {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    }

    // Apply pagination
    query = query.range(start, end)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching questions:', error)
        return { questions: [], total: 0, error }
    }

    return {
        questions: data || [],
        total: count || 0,
        error: null
    }
}

// ============================================================================
// Fetch Single Question
// ============================================================================

export async function fetchQuestion(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('questions')
        .select(`
            *,
            question_categories(id, name, description),
            question_usage_stats(*),
            users(full_name)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

    if (error) {
        console.error('Error fetching question:', error)
        return { question: null, error }
    }

    return { question: data, error: null }
}

// ============================================================================
// Fetch Categories
// ============================================================================

export async function fetchCategories() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('question_categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return { categories: [], error }
    }

    return { categories: data || [], error: null }
}

// ============================================================================
// Delete Question (Soft Delete)
// ============================================================================

export async function deleteQuestion(id: string) {
    const supabase = createClient()

    // Check if question is in use
    const { count } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', id)

    if (count && count > 0) {
        return {
            success: false,
            error: `Cannot delete: Question has been used in ${count} quiz attempts`
        }
    }

    // Soft delete
    const { error } = await supabase
        .from('questions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        console.error('Error deleting question:', error)
        return { success: false, error: error.message }
    }

    return { success: true, error: null }
}

// ============================================================================
// Bulk Delete Questions
// ============================================================================

export async function bulkDeleteQuestions(ids: string[]) {
    const supabase = createClient()

    // Check if any questions are in use
    const { data: usedQuestions } = await supabase
        .from('user_answers')
        .select('question_id')
        .in('question_id', ids)

    const usedIds = new Set(usedQuestions?.map(q => q.question_id) || [])
    const deletableIds = ids.filter(id => !usedIds.has(id))

    if (deletableIds.length === 0) {
        return {
            success: false,
            error: 'All selected questions are in use and cannot be deleted',
            deletedCount: 0,
            skippedCount: ids.length
        }
    }

    // Bulk soft delete
    const { error } = await supabase
        .from('questions')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', deletableIds)

    if (error) {
        console.error('Error bulk deleting questions:', error)
        return {
            success: false,
            error: error.message,
            deletedCount: 0,
            skippedCount: ids.length
        }
    }

    return {
        success: true,
        error: null,
        deletedCount: deletableIds.length,
        skippedCount: usedIds.size
    }
}
