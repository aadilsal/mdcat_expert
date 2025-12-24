export interface User {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'user'
    created_at: string
    updated_at: string
}

export interface Question {
    id: string
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: 'A' | 'B' | 'C' | 'D'
    category?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    created_at: string
}

export interface QuizSession {
    id: string
    user_id: string
    score: number
    total_questions: number
    completed_at: string
}
