'use client'

// ============================================================================
// Alerts Panel Component
// ============================================================================

import { useState } from 'react'
import { AlertTriangle, X, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dismissAlert } from '@/lib/admin/churn/queries'

interface Alert {
    id: string
    alert_type: string
    severity: 'low' | 'medium' | 'high'
    title: string
    message: string
    created_at: string
    users: {
        name: string
        email: string
    }
}

interface AlertsPanelProps {
    alerts: Alert[]
    adminId: string
    onAlertDismissed: () => void
}

export function AlertsPanel({ alerts, adminId, onAlertDismissed }: AlertsPanelProps) {
    const [dismissing, setDismissing] = useState<string | null>(null)

    const handleDismiss = async (alertId: string) => {
        setDismissing(alertId)
        try {
            await dismissAlert(alertId, adminId)
            onAlertDismissed()
        } catch (error) {
            console.error('Error dismissing alert:', error)
        } finally {
            setDismissing(null)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-50 border-red-200 text-red-900'
            case 'medium': return 'bg-orange-50 border-orange-200 text-orange-900'
            case 'low': return 'bg-yellow-50 border-yellow-200 text-yellow-900'
            default: return 'bg-gray-50 border-gray-200 text-gray-900'
        }
    }

    const getSeverityIcon = (severity: string) => {
        const colors = {
            high: 'text-red-600',
            medium: 'text-orange-600',
            low: 'text-yellow-600'
        }
        return colors[severity as keyof typeof colors] || 'text-gray-600'
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                <span className="ml-auto text-sm text-gray-600">{alerts.length} alerts</span>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Bell className="mx-auto mb-2 text-gray-400" size={48} />
                    <p>No active alerts</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle
                                            className={getSeverityIcon(alert.severity)}
                                            size={18}
                                        />
                                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-white rounded-full">
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2">{alert.message}</p>
                                    <div className="text-xs opacity-75">
                                        User: {alert.users.name} ({alert.users.email})
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {new Date(alert.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    disabled={dismissing === alert.id}
                                    className="ml-2 p-1 hover:bg-white rounded transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
