'use client'

// ============================================================================
// Role Manager Component
// ============================================================================

import { useState } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { changeUserRole } from '@/lib/admin/users/queries'

interface RoleManagerProps {
    user: any
    currentAdminId: string
    onUpdate: () => void
}

export function RoleManager({ user, currentAdminId, onUpdate }: RoleManagerProps) {
    const [showModal, setShowModal] = useState(false)
    const [reason, setReason] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const targetRole = user.role === 'admin' ? 'user' : 'admin'

    const handleRoleChange = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for the role change')
            return
        }

        setIsLoading(true)
        try {
            await changeUserRole(user.id, targetRole, reason, currentAdminId)
            setShowModal(false)
            setReason('')
            onUpdate()
        } catch (error) {
            console.error('Error changing role:', error)
            alert('Failed to change role')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className="text-purple-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                    {user.role}
                </span>
            </div>

            <p className="text-gray-600 mb-4">
                Current role: <strong>{user.role}</strong>
            </p>

            <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="w-full"
            >
                {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
            </Button>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <AlertTriangle className="text-orange-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Confirm Role Change
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            You are about to change <strong>{user.name}</strong>'s role from{' '}
                            <strong>{user.role}</strong> to <strong>{targetRole}</strong>.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for change *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Enter reason for role change..."
                            />
                        </div>

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
                                onClick={handleRoleChange}
                                className="flex-1 bg-purple-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Changing...' : 'Confirm Change'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
