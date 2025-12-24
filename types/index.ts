// ============================================================================
// MDCAT Expert - TypeScript Type Definitions
// ============================================================================
// Auto-generated types based on Supabase schema
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'admin' | 'user'

export type QuestionOption = 'A' | 'B' | 'C' | 'D'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export type QuizStatus = 'in_progress' | 'completed'

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface User {
    id: string
    full_name: string
    email: string
    role: UserRole
    created_at: string
    updated_at: string
}

export interface QuestionCategory {
    id: string
    name: string
    description: string | null
    created_at: string
}

export interface Question {
    id: string
    category_id: string | null
    question_text: string | null
    question_image_url: string | null
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: QuestionOption
    difficulty_level: DifficultyLevel
    explanation: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface QuizSession {
    id: string
    user_id: string
    started_at: string
    completed_at: string | null
    total_questions: number
    score: number
    status: QuizStatus
    created_at: string
}

export interface UserAnswer {
    id: string
    session_id: string
    question_id: string
    selected_option: QuestionOption
    is_correct: boolean | null
    answered_at: string
}

export interface UserAnalytics {
    user_id: string
    total_quizzes: number
    total_questions_answered: number
    total_correct_answers: number
    accuracy_percentage: number
    last_active_at: string
    updated_at: string
}

// ============================================================================
// VIEWS
// ============================================================================

export interface LeaderboardEntry {
    id: string
    full_name: string
    email: string
    total_quizzes: number
    total_correct_answers: number
    total_questions_answered: number
    accuracy_percentage: number
    last_active_at: string | null
    rank: number
}

// ============================================================================
// FUNCTION RETURN TYPES
// ============================================================================

export interface QuizHistoryEntry {
    session_id: string
    started_at: string
    completed_at: string | null
    total_questions: number
    score: number
    accuracy: number
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateQuestionRequest {
    category_id?: string
    question_text?: string
    question_image_url?: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: QuestionOption
    difficulty_level: DifficultyLevel
    explanation?: string
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
    id: string
}

export interface StartQuizRequest {
    category_id?: string
    difficulty_level?: DifficultyLevel
    question_count?: number
}

export interface SubmitAnswerRequest {
    session_id: string
    question_id: string
    selected_option: QuestionOption
}

export interface CompleteQuizRequest {
    session_id: string
}

// ============================================================================
// JOINED DATA TYPES
// ============================================================================

export interface QuestionWithCategory extends Question {
    category: QuestionCategory | null
}

export interface QuizSessionWithAnswers extends QuizSession {
    answers: UserAnswer[]
}

export interface UserAnswerWithQuestion extends UserAnswer {
    question: Question
}

export interface UserWithAnalytics extends User {
    analytics: UserAnalytics | null
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface QuestionImageUpload {
    file: File
    question_id: string
}

export interface QuestionImageUrl {
    url: string
    path: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DatabaseTable =
    | 'users'
    | 'question_categories'
    | 'questions'
    | 'quiz_sessions'
    | 'user_answers'
    | 'user_analytics'

export type DatabaseView = 'leaderboard'

// ============================================================================
// SUPABASE CLIENT TYPES
// ============================================================================

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User
                Insert: Omit<User, 'created_at' | 'updated_at'>
                Update: Partial<Omit<User, 'id' | 'created_at'>>
            }
            question_categories: {
                Row: QuestionCategory
                Insert: Omit<QuestionCategory, 'id' | 'created_at'>
                Update: Partial<Omit<QuestionCategory, 'id' | 'created_at'>>
            }
            questions: {
                Row: Question
                Insert: Omit<Question, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Question, 'id' | 'created_at'>>
            }
            quiz_sessions: {
                Row: QuizSession
                Insert: Omit<QuizSession, 'id' | 'created_at'>
                Update: Partial<Omit<QuizSession, 'id' | 'created_at'>>
            }
            user_answers: {
                Row: UserAnswer
                Insert: Omit<UserAnswer, 'id' | 'is_correct' | 'answered_at'>
                Update: Partial<Omit<UserAnswer, 'id' | 'answered_at'>>
            }
            user_analytics: {
                Row: UserAnalytics
                Insert: Omit<UserAnalytics, 'updated_at'>
                Update: Partial<Omit<UserAnalytics, 'user_id'>>
            }
        }
        Views: {
            leaderboard: {
                Row: LeaderboardEntry
            }
        }
        Functions: {
            calculate_quiz_score: {
                Args: { p_session_id: string }
                Returns: number
            }
            update_user_analytics: {
                Args: { p_user_id: string }
                Returns: void
            }
            complete_quiz_session: {
                Args: { p_session_id: string }
                Returns: void
            }
            get_random_questions: {
                Args: {
                    p_category_id?: string
                    p_difficulty?: DifficultyLevel
                    p_limit?: number
                }
                Returns: Question[]
            }
            get_user_quiz_history: {
                Args: { p_user_id: string }
                Returns: QuizHistoryEntry[]
            }
        }
    }
}
