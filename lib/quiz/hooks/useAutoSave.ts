'use client'

// ============================================================================
// useAutoSave Hook
// ============================================================================
// Custom hook for auto-saving quiz answers with debouncing and retry logic
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import type { SaveStatus, QuestionOption } from '@/types'
import { debounce } from '../utils/quizHelpers'

interface UseAutoSaveProps {
    sessionId: string
    onSave: (questionId: string, option: QuestionOption) => Promise<void>
    debounceMs?: number
}

interface UseAutoSaveReturn {
    saveStatus: SaveStatus
    saveAnswer: (questionId: string, option: QuestionOption) => void
    retrySave: () => void
    clearStatus: () => void
}

interface PendingSave {
    questionId: string
    option: QuestionOption
}

export function useAutoSave({
    sessionId,
    onSave,
    debounceMs = 500,
}: UseAutoSaveProps): UseAutoSaveReturn {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [failedSave, setFailedSave] = useState<PendingSave | null>(null)
    const saveQueueRef = useRef<PendingSave[]>([])
    const isSavingRef = useRef(false)

    // Process save queue
    const processSaveQueue = useCallback(async () => {
        if (isSavingRef.current || saveQueueRef.current.length === 0) {
            return
        }

        isSavingRef.current = true
        setSaveStatus('saving')

        const save = saveQueueRef.current.shift()!

        try {
            await onSave(save.questionId, save.option)
            setSaveStatus('saved')
            setFailedSave(null)

            // Clear "saved" status after 2 seconds
            setTimeout(() => {
                setSaveStatus('idle')
            }, 2000)
        } catch (error) {
            console.error('Failed to save answer:', error)
            setSaveStatus('error')
            setFailedSave(save)
        } finally {
            isSavingRef.current = false

            // Process next item in queue
            if (saveQueueRef.current.length > 0) {
                setTimeout(processSaveQueue, 100)
            }
        }
    }, [onSave])

    // Debounced save function
    const debouncedSave = useRef(
        debounce((questionId: string, option: QuestionOption) => {
            // Add to queue
            saveQueueRef.current.push({ questionId, option })
            processSaveQueue()
        }, debounceMs)
    ).current

    // Save answer
    const saveAnswer = useCallback(
        (questionId: string, option: QuestionOption) => {
            // Remove any existing saves for this question from queue
            saveQueueRef.current = saveQueueRef.current.filter(
                (save) => save.questionId !== questionId
            )

            // Add new save to queue (debounced)
            debouncedSave(questionId, option)
        },
        [debouncedSave]
    )

    // Retry failed save
    const retrySave = useCallback(() => {
        if (failedSave) {
            saveQueueRef.current.push(failedSave)
            setFailedSave(null)
            setSaveStatus('idle')
            processSaveQueue()
        }
    }, [failedSave, processSaveQueue])

    // Clear status
    const clearStatus = useCallback(() => {
        setSaveStatus('idle')
    }, [])

    return {
        saveStatus,
        saveAnswer,
        retrySave,
        clearStatus,
    }
}
