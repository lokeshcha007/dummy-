'use client'

import { useState, useEffect } from 'react'
import { CriminalResponse } from '@/lib/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X, Upload } from 'lucide-react'
import { getDistrictsByState } from '@/lib/api/criminals'

interface EditCriminalModalProps {
  criminal: CriminalResponse
  onClose: () => void
  onSave: (data: Partial<CriminalResponse> & { image?: File }) => Promise<void>
  states: string[]
  districts: string[]
  crimeTypes: string[]
}

export function EditCriminalModal({
  criminal,
  onClose,
  onSave,
  states: initialStates,
  districts: initialDistricts,
  crimeTypes
}: EditCriminalModalProps) {
  const [name, setName] = useState(criminal.name || '')
  const [crimeType, setCrimeType] = useState(criminal.crime_type || '')
  const [state, setState] = useState(criminal.state || '')
  const [district, setDistrict] = useState(criminal.district || '')
  const [gender, setGender] = useState<string>(criminal.gender || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [districts, setDistricts] = useState<string[]>(initialDistricts)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load districts when state changes
  useEffect(() => {
    if (state) {
      setLoadingDistricts(true)
      getDistrictsByState(state)
        .then(dists => {
          setDistricts(dists)
          // Reset district if it's not in the new list
          if (district && !dists.includes(district)) {
            setDistrict('')
          }
        })
        .catch(err => {
          console.error('Failed to load districts:', err)
          setDistricts([])
        })
        .finally(() => {
          setLoadingDistricts(false)
        })
    } else {
      setDistricts([])
      setDistrict('')
    }
  }, [state])

  // Load initial districts if state is set
  useEffect(() => {
    if (criminal.state && !districts.length) {
      setLoadingDistricts(true)
      getDistrictsByState(criminal.state)
        .then(dists => {
          setDistricts(dists)
        })
        .catch(err => {
          console.error('Failed to load districts:', err)
        })
        .finally(() => {
          setLoadingDistricts(false)
        })
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updateData: Partial<CriminalResponse> & { image?: File } = {}
      
      // Normalize empty strings for comparison
      const normalizeValue = (val: string) => val.trim() || undefined
      
      if (name.trim() !== (criminal.name || '')) {
        updateData.name = name.trim() || undefined
      }
      if (normalizeValue(crimeType) !== normalizeValue(criminal.crime_type || '')) {
        updateData.crime_type = normalizeValue(crimeType)
      }
      if (normalizeValue(state) !== normalizeValue(criminal.state || '')) {
        updateData.state = normalizeValue(state)
      }
      if (normalizeValue(district) !== normalizeValue(criminal.district || '')) {
        updateData.district = normalizeValue(district)
      }
      if (normalizeValue(gender) !== normalizeValue(criminal.gender || '')) {
        updateData.gender = normalizeValue(gender) as 'male' | 'female' | undefined
      }
      if (imageFile) {
        updateData.image = imageFile
      }

      await onSave(updateData)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to update criminal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Criminal</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={criminal.images?.[0] || '/placeholder.svg'} 
                    alt={criminal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {imageFile ? 'Change Image' : 'Upload New Image'}
                    </span>
                  </Button>
                </Label>
                {imageFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {/* Crime Type */}
          <div>
            <Label htmlFor="crime-type">Crime Type</Label>
            <div className="mt-1">
              <Input
                id="crime-type"
                list="crime-types"
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                placeholder="Enter or select crime type"
                className="w-full"
              />
              <datalist id="crime-types">
                {crimeTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          {/* State */}
          <div>
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select State</option>
              {initialStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <Label htmlFor="district">District</Label>
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!state || loadingDistricts}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">
                {loadingDistricts ? 'Loading...' : state ? 'Select District' : 'Select State first'}
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

