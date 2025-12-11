'use client'

import { useState } from 'react'
import { UploadCard } from '@/components/UploadCard'
import { MatchResultCard } from '@/components/MatchResultCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { matchFace } from '@/lib/api/match'
import { MatchResponse } from '@/lib/types/api'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { ToastContainer, Toast, ToastProps } from '@/components/ui/toast'

export default function MatchPage() {
  const [file, setFile] = useState<File | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState(80.0)
  const [createAlert, setCreateAlert] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts([...toasts, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleMatch = async () => {
    if (!file) {
      addToast({
        title: 'Error',
        description: 'Please select an image to match',
        variant: 'error',
      })
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const matchResult = await matchFace(
        file,
        5, // Default max results
        similarityThreshold,
        createAlert
      )

      setResult(matchResult)

      if (matchResult.matches.length > 0) {
        addToast({
          title: 'Match Found',
          description: `Found ${matchResult.matches.length} match(es)`,
          variant: 'success',
        })
      } else {
        addToast({
          title: 'No Matches',
          description: 'No matching faces found in the database',
          variant: 'warning',
        })
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to match face',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Face Matching</h1>
        <p className="text-muted-foreground">
          Upload an image to search for matching faces in the criminal database
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <UploadCard
            onFileSelect={setFile}
            selectedFile={file}
            accept="image/*"
            maxSizeMB={10}
          />

          <Card>
            <CardHeader>
              <CardTitle>Match Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Similarity Threshold (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 80.0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Tip for officers:</strong> Reduce threshold (e.g., 60-70%) to get more related images and potential matches. Increase threshold (e.g., 85-95%) to get only highly accurate, precise matches.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-alert"
                  checked={createAlert}
                  onChange={(e) => setCreateAlert(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="create-alert" className="text-sm">
                  Create alert for matches
                </label>
              </div>

              <Button
                onClick={handleMatch}
                disabled={loading || !file}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Faces
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Match Results
                  {result.processing_time_ms && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({result.processing_time_ms.toFixed(0)}ms)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.matches.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Found {result.total_matches} match(es), showing top {result.matches.length}
                    </div>
                    <div className="grid gap-4">
                      {result.matches.map((match, index) => (
                        <MatchResultCard
                          key={match.person_id + index}
                          match={match}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matches found</p>
                    <p className="text-sm mt-2">
                      Try lowering the similarity threshold or ensure the image contains a clear face
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

