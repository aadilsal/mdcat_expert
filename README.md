# MDCAT Expert 🎓

> **AI-Powered MDCAT Preparation Platform** — Practice smarter, not harder.

A comprehensive web application designed to help Pakistani students prepare for the Medical and Dental College Admission Test (MDCAT) with AI-powered features, adaptive quizzes, and detailed performance analytics.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

- **Adaptive Quiz System**
  - 10,000+ MDCAT-style questions across all subjects
  - Category-based filtering (Biology, Chemistry, Physics, English, Logical Reasoning)
  - Difficulty levels (Easy, Medium, Hard)
  - Timed quizzes with auto-submit on timeout
  - Real-time auto-save with offline support

- **AI-Powered Learning**
  - Google Gemini AI explanations for wrong answers
  - Personalized study recommendations
  - Adaptive difficulty based on performance
  - Motivational insights and progress tracking

- **Performance Analytics**
  - Comprehensive dashboard with 12+ metrics
  - Score trends and category-wise performance
  - Strength/weakness analysis
  - Time analytics per question
  - Historical performance tracking

- **Competitive Features**
  - Real-time leaderboard with national rankings
  - Achievement badges and milestones
  - Streak tracking and daily goals
  - Peer comparison analytics

### 👥 User Features

- **Guest Mode**: Try 10 questions without signup
- **User Dashboard**: Personalized learning insights
- **Bookmarking**: Save questions for later review
- **Quiz History**: Track all past attempts
- **Progress Tracking**: Monitor improvement over time

### 🛡️ Admin Features

- **Question Management**: CRUD operations with Excel bulk upload
- **User Management**: View and manage all users
- **Analytics Dashboard**: Platform-wide statistics
- **Category Management**: Organize questions by topics
- **Quiz Management**: Create and manage quiz collections

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (question images)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **Email**: [Resend](https://resend.com/)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **File Upload**: React Dropzone
- **Excel Parsing**: XLSX

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mdcat-expert.git
   cd mdcat-expert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_MAX_TOKENS=1000
   GEMINI_TEMPERATURE=0.7
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up Supabase database**
   
   Run the migrations in order from `supabase/migrations/`:
   ```bash
   # Execute each migration file in Supabase SQL Editor
   # Or use Supabase CLI:
   supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create an admin account**
   - Register a new account at `/register`
   - Update the user role in Supabase:
     ```sql
     UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
     ```

2. **Add question categories**
   - Navigate to `/admin/categories`
   - Add default categories: Biology, Chemistry, Physics, English, Logical Reasoning

3. **Upload questions**
   - Go to `/admin/questions/upload`
   - Use the Excel template to bulk upload questions
   - Or add questions individually

---

## 📁 Project Structure

```
mdcat-expert/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── questions/
│   │   ├── users/
│   │   └── categories/
│   ├── api/                      # API routes
│   │   ├── quiz/
│   │   ├── admin/
│   │   └── auth/
│   ├── dashboard/                # User dashboard
│   ├── quiz/                     # Quiz pages
│   │   ├── [sessionId]/          # Active quiz
│   │   ├── results/              # Quiz results
│   │   └── start/                # Quiz setup
│   ├── leaderboard/              # Leaderboard
│   ├── suggestions/              # AI suggestions
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── auth/                     # Auth components
│   ├── dashboard/                # Dashboard components
│   ├── landing/                  # Landing page sections
│   ├── quiz/                     # Quiz components
│   ├── shared/                   # Shared components
│   ├── suggestions/              # AI suggestions
│   └── ui/                       # UI primitives
├── lib/                          # Utilities and helpers
│   ├── ai/                       # AI service (Gemini)
│   ├── auth/                     # Authentication logic
│   ├── dashboard/                # Dashboard queries
│   ├── quiz/                     # Quiz hooks and utils
│   └── supabase/                 # Supabase client
├── supabase/                     # Database
│   ├── migrations/               # SQL migrations
│   ├── DATABASE_SCHEMA.md        # Schema documentation
│   └── QUICK_REFERENCE.md        # Quick reference
├── types/                        # TypeScript types
│   └── index.ts                  # All type definitions
└── public/                       # Static assets
```

---

## 🗄️ Database Schema

### Core Tables

- **users**: User profiles linked to Supabase Auth
- **question_categories**: Subject categories (Biology, Chemistry, etc.)
- **questions**: Quiz questions with text/image support
- **quizzes**: Quiz collections with metadata
- **quiz_questions**: Many-to-many relationship
- **quiz_sessions**: User quiz attempts
- **user_answers**: Individual question responses
- **bookmarked_questions**: Saved questions
- **quiz_state**: Session state for pause/resume
- **user_analytics**: Aggregated performance metrics

### Views

- **leaderboard**: Real-time user rankings

### Functions

- `calculate_quiz_score(session_id)`: Calculate quiz score
- `update_user_analytics(user_id)`: Update user stats
- `complete_quiz_session(session_id)`: Finalize quiz
- `get_random_questions(category, difficulty, limit)`: Get random questions
- `get_user_quiz_history(user_id)`: Get quiz history

See [DATABASE_SCHEMA.md](./supabase/DATABASE_SCHEMA.md) for complete documentation.

---

## 🔌 API Documentation

### Quiz APIs

#### Start Quiz
```typescript
POST /api/quiz/start
Body: { quiz_id?: string, category_id?: string, difficulty?: string, question_count?: number }
Response: { session_id, quiz, questions, time_limit_minutes }
```

#### Save Answer
```typescript
POST /api/quiz/save-answer
Body: { session_id, question_id, selected_option }
Response: { success: true }
```

#### Submit Quiz
```typescript
POST /api/quiz/submit
Body: { session_id }
Response: { score, accuracy_percentage, time_taken_seconds, ... }
```

#### Get Quiz Results
```typescript
GET /api/quiz/results/[sessionId]
Response: { session, questions, analytics, ai_explanations }
```

### Admin APIs

#### Upload Questions (Excel)
```typescript
POST /api/admin/questions/upload
Body: FormData with Excel file
Response: { success, total_rows, success_count, errors }
```

#### Create Question
```typescript
POST /api/admin/questions
Body: { question_text, options, correct_option, category_id, difficulty }
Response: { question }
```

#### Get Users
```typescript
GET /api/admin/users?page=1&limit=20&search=query
Response: { users, total, page, limit }
```

See individual API route files for complete documentation.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `GEMINI_MODEL` | Gemini model name | ❌ (default: gemini-2.5-flash) |
| `GEMINI_MAX_TOKENS` | Max tokens for AI responses | ❌ (default: 1000) |
| `GEMINI_TEMPERATURE` | AI creativity (0-1) | ❌ (default: 0.7) |
| `NEXT_PUBLIC_APP_URL` | Application URL | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure Supabase**
   - Update `NEXT_PUBLIC_APP_URL` in Supabase Auth settings
   - Add Vercel domain to allowed redirect URLs

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Database Migrations

Run migrations in Supabase SQL Editor or use Supabase CLI:
```bash
supabase db push
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Google Gemini](https://ai.google.dev/) - AI explanations
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

---

## 📞 Support

For support, email support@mdcatexpert.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Video explanations
- [ ] Live classes integration
- [ ] Spaced repetition algorithm
- [ ] Social features (study groups)
- [ ] Predictive MDCAT scoring
- [ ] Integration with MDCAT registration

---

**Built with ❤️ for MDCAT aspirants**
