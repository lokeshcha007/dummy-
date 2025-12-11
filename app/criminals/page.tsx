'use client'

import { useState, useEffect, useRef } from 'react'
import { CriminalRow } from '@/components/CriminalRow'
import { EditCriminalModal } from '@/components/EditCriminalModal'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table'
import { getCriminals, getUniqueStates, getDistrictsByState } from '@/lib/api/criminals'
import { updateCriminal } from '@/lib/api/criminals'
import { CriminalResponse } from '@/lib/types/api'
import { Search, Loader2, Filter, X } from 'lucide-react'

export default function CriminalsPage() {
  const [criminals, setCriminals] = useState<CriminalResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  // Filter states
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  
  // Options for filters
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [crimeTypes, setCrimeTypes] = useState<string[]>([])
  
  // Edit modal state
  const [editingCriminal, setEditingCriminal] = useState<CriminalResponse | null>(null)
  
  
  const filterOptionsLoadedRef = useRef(false)
  const fetchCriminalsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const limit = 20

  // Fetch unique values for filters
  useEffect(() => {
    
    if (filterOptionsLoadedRef.current) return
    
    const loadFilterOptions = async () => {
      try {
        filterOptionsLoadedRef.current = true
        const allCriminals = await getCriminals({ limit: 1000 })
        
        
        const uniqueStates = new Set<string>()
        const uniqueTypes = new Set<string>()
        
        allCriminals.forEach(c => {
          if (c.state) uniqueStates.add(c.state)
          if (c.crime_type) uniqueTypes.add(c.crime_type)
        })
        
        setStates(Array.from(uniqueStates).sort())
        setCrimeTypes(Array.from(uniqueTypes).sort())
      } catch (error) {
        console.error('Failed to load filter options:', error)
        filterOptionsLoadedRef.current = false 
      }
    }
    loadFilterOptions()
  }, [])

  // Load districts when state changes
  useEffect(() => {
    if (stateFilter) {
      const loadDistricts = async () => {
        try {
          const dists = await getDistrictsByState(stateFilter)
          setDistricts(dists)
        } catch (error) {
          console.error('Failed to load districts:', error)
        }
      }
      loadDistricts()
    } else {
      setDistricts([])
      setDistrictFilter('')
    }
  }, [stateFilter])

  const fetchCriminals = async (reset = false) => {
    if (reset) {
      setPage(0)
      setCriminals([])
    }
    setLoading(true)
    try {
      const data = await getCriminals({ 
        limit, 
        offset: page * limit, 
        search: search || undefined,
        crime_type: crimeTypeFilter || undefined,
        state: stateFilter || undefined,
        district: districtFilter || undefined,
        gender: genderFilter || undefined
      })
      
      // Ensure data is an array
      const criminalsData = Array.isArray(data) ? data : []
      
      if (reset) {
        setCriminals(criminalsData)
      } else {
        setCriminals((prev) => [...prev, ...criminalsData])
      }
      setHasMore(criminalsData.length === limit)
    } catch (error) {
      console.error('Failed to fetch criminals:', error)
      // Set empty array on error to show "No criminals found" message
      if (reset) {
        setCriminals([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
   
    if (fetchCriminalsTimeoutRef.current) {
      clearTimeout(fetchCriminalsTimeoutRef.current)
    }
    
    const timeoutId = setTimeout(() => {
      fetchCriminals(true)
    }, 500) // Debounce search and filters
    
    fetchCriminalsTimeoutRef.current = timeoutId

    return () => {
      if (fetchCriminalsTimeoutRef.current) {
        clearTimeout(fetchCriminalsTimeoutRef.current)
        fetchCriminalsTimeoutRef.current = null
      }
    }
  }, [search, crimeTypeFilter, stateFilter, districtFilter, genderFilter])

  useEffect(() => {
    if (page > 0) {
      fetchCriminals(false)
    }
  }, [page])
  
  const handleEdit = (criminal: CriminalResponse) => {
    setEditingCriminal(criminal)
  }
  
  const handleUpdate = async (updatedData: Partial<CriminalResponse> & { image?: File }) => {
    if (!editingCriminal) return
    
    try {
      await updateCriminal(editingCriminal.person_id, updatedData)
      setEditingCriminal(null)
      // Refresh the list
      fetchCriminals(true)
    } catch (error) {
      console.error('Failed to update criminal:', error)
      throw error
    }
  }
  
  const clearFilters = () => {
    setCrimeTypeFilter('')
    setStateFilter('')
    setDistrictFilter('')
    setGenderFilter('')
  }
  
  const hasActiveFilters = crimeTypeFilter || stateFilter || districtFilter || genderFilter

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Criminal Database</h1>
        <p className="text-muted-foreground">
          Search and view all enrolled criminals
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or person ID..."
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filterss:</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Crime Type Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Crime Type</label>
                <select
                  value={crimeTypeFilter}
                  onChange={(e) => setCrimeTypeFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All Types</option>
                  {crimeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* State Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              {/* District Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  disabled={!stateFilter}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">{stateFilter ? 'All Districts' : 'Select State first'}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              {/* Gender Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && criminals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          Loading criminals...
        </div>
      ) : criminals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No criminals found
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criminals.map((criminal) => (
                    <CriminalRow
                      key={criminal.person_id}
                      criminal={criminal}
                      onEdit={() => handleEdit(criminal)}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Edit Modal */}
      {editingCriminal && (
        <EditCriminalModal
          criminal={editingCriminal}
          onClose={() => setEditingCriminal(null)}
          onSave={handleUpdate}
          states={states}
          districts={districts}
          crimeTypes={crimeTypes}
        />
      )}
    </div>
  )
}

