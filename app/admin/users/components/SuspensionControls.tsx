'use client'

// ============================================================================
// Suspension Controls Component
// ============================================================================

import { useState } from 'react'
import { Ban, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { suspendUser, reactivateUser } from '@/lib/admin/users/queries'

interface SuspensionControlsProps {
    user: any
    currentAdminId: string
    onUpdate: () => void
}

export function SuspensionControls({ user, currentAdminId, onUpdate }: SuspensionControlsProps) {
    const [showModal, setShowModal] = useState(false)
    const [reason, setReason] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const isSuspended = user.user_suspensions?.some((s: any) => s.is_active)
    const activeSuspension = user.user_suspensions?.find((s: any) => s.is_active)

    const handleSuspend = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for suspension')
            return
        }

        setIsLoading(true)
        try {
            await suspendUser(user.id, reason, currentAdminId)
            setShowModal(false)
            setReason('')
            onUpdate()
        } catch (error) {
            console.error('Error suspending user:', error)
            alert('Failed to suspend user')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReactivate = async () => {
        setIsLoading(true)
        try {
            await reactivateUser(user.id, currentAdminId)
            setShowModal(false)
            onUpdate()
        } catch (error) {
            console.error('Error reactivating user:', error)
            alert('Failed to reactivate user')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isSuspended ? (
                        <Ban className="text-red-600" size={24} />
                    ) : (
                        <CheckCircle className="text-green-600" size={24} />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isSuspended
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {isSuspended ? 'Suspended' : 'Active'}
                </span>
            </div>

            {isSuspended && activeSuspension && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">Suspension Reason:</p>
                    <p className="text-sm text-red-700">{activeSuspension.reason}</p>
                    <p className="text-xs text-red-600 mt-2">
                        Suspended on: {new Date(activeSuspension.suspended_at).toLocaleString()}
                    </p>
                </div>
            )}

            <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className={`w-full ${isSuspended
                        ? 'border-green-600 text-green-600 hover:bg-green-50'
                        : 'border-red-600 text-red-600 hover:bg-red-50'
                    }`}
            >
                {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
            </Button>

            {/* Suspension/Reactivation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${isSuspended ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                <AlertTriangle className={
                                    isSuspended ? 'text-green-600' : 'text-red-600'
                                } size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            {isSuspended
                                ? `You are about to reactivate ${user.name}'s account. They will be able to log in and use the platform again.`
                                : `You are about to suspend ${user.name}'s account. They will not be able to log in or access the platform.`
                            }
                        </p>

                        {!isSuspended && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for suspension *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    rows={3}
                                    placeholder="Enter reason for suspension..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={isSuspended ? handleReactivate : handleSuspend}
                                className={`flex-1 ${isSuspended
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-600 text-white'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : isSuspended ? 'Reactivate' : 'Suspend'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
