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

export type QuizDifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed'

export type QuizStatus = 'in_progress' | 'completed'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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
    quiz_id: string | null
    started_at: string
    completed_at: string | null
    submitted_at: string | null
    total_questions: number
    score: number
    status: QuizStatus
    time_limit_minutes: number | null
    time_taken_seconds: number | null
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

export interface Quiz {
    id: string
    title: string
    description: string | null
    category_id: string | null
    difficulty_level: QuizDifficultyLevel | null
    time_limit_minutes: number
    question_count: number
    is_active: boolean
    is_practice_mode: boolean
    allow_pause: boolean
    show_results_immediately: boolean
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface QuizQuestion {
    id: string
    quiz_id: string
    question_id: string
    question_order: number
    created_at: string
}

export interface BookmarkedQuestion {
    id: string
    session_id: string
    question_id: string
    created_at: string
}

export interface QuizState {
    session_id: string
    current_question_index: number
    time_remaining_seconds: number | null
    is_paused: boolean
    paused_at: string | null
    state_data: Record<string, any> | null
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

export interface QuizWithCategory extends Quiz {
    category: QuestionCategory | null
}

export interface QuizSessionWithState extends QuizSession {
    quiz_state: QuizState | null
    bookmarked_questions: BookmarkedQuestion[]
}

export interface QuestionWithAnswer extends Question {
    user_answer: UserAnswer | null
    is_bookmarked: boolean
}

// ============================================================================
// QUIZ STATE MANAGEMENT TYPES
// ============================================================================

export interface QuizProgress {
    total_questions: number
    answered_questions: number
    bookmarked_questions: number
    current_index: number
    time_remaining: number
    is_paused: boolean
}

export interface QuizNavigationState {
    current_index: number
    can_go_next: boolean
    can_go_previous: boolean
    answered_indices: number[]
    bookmarked_indices: number[]
}

export interface QuizTimerState {
    time_remaining_seconds: number
    is_running: boolean
    urgency_level: 'normal' | 'warning' | 'critical'
}

// ============================================================================
// QUIZ API REQUEST/RESPONSE TYPES
// ============================================================================

export interface StartQuizByIdRequest {
    quiz_id: string
}

export interface StartRandomQuizRequest {
    category_id?: string
    difficulty_level?: DifficultyLevel
    question_count?: number
    time_limit_minutes?: number
}

export interface SaveAnswerRequest {
    session_id: string
    question_id: string
    selected_option: QuestionOption
}

export interface SaveQuizStateRequest {
    session_id: string
    current_question_index: number
    time_remaining_seconds: number
}

export interface ToggleBookmarkRequest {
    session_id: string
    question_id: string
}

export interface SubmitQuizRequest {
    session_id: string
}

export interface QuizStartResponse {
    session_id: string
    quiz: Quiz | null
    questions: Question[]
    time_limit_minutes: number
    existing_answers: Record<string, QuestionOption>
    existing_bookmarks: string[]
    quiz_state: QuizState | null
}

export interface QuizSubmitResponse {
    session_id: string
    score: number
    total_questions: number
    accuracy_percentage: number
    time_taken_seconds: number
    correct_answers: number
    incorrect_answers: number
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

// ============================================================================
// EXCEL UPLOAD TYPES
// ============================================================================

export interface ExcelQuestionRow {
    question_text?: string
    question_image_url?: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: QuestionOption
    category: string
    difficulty_level: DifficultyLevel
    explanation?: string
}

export interface ParsedExcelData {
    rows: ExcelQuestionRow[]
    totalRows: number
    validRows: number
    invalidRows: ValidationError[]
}

export interface ValidationError {
    row: number
    field: string
    message: string
    value?: any
}

export interface UploadProgress {
    stage: 'parsing' | 'validating' | 'uploading' | 'complete' | 'error'
    progress: number
    message: string
    processedRows?: number
    totalRows?: number
}

export interface UploadResult {
    success: boolean
    totalRows: number
    successCount: number
    failureCount: number
    duplicateCount: number
    errors: ValidationError[]
    uploadId?: string
    quizId?: string // ID of the created quiz
    quizTitle?: string // Title of the created quiz
}

export interface UploadHistory {
    id: string
    admin_id: string
    file_name: string
    total_rows: number
    success_count: number
    failure_count: number
    duplicate_count: number
    error_details: ValidationError[] | null
    uploaded_at: string
    status: 'success' | 'partial' | 'failed'
}

export interface DuplicateQuestion {
    rowNumber: number
    questionText: string
    existingId: string
}

export interface ColumnMapping {
    excelColumn: string
    dbField: keyof ExcelQuestionRow
    required: boolean
}

// ============================================================================
// QUIZ RESULTS & AI EXPLANATIONS TYPES
// ============================================================================

// AI Explanation types
export interface AIExplanation {
    id: string
    question_id: string
    user_answer: QuestionOption
    correct_answer: QuestionOption
    explanation_text: string
    model_version: string
    generated_at: string
    cached?: boolean
}

export interface ExplanationRegenerationStatus {
    can_regenerate: boolean
    regenerations_used: number
    regenerations_remaining: number
    max_regenerations: number
}

// Detailed Quiz Results
export interface DetailedQuizResults {
    session_id: string
    user_id: string
    quiz_id: string | null
    quiz_title?: string
    started_at: string
    completed_at: string | null
    total_questions: number
    score: number
    correct_answers: number
    incorrect_answers: number
    accuracy_percentage: number
    time_taken_seconds: number | null
    average_time_per_question: number
    difficulty_breakdown: DifficultyBreakdown
    topic_breakdown: TopicBreakdown
    questions: QuestionResult[]
}

export interface QuestionResult {
    question_id: string
    question_text: string | null
    question_image_url: string | null
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: QuestionOption
    user_answer: QuestionOption | null
    is_correct: boolean
    difficulty_level: DifficultyLevel
    category_name: string
    is_bookmarked: boolean
    time_spent_seconds: number
    explanation_text?: string
    explanation_cached?: boolean
}

export interface DifficultyBreakdown {
    easy: DifficultyStats
    medium: DifficultyStats
    hard: DifficultyStats
}

export interface DifficultyStats {
    total: number
    correct: number
    accuracy: number
}

export interface TopicBreakdown {
    [categoryId: string]: TopicStats
}

export interface TopicStats {
    category_id: string
    category_name: string
    total: number
    correct: number
    accuracy: number
}

// API Request/Response types
export interface GenerateExplanationRequest {
    session_id: string
    question_id: string
}

export interface GenerateExplanationResponse {
    explanation: string
    cached: boolean
}

export interface RegenerateExplanationRequest {
    session_id: string
    question_id: string
}

export interface RegenerateExplanationResponse {
    explanation: string
    regenerations_remaining: number
}

export interface ShareResultsResponse {
    share_text: string
    share_url?: string
}

// Analytics types
export interface QuizAnalytics {
    difficulty_analysis: DifficultyAnalysis[]
    topic_analysis: TopicAnalysis[]
    time_analytics: QuestionTimeAnalytics[]
    performance_comparison?: PerformanceComparison
}

export interface DifficultyAnalysis {
    difficulty: DifficultyLevel
    total_questions: number
    correct_answers: number
    accuracy_percentage: number
}

export interface TopicAnalysis {
    category_id: string
    category_name: string
    total_questions: number
    correct_answers: number
    accuracy_percentage: number
}

export interface QuestionTimeAnalytics {
    question_id: string
    time_spent_seconds: number
    is_correct: boolean
}

export interface PerformanceComparison {
    current_score: number
    average_score: number
    percentile: number
    improvement: number
}

// ============================================================================
// AI-POWERED SUGGESTIONS TYPES
// ============================================================================

// Recommendation Types
export interface Recommendation {
    id: string
    priority: 'high' | 'medium' | 'low'
    what: string
    why: string
    how: string[]
    relatedTopics: string[]
}

// Study Plan Types
export interface StudyPlan {
    dailyGoals: DailyGoal[]
    weeklyMilestones: Milestone[]
    focusAreas: FocusArea[]
}

export interface DailyGoal {
    day: string
    topics: string[]
    practiceQuizCount: number
    estimatedTime: number
}

export interface Milestone {
    milestone: string
    targetDate: string
    completed: boolean
}

export interface FocusArea {
    topic: string
    priority: 'high' | 'medium' | 'low'
    reason: string
}

// Practice Suggestion Types
export interface PracticeSuggestion {
    topicId: string
    topicName: string
    currentAccuracy: number
    recommendedDifficulty: DifficultyLevel
    priorityScore: number
    questionCount: number
}

// Motivational Insights
export interface MotivationalInsight {
    type: 'progress' | 'streak' | 'achievement' | 'improvement'
    message: string
    data: Record<string, any>
}

// Suggestions Response
export interface SuggestionsResponse {
    recommendations: Recommendation[]
    studyPlan: StudyPlan
    practiceSuggestions: PracticeSuggestion[]
    motivationalInsights: MotivationalInsight[]
    generatedAt: string
    expiresAt: string
    cached: boolean
}

// Performance Data
export interface PerformanceData {
    userId: string
    overallAccuracy: number
    totalQuizzes: number
    totalQuestions: number
    totalCorrect: number
    avgTimePerQuestion: number
    recentTrend: 'improving' | 'declining' | 'stable'
    weakTopics: TopicPerformanceData[]
    strongTopics: TopicPerformanceData[]
    difficultyPerformance: Record<string, DifficultyPerformanceData>
    timeAnalysis: TimeAnalysisData
}

export interface TopicPerformanceData {
    topic_id: string
    topic_name: string
    accuracy: number
    questions_attempted: number
}

export interface DifficultyPerformanceData {
    accuracy: number
    total: number
    correct: number
}

export interface TimeAnalysisData {
    avg_time_per_question: number
    total_time_spent: number
}

