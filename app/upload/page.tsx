'use client'

import { useState, useEffect } from 'react'
import { UploadCard } from '@/components/UploadCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadSingleImage } from '@/lib/api/enroll'
import { getUniqueStates, getDistrictsByState } from '@/lib/api/criminals'
import { matchFace } from '@/lib/api/match'
import { MatchResult } from '@/lib/types/api'
import { Upload, Loader2 } from 'lucide-react'
import { ToastContainer, Toast, ToastProps } from '@/components/ui/toast'
import { ExistingPersonModal } from '@/components/ExistingPersonModal'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [personId, setPersonId] = useState('')
  const [crimeType, setCrimeType] = useState('')
  const [gender, setGender] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [applyAugmentations, setApplyAugmentations] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [existingMatch, setExistingMatch] = useState<MatchResult | null>(null)
  const [checkingMatch, setCheckingMatch] = useState(false)
  
  // States and districts
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

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

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true)
      try {
        const statesList = await getUniqueStates()
        setStates(statesList)
      } catch (error) {
        console.error('Failed to load states:', error)
        addToast({
          title: 'Warning',
          description: 'Could not load states. You can still enter manually.',
          variant: 'default',
        })
      } finally {
        setLoadingStates(false)
      }
    }
    loadStates()
  }, [])

  // Load districts when state changes
  useEffect(() => {
    if (state) {
      const loadDistricts = async () => {
        setLoadingDistricts(true)
        setDistrict('') // Clear district when state changes
        try {
          const districtsList = await getDistrictsByState(state)
          setDistricts(districtsList)
        } catch (error) {
          console.error('Failed to load districts:', error)
          setDistricts([])
        } finally {
          setLoadingDistricts(false)
        }
      }
      loadDistricts()
    } else {
      setDistricts([])
      setDistrict('')
    }
  }, [state])

  // Check for existing person when image is uploaded
  useEffect(() => {
    if (file) {
      const checkExistingPerson = async () => {
        setCheckingMatch(true)
        setExistingMatch(null)
        try {
          // Match face without creating alert
          const matchResult = await matchFace(
            file,
            1, // maxResults: check only top match
            80.0, // similarityThreshold: 80%
            false // createAlert: don't create alert for this check
          )
          
          // If match found with high confidence, show modal
          if (matchResult.matches && matchResult.matches.length > 0) {
            const topMatch = matchResult.matches[0]
            if (topMatch.confidence >= 80.0) {
              setExistingMatch(topMatch)
            }
          }
        } catch (error) {
          // Silently fail - if matching fails, just proceed
          console.warn('Failed to check for existing person:', error)
        } finally {
          setCheckingMatch(false)
        }
      }
      
      checkExistingPerson()
    } else {
      setExistingMatch(null)
    }
  }, [file])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name || !state || !district || !ageRange || !crimeType) {
      addToast({
        title: 'Error',
        description: 'Please fill in all required fields: Name, State, District, Age Range, and Crime Type',
        variant: 'error',
      })
      return
    }

    setLoading(true)
    try {
      const result = await uploadSingleImage(
        file,
        name,
        personId || undefined,
        crimeType,
        gender || undefined,
        state,
        district,
        ageRange,
        applyAugmentations
      )

      if (result.success) {
        addToast({
          title: 'Success',
          description: `Enrolled successfully! ${result.total_images_indexed} image(s) indexed.`,
          variant: 'success',
        })
        // Reset form
        setFile(null)
        setName('')
        setPersonId('')
        setCrimeType('')
        setGender('')
        setState('')
        setDistrict('')
        setAgeRange('')
      } else {
        addToast({
          title: 'Error',
          description: result.message || 'Enrollment failed',
          variant: 'error',
        })
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Enroll Criminal</h1>
        <p className="text-muted-foreground">
          Upload a single image to enroll a new criminal in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UploadCard
          onFileSelect={setFile}
          selectedFile={file}
          accept="image/*"
          maxSizeMB={10}
          disabled={checkingMatch}
        />

        <Card>
          <CardHeader>
            <CardTitle>Criminal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter criminal name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Person ID (Optional)
                </label>
                <Input
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loadingStates}
                  required
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!state || loadingDistricts}
                  required
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">{state ? (loadingDistricts ? 'Loading...' : 'Select District') : 'Select State first'}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Age Range <span className="text-red-500">*</span>
                </label>
                <Input
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  placeholder="e.g., 25-30, 30-40"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Crime Type <span className="text-red-500">*</span>
                </label>
                <Input
                  value={crimeType}
                  onChange={(e) => setCrimeType(e.target.value)}
                  placeholder="e.g., Theft, Assault"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="augmentations"
                  checked={applyAugmentations}
                  onChange={(e) => setApplyAugmentations(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="augmentations" className="text-sm">
                  Apply image augmentations (slower but improves accuracy)
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !file || !name || !state || !district || !ageRange || !crimeType}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enroll Criminal
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {existingMatch && (
        <ExistingPersonModal
          match={existingMatch}
          onClose={() => {
            setExistingMatch(null)
            setFile(null) // Clear file when user cancels
          }}
          onProceed={() => {
            setExistingMatch(null) // Close modal but keep file
          }}
        />
      )}

      {existingMatch && (
        <ExistingPersonModal
          match={existingMatch}
          onClose={() => {
            setExistingMatch(null)
            setFile(null) // Clear file when user cancels
          }}
          onProceed={() => {
            setExistingMatch(null) // Close modal but keep file
          }}
        />
      )}
    </div>
  )
}

