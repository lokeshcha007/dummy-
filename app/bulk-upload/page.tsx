'use client'

import { useState } from 'react'
import { UploadCard } from '@/components/UploadCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { enrollBulk } from '@/lib/api/enroll'
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { ToastContainer, Toast, ToastProps } from '@/components/ui/toast'

export default function BulkUploadPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [imagesFolderPath, setImagesFolderPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
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

  const handleExcelSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        setExcelFile(file)
      } else {
        addToast({
          title: 'Error',
          description: 'Please select an Excel (.xlsx) or CSV file',
          variant: 'error',
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!excelFile || !imagesFolderPath) {
      addToast({
        title: 'Error',
        description: 'Please select Excel file and provide images folder path',
        variant: 'error',
      })
      return
    }

    setLoading(true)
    setProgress(0)
    try {
      // Simulate progress (actual progress would come from backend)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const result = await enrollBulk(excelFile, imagesFolderPath)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        addToast({
          title: 'Success',
          description: `Bulk enrollment complete! ${result.total_criminals} criminal(s) enrolled, ${result.total_images_indexed} image(s) indexed.`,
          variant: 'success',
        })
        // Reset form
        setExcelFile(null)
        setImagesFolderPath('')
      } else {
        addToast({
          title: 'Error',
          description: result.message || 'Bulk enrollment failed',
          variant: 'error',
        })
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            addToast({
              title: 'Error',
              description: error,
              variant: 'error',
            })
          })
        }
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to process bulk enrollment',
        variant: 'error',
      })
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bulk Enrollment</h1>
        <p className="text-muted-foreground">
          Upload Excel/CSV file with criminal data and images folder path
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Excel/CSV File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {excelFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium">{excelFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(excelFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExcelFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={handleExcelSelect}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('excel-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Excel/CSV File
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Images Folder Path <span className="text-red-500">*</span>
              </label>
              <Input
                value={imagesFolderPath}
                onChange={(e) => setImagesFolderPath(e.target.value)}
                placeholder="/path/to/images/folder"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Absolute path to the folder containing criminal images
              </p>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !excelFile || !imagesFolderPath}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Bulk Enrollment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

