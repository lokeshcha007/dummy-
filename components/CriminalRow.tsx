'use client'

/**
 * CriminalRow Component
 * 
 * Displays a single criminal record as a table row with small image and details.
 * Follows industrial standards with proper error handling and type safety.
 */
import { useState, useEffect, useCallback } from 'react'
import { CriminalResponse } from '@/lib/types/api'
import { 
  getPresignedUrlFromS3Key, 
  getPresignedUrlFromImageUrl 
} from '@/lib/api/images'
import { ImageIcon, Edit } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CriminalRowProps {
  criminal: CriminalResponse
  onClick?: () => void
  onEdit?: () => void
}

export function CriminalRow({ criminal, onClick, onEdit }: CriminalRowProps) {
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
   * Format gender display.
   */
  const formatGender = (gender?: string): string => {
    if (!gender) return 'N/A'
    return gender.charAt(0).toUpperCase() + gender.slice(1)
  }

  /**
   * Handle row click.
   */
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  return (
    <TableRow 
      className={onClick ? 'cursor-pointer hover:bg-muted/50' : ''}
      onClick={handleClick}
    >
      {/* Image */}
      <TableCell className="w-16">
        <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
          {imageLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell>
        <span className="font-medium">{criminal.name || 'Unknown'}</span>
      </TableCell>

      {/* ID */}
      <TableCell>
        <span className="font-mono text-sm text-muted-foreground">
          {criminal.person_id || 'N/A'}
        </span>
      </TableCell>

      {/* Type */}
      <TableCell>
        {criminal.crime_type ? (
          <Badge variant="secondary">{criminal.crime_type}</Badge>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>

      {/* State */}
      <TableCell>
        <span className="text-sm">{criminal.state || 'N/A'}</span>
      </TableCell>

      {/* District */}
      <TableCell>
        <span className="text-sm">{criminal.district || 'N/A'}</span>
      </TableCell>

      {/* Gender */}
      <TableCell>
        <span className="text-sm">{formatGender(criminal.gender)}</span>
      </TableCell>
      
      {/* Actions */}
      <TableCell>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

