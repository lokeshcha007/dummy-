'use client'

/**
 * MatchResultCard Component
 * 
 * Displays a single face match result with image, details, and confidence score.
 * Follows industrial standards with proper error handling and type safety.
 */
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MatchResult } from '@/lib/types/api'
import { getPresignedUrlFromImageUrl } from '@/lib/api/images'
import { ImageIcon, User, AlertTriangle } from 'lucide-react'

interface MatchResultCardProps {
  match: MatchResult
  index: number
  className?: string
}

/**
 * Get confidence color class based on confidence score.
 */
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return 'bg-green-500'
  if (confidence >= 80) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Get confidence label based on confidence score.
 */
const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 95) return 'Very High'
  if (confidence >= 90) return 'High'
  if (confidence >= 80) return 'Medium'
  return 'Low'
}

export function MatchResultCard({ match, index, className }: MatchResultCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(match.image_url || null)
  const [imageError, setImageError] = useState<boolean>(false)
  const [imageLoading, setImageLoading] = useState<boolean>(false)

  /**
   * Load image with presigned URL fallback.
   */
  const loadImage = useCallback(async () => {
    if (!match.image_url || imageUrl) return

    setImageLoading(true)
    try {
      // Try to get presigned URL for better security
      const presignedUrl = await getPresignedUrlFromImageUrl(match.image_url)
      setImageUrl(presignedUrl)
      setImageError(false)
    } catch (error) {
      // Fallback to original URL if presigned URL generation fails
      console.warn('Failed to get presigned URL, using original:', error)
      setImageUrl(match.image_url)
      setImageError(false)
    } finally {
      setImageLoading(false)
    }
  }, [match.image_url, imageUrl])

  useEffect(() => {
    loadImage()
  }, [loadImage])

  /**
   * Handle image load error.
   */
  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoading(false)
  }, [])

  const confidence = match.confidence || 0
  const confidenceColor = getConfidenceColor(confidence)
  const confidenceLabel = getConfidenceLabel(confidence)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Match #{index + 1}</CardTitle>
          <Badge
            variant="outline"
            className={confidence >= 90 ? 'border-green-500 text-green-500' : ''}
          >
            {confidence.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image */}
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
          {imageLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {!imageLoading && imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={match.name || `Match ${index + 1}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{match.name || 'Unknown'}</span>
          </div>
          {match.person_id && (
            <p className="text-sm text-muted-foreground">
              ID: {match.person_id}
            </p>
          )}
          {match.crime_type && (
            <Badge variant="secondary">{match.crime_type}</Badge>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{confidenceLabel}</span>
          </div>
          <Progress value={confidence} className="h-2" />
        </div>

        {/* Low Confidence Warning */}
        {confidence < 80 && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Low confidence - Review recommended</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
