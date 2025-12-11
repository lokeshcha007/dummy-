/**
 * Criminals API endpoints.
 * 
 * Provides type-safe functions for criminal data operations.
 * Matches backend: kkd_backend_bot/api/face_recognition.py
 */
import apiClient, { ApiError } from './client';
import { 
  CriminalResponse, 
  CriminalsQueryParams,
  ApiResponse
} from '../types/api';

/**
 * Get all criminals with optional filtering and pagination.
 * 
 * @param params - Query parameters (limit, offset, search)
 * @returns Promise resolving to array of criminals
 * @throws {ApiError} If the request fails
 */
export const getCriminals = async (
  params?: CriminalsQueryParams
): Promise<CriminalResponse[]> => {
  // Validate and normalize parameters
  const limit = params?.limit ?? 100;
  const offset = params?.offset ?? 0;

  if (limit < 1 || limit > 1000) {
    throw new ApiError('limit must be between 1 and 1000', 400);
  }

  if (offset < 0) {
    throw new ApiError('offset must be non-negative', 400);
  }

  const queryParams: Record<string, string | number> = {
    limit,
    offset,
  };

  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.crime_type && params.crime_type.trim()) {
    queryParams.crime_type = params.crime_type.trim();
  }
  if (params?.state && params.state.trim()) {
    queryParams.state = params.state.trim();
  }
  if (params?.district && params.district.trim()) {
    queryParams.district = params.district.trim();
  }
  if (params?.gender && params.gender.trim()) {
    queryParams.gender = params.gender.trim();
  }

  try {
    const response = await apiClient.get<ApiResponse<CriminalResponse[]>>(
      '/api/v1/criminals',
      { params: queryParams }
    );

    // Handle both wrapped and unwrapped responses
    if (response.data && 'data' in response.data) {
      return (response.data as ApiResponse<CriminalResponse[]>).data;
    }
    return response.data as CriminalResponse[];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve criminals', 500);
  }
};

/**
 * Get specific criminal by person_id.
 * 
 * @param personId - Criminal person identifier
 * @returns Promise resolving to criminal data
 * @throws {ApiError} If the request fails or criminal not found
 */
export const getCriminal = async (
  personId: string
): Promise<CriminalResponse> => {
  if (!personId || !personId.trim()) {
    throw new ApiError('personId is required', 400);
  }

  try {
    const response = await apiClient.get<ApiResponse<CriminalResponse>>(
      `/api/v1/criminals/${personId.trim()}`
    );

    // Handle both wrapped and unwrapped responses
    if (response.data && 'data' in response.data) {
      return (response.data as ApiResponse<CriminalResponse>).data;
    }
    return response.data as CriminalResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve criminal', 500);
  }
};

/**
 * Get all unique states from the database.
 * Uses backend service method via criminals API.
 * 
 * @returns Promise resolving to array of unique state names
 * @throws {ApiError} If the request fails
 */
export const getUniqueStates = async (): Promise<string[]> => {
  try {
    // Get all criminals and extract unique states
    const criminals = await getCriminals({ limit: 1000 });
    const states = new Set<string>();
    
    criminals.forEach(criminal => {
      // @ts-ignore - state might not be in type definition
      if (criminal.state && typeof criminal.state === 'string') {
        states.add(criminal.state);
      }
    });
    
    return Array.from(states).sort();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve states', 500);
  }
};

/**
 * Get districts for a specific state.
 * Uses backend service method via criminals API.
 * 
 * @param state - State name
 * @returns Promise resolving to array of district names
 * @throws {ApiError} If the request fails
 */
export const getDistrictsByState = async (state: string): Promise<string[]> => {
  if (!state || !state.trim()) {
    return [];
  }
  
  try {
    // Get all criminals and filter by state to get districts
    const criminals = await getCriminals({ limit: 1000 });
    const districts = new Set<string>();
    
    criminals.forEach(criminal => {
      // @ts-ignore - state and district might not be in type definition
      if (criminal.state === state && criminal.district && typeof criminal.district === 'string') {
        districts.add(criminal.district);
      }
    });
    
    return Array.from(districts).sort();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve districts', 500);
  }
};

/**
 * Update a criminal record.
 * 
 * @param personId - Criminal person identifier
 * @param updateData - Update data (name, crime_type, state, district, gender, image)
 * @returns Promise resolving to updated criminal data
 * @throws {ApiError} If the request fails
 */
export const updateCriminal = async (
  personId: string,
  updateData: { name?: string; crime_type?: string; state?: string; district?: string; gender?: string; image?: File }
): Promise<CriminalResponse> => {
  if (!personId || !personId.trim()) {
    throw new ApiError('personId is required', 400);
  }

  try {
    const formData = new FormData();
    
    // Add text fields to form data
    if (updateData.name !== undefined) {
      formData.append('name', updateData.name);
    }
    if (updateData.crime_type !== undefined) {
      formData.append('crime_type', updateData.crime_type || '');
    }
    if (updateData.state !== undefined) {
      formData.append('state', updateData.state || '');
    }
    if (updateData.district !== undefined) {
      formData.append('district', updateData.district || '');
    }
    if (updateData.gender !== undefined) {
      formData.append('gender', updateData.gender || '');
    }
    
    // Add image file if provided
    if (updateData.image) {
      formData.append('image', updateData.image);
    }

    const response = await apiClient.put<ApiResponse<CriminalResponse>>(
      `/api/v1/criminals/${personId.trim()}`,
      formData,
      {
        headers: {
          // Let browser set Content-Type with boundary for multipart/form-data
        },
      }
    );

    if (response.data && 'data' in response.data) {
      return (response.data as ApiResponse<CriminalResponse>).data;
    }
    return response.data as CriminalResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update criminal', 500);
  }
};
