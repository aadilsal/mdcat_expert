'use client'

// ============================================================================
// useNetworkStatus Hook
// ============================================================================
// Custom hook for monitoring network connectivity
// ============================================================================

import { useState, useEffect } from 'react'

interface UseNetworkStatusReturn {
    isOnline: boolean
    wasOffline: boolean
}

export function useNetworkStatus(): UseNetworkStatusReturn {
    const [isOnline, setIsOnline] = useState(
        typeof window !== 'undefined' ? navigator.onLine : true
    )
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setWasOffline(true)

            // Clear "was offline" flag after 3 seconds
            setTimeout(() => {
                setWasOffline(false)
            }, 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return { isOnline, wasOffline }
}
