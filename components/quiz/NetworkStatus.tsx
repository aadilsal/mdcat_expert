'use client'

// ============================================================================
// NetworkStatus Component
// ============================================================================
// Shows network connectivity status banner
// ============================================================================

import { WifiOff, Wifi } from 'lucide-react'

interface NetworkStatusProps {
    isOnline: boolean
    wasOffline: boolean
}

export function NetworkStatus({ isOnline, wasOffline }: NetworkStatusProps) {
    if (isOnline && !wasOffline) return null

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 ${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white py-2 px-4 text-center text-sm font-medium transition-all duration-300`}>
            <div className="flex items-center justify-center">
                {isOnline ? (
                    <>
                        <Wifi className="w-4 h-4 mr-2" />
                        <span>Connection restored. Your answers are being synced.</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4 mr-2" />
                        <span>No internet connection. Your answers will be saved when connection is restored.</span>
                    </>
                )}
            </div>
        </div>
    )
}
