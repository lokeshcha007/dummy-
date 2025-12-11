'use client'

/**
 * UploadCard Component
 * 
 * Provides drag-and-drop and file input functionality for image uploads.
 * Follows industrial standards with proper validation and error handling.
 */
import { useCallback, useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadCardProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  accept?: string
  maxSizeMB?: number
  className?: string
  disabled?: boolean
}

/**
 * Valid image MIME types.
 */
const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/bmp',
  'image/gif',
  'image/webp'
]

/**
 * Validate file type.
 */
const isValidImageType = (file: File): boolean => {
  return VALID_IMAGE_TYPES.includes(file.type.toLowerCase())
}

/**
 * Format file size for display.
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function UploadCard({
  onFileSelect,
  selectedFile,
  accept = 'image/*',
  maxSizeMB = 10,
  className,
  disabled = false
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Validate file before selection.
   */
  const validateFile = useCallback((file: File): boolean => {
    // Reset error
    setError(null)

    // Check file type
    if (!isValidImageType(file)) {
      setError('Invalid file type. Please select a JPEG, PNG, BMP, GIF, or WebP image.')
      return false
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB. Current size: ${formatFileSize(file.size)}`)
      return false
    }

    // Check if file is empty
    if (file.size === 0) {
      setError('File is empty. Please select a valid image file.')
      return false
    }

    return true
  }, [maxSizeMB])

  /**
   * Handle file selection.
   */
  const handleFile = useCallback((file: File) => {
    if (disabled) {
      setError('Upload is disabled')
      return
    }

    if (validateFile(file)) {
      onFileSelect(file)
      setError(null)
    }
  }, [disabled, validateFile, onFileSelect])

  /**
   * Handle file drop.
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    } else {
      setError('No file detected in drop')
    }
  }, [disabled, handleFile])

  /**
   * Handle drag over.
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  /**
   * Handle drag leave.
   */
  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  /**
   * Handle file input change.
   */
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFile])

  /**
   * Handle remove file.
   */
  const handleRemove = useCallback(() => {
    onFileSelect(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileSelect])

  /**
   * Handle click to select file.
   */
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            selectedFile && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!disabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={disabled}
              />
              <Button
                variant="outline"
                onClick={handleClick}
                disabled={disabled}
              >
                Select File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Max size: {maxSizeMB}MB • Supported: JPEG, PNG, BMP, GIF, WebP
              </p>
            </>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
