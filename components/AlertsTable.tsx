'use client'

/**
 * AlertsTable Component
 * 
 * Displays a table of face recognition alerts with status management.
 * Follows industrial standards with proper error handling and type safety.
 */
import { useState, useCallback } from 'react'
import { AlertResponse, AlertStatus } from '@/lib/types/api'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateAlertStatus } from '@/lib/api/alerts'
import { CheckCircle2, XCircle, Clock, Eye, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api/client'

interface AlertsTableProps {
  alerts: AlertResponse[]
  onStatusUpdate?: () => void
  onView?: (alert: AlertResponse) => void
  onError?: (error: string) => void
}

/**
 * Status badge configuration.
 */
const STATUS_CONFIG: Record<AlertStatus, {
  variant: 'secondary' | 'default' | 'destructive'
  icon: typeof Clock
  color: string
  label: string
}> = {
  Pending: {
    variant: 'secondary',
    icon: Clock,
    color: 'text-yellow-500',
    label: 'Pending'
  },
  Verified: {
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-green-500',
    label: 'Verified'
  },
  Rejected: {
    variant: 'destructive',
    icon: XCircle,
    color: 'text-red-500',
    label: 'Rejected'
  },
}

/**
 * Format date for display.
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Truncate string for display.
 */
const truncateId = (id: string, length: number = 8): string => {
  if (!id || id.length <= length) return id
  return `${id.slice(0, length)}...`
}

export function AlertsTable({ 
  alerts, 
  onStatusUpdate, 
  onView,
  onError 
}: AlertsTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle status update with proper error handling.
   */
  const handleStatusUpdate = useCallback(async (
    alertId: string, 
    status: AlertStatus
  ) => {
    if (!alertId || !status) {
      const errorMsg = 'Alert ID and status are required'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setUpdating(alertId)
    setError(null)

    try {
      await updateAlertStatus(alertId, status)
      onStatusUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update alert status'
      
      console.error('Failed to update alert status:', err)
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setUpdating(null)
    }
  }, [onStatusUpdate, onError])

  /**
   * Get status badge component.
   */
  const getStatusBadge = useCallback((status: AlertStatus) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    )
  }, [])

  /**
   * Handle view action.
   */
  const handleView = useCallback((alert: AlertResponse) => {
    if (onView) {
      onView(alert)
    }
  }, [onView])

  // Empty state
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No alerts found</p>
        <p className="text-sm mt-2">Alerts will appear here when face matches are detected</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const isUpdating = updating === alert.alert_id
              const matchCount = alert.matches?.length || 0

              return (
                <TableRow key={alert.alert_id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {truncateId(alert.alert_id, 8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{matchCount}</span>
                      <span className="text-sm text-muted-foreground">
                        match{matchCount !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.sender_id ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <span className="text-xs">📱 Telegram</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit text-muted-foreground">
                        <span className="text-xs">🌐 API</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(alert.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(alert.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(alert)}
                          disabled={isUpdating}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      {alert.status === 'Pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(alert.alert_id, 'Verified')}
                            disabled={isUpdating}
                            className="text-green-600 hover:text-green-700"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(alert.alert_id, 'Rejected')}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
