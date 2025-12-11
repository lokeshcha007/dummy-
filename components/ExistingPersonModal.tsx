'use client'

import { useState, useEffect } from 'react'
import { X, User, MapPin, Calendar, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MatchResult } from '@/lib/types/api'
import { getCriminal } from '@/lib/api/criminals'
import { CriminalResponse } from '@/lib/types/api'

interface ExistingPersonModalProps {
  match: MatchResult
  onClose: () => void
  onProceed: () => void
}

export function ExistingPersonModal({ match, onClose, onProceed }: ExistingPersonModalProps) {
  const [criminalDetails, setCriminalDetails] = useState<CriminalResponse | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await getCriminal(match.person_id)
        setCriminalDetails(details)
      } catch (error) {
        console.warn('Failed to fetch criminal details:', error)
        // Continue with just match data
      } finally {
        setLoadingDetails(false)
      }
    }
    fetchDetails()
  }, [match.person_id])

  const displayData = criminalDetails || match

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <User className="h-5 w-5" />
            Person Already Exists
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              A person with similar facial features already exists in the database.
              Please review the details below before proceeding.
            </p>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Person ID
                  </label>
                  <p className="text-sm font-mono mt-1">{displayData.person_id}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Name
                  </label>
                  <p className="text-sm font-medium mt-1">{displayData.name}</p>
                </div>


                {displayData.gender && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Gender
                    </label>
                    <p className="text-sm mt-1 capitalize">{displayData.gender}</p>
                  </div>
                )}

                {displayData.state && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      State
                    </label>
                    <p className="text-sm mt-1">{displayData.state}</p>
                  </div>
                )}

                {displayData.district && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      District
                    </label>
                    <p className="text-sm mt-1">{displayData.district}</p>
                  </div>
                )}

                {displayData.age_range && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Age Range
                    </label>
                    <p className="text-sm mt-1">{displayData.age_range}</p>
                  </div>
                )}

                {displayData.crime_type && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Crime Type
                    </label>
                    <p className="text-sm mt-1">{displayData.crime_type}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Match Confidence
                  </label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${match.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{match.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-2">
                  <ImageIcon className="h-3 w-3" />
                  Existing Image
                </label>
                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {match.image_url ? (
                    <img
                      src={match.image_url}
                      alt={displayData.name}
                      className="w-full h-auto object-contain max-h-64"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="p-8 text-center text-muted-foreground">Image not available</div>'
                        }
                      }}
                    />
                  ) : criminalDetails?.images && criminalDetails.images.length > 0 ? (
                    <img
                      src={criminalDetails.images[0]}
                      alt={displayData.name}
                      className="w-full h-auto object-contain max-h-64"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="p-8 text-center text-muted-foreground">Image not available</div>'
                        }
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No image available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onProceed}
              className="flex-1"
            >
              Proceed Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

