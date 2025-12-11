'use client'

import { useState, useEffect } from 'react'
import { AlertsTable } from '@/components/AlertsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAlerts, getAlert } from '@/lib/api/alerts'
import { AlertResponse, AlertStatus } from '@/lib/types/api'
import { supabaseCri as supabase } from '@/lib/supabaseCri'
import { RefreshCw, Filter, AlertCircle } from 'lucide-react'
import { MatchResultCard } from '@/components/MatchResultCard'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<AlertStatus | undefined>(undefined)
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    setLoading(true)
    setConnectionError(null) // Clear previous errors
    try {
      console.log('Fetching alerts with filter:', statusFilter)
      const data = await getAlerts({ status: statusFilter, limit: 100, offset: 0 })
      console.log('Alerts fetched successfully:', data?.length || 0, 'alerts')
      setAlerts(data || [])
      setConnectionError(null) // Clear error on success
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      // Only show connection error if alerts actually fail to load
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        // Check if it's a network error
        if (error.message.includes('Network error') || error.message.includes('Unable to reach')) {
          setConnectionError(error.message)
        }
      }
      // Keep existing alerts if available, don't clear them
      if (alerts.length === 0) {
        setAlerts([]) // Only clear if we have no alerts
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch alerts - this is the main functionality
    fetchAlerts()

    // Subscribe to real-time updates (only if Supabase is configured)
    let subscription: any = null
    try {
      subscription = supabase
        .channel('alerts_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'alerts',
          },
          () => {
            console.log('Real-time alert update received')
            fetchAlerts()
          }
        )
        .subscribe()
    } catch (error) {
      console.warn('Supabase real-time subscription failed:', error)
      // Continue without real-time updates
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [statusFilter])

  const handleViewAlert = async (alert: AlertResponse) => {
    try {
      const fullAlert = await getAlert(alert.alert_id)
      setSelectedAlert(fullAlert)
    } catch (error) {
      console.error('Failed to fetch alert details:', error)
      setSelectedAlert(alert)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Alerts</h1>
          <p className="text-muted-foreground">
            View and manage face matching alerts
          </p>
        </div>
        <Button onClick={fetchAlerts} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {connectionError && alerts.length === 0 && loading === false && (
        <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Backend Connection Error</p>
                <p className="text-sm">{connectionError}</p>
                <p className="text-xs mt-1">
                  Make sure the backend is running on port 8000: 
                  <code className="ml-1 px-1 bg-red-100 dark:bg-red-900 rounded">cd kkd-police-backend-bot && python3 app.py</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by status:</span>
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'Pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'Verified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Verified')}
        >
          Verified
        </Button>
        <Button
          variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Rejected')}
        >
          Rejected
        </Button>
      </div>

      {selectedAlert ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alert Details</CardTitle>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Alert ID:</span>
                  <p className="font-mono">{selectedAlert.alert_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>{selectedAlert.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <p>{selectedAlert.sender_id ? '📱 Telegram Bot' : '🌐 API'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Matches:</span>
                  <p>{selectedAlert.matches.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{new Date(selectedAlert.created_at).toLocaleString()}</p>
                </div>
                {selectedAlert.sender_id && (
                  <div>
                    <span className="text-muted-foreground">Telegram User ID:</span>
                    <p className="font-mono text-xs">{selectedAlert.sender_id}</p>
                  </div>
                )}
              </div>

              {selectedAlert.matches.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Match Results</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedAlert.matches.map((match, index) => (
                      <MatchResultCard
                        key={match.person_id + index}
                        match={match}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading alerts...
              </div>
            ) : (
              <AlertsTable
                alerts={alerts}
                onStatusUpdate={fetchAlerts}
                onView={handleViewAlert}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

