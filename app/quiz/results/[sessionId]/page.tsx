// ============================================================================
// Quiz Results Page Route
// ============================================================================
// /app/quiz/results/[sessionId]/page.tsx
// ============================================================================

import { QuizResultsPage } from '@/components/quiz/results/QuizResultsPage'

export default async function ResultsPage({
    params,
}: {
    params: Promise<{ sessionId: string }>
}) {
    const { sessionId } = await params

    return <QuizResultsPage sessionId={sessionId} />
}
