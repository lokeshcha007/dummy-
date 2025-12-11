'use client'

/**
 * CriminalCard Component
 * 
 * Displays a single criminal record with image and details.
 * Follows industrial standards with proper error handling and type safety.
 */
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CriminalResponse } from '@/lib/types/api'
import { 
  getPresignedUrlFromS3Key, 
  getPresignedUrlFromImageUrl 
} from '@/lib/api/images'
import { ImageIcon, User } from 'lucide-react'

interface CriminalCardProps {
  criminal: CriminalResponse
  onClick?: () => void
  className?: string
}

export function CriminalCard({ criminal, onClick, className }: CriminalCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<boolean>(false)
  const [imageLoading, setImageLoading] = useState<boolean>(false)

  /**
   * Load image with presigned URL fallback.
   */
  const loadImage = useCallback(async () => {
    if (!criminal) return

    setImageLoading(true)
    setImageError(false)

    // Try s3_paths first, then images array
    const s3Path = criminal.s3_paths?.[0]
    const imagePath = criminal.images?.[0]

    try {
      if (s3Path) {
        try {
          const presignedUrl = await getPresignedUrlFromS3Key(s3Path)
          setImageUrl(presignedUrl)
          setImageLoading(false)
          return
        } catch (error) {
          console.warn('Failed to get presigned URL from S3 key:', error)
          // Fall through to try image URL
        }
      }

      if (imagePath) {
        try {
          const presignedUrl = await getPresignedUrlFromImageUrl(imagePath)
          setImageUrl(presignedUrl)
        } catch (error) {
          console.warn('Failed to get presigned URL from image URL, using original:', error)
          // Fallback to original URL
          setImageUrl(imagePath)
        }
      } else {
        setImageUrl(null)
      }
    } catch (error) {
      console.error('Error loading image:', error)
      setImageError(true)
    } finally {
      setImageLoading(false)
    }
  }, [criminal])

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

  /**
   * Handle card click.
   */
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const imageCount = criminal.images?.length || 0

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${className || ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative w-full h-48 bg-muted rounded-t-lg overflow-hidden">
          {imageLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {!imageLoading && imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={criminal.name || 'Criminal'}
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
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{criminal.name || 'Unknown'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {criminal.person_id || 'N/A'}
          </p>
          {criminal.crime_type && (
            <Badge variant="secondary">{criminal.crime_type}</Badge>
          )}
          {imageCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {imageCount} image{imageCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
