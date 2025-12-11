/**
 * Alerts API endpoints.
 * 
 * Provides type-safe functions for alert management operations.
 * Matches backend: kkd_backend_bot/api/face_recognition.py
 */
import apiClient, { ApiError } from './client';
import { 
  AlertResponse, 
  AlertStatusUpdate, 
  AlertStatus,
  AlertsQueryParams,
  ApiResponse
} from '../types/api';

/**
 * Get all alerts with optional filtering and pagination.
 * 
 * @param params - Query parameters (status, limit, offset)
 * @returns Promise resolving to array of alerts
 * @throws {ApiError} If the request fails
 */
export const getAlerts = async (
  params?: AlertsQueryParams
): Promise<AlertResponse[]> => {
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

  if (params?.status) {
    queryParams.status = params.status;
  }

  try {
    console.log('Fetching alerts from:', '/api/v1/alerts', 'with params:', queryParams)
    const response = await apiClient.get<ApiResponse<AlertResponse[]>>(
      '/api/v1/alerts',
      { params: queryParams }
    );

    console.log('Alerts API response:', response.status, response.data)

    // Handle both wrapped and unwrapped responses
    if (response.data && 'data' in response.data) {
      const alerts = (response.data as ApiResponse<AlertResponse[]>).data
      console.log('Extracted alerts from wrapped response:', alerts?.length || 0)
      return alerts
    }
    const alerts = response.data as AlertResponse[]
    console.log('Using unwrapped response:', alerts?.length || 0)
    return alerts
  } catch (error) {
    console.error('Error fetching alerts:', error)
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve alerts', 500);
  }
};

/**
 * Get specific alert by ID.
 * 
 * @param alertId - Alert identifier
 * @returns Promise resolving to alert data
 * @throws {ApiError} If the request fails or alert not found
 */
export const getAlert = async (alertId: string): Promise<AlertResponse> => {
  if (!alertId || !alertId.trim()) {
    throw new ApiError('alertId is required', 400);
  }

  try {
    const response = await apiClient.get<ApiResponse<AlertResponse>>(
      `/api/v1/alerts/${alertId}`
    );

    // Handle both wrapped and unwrapped responses
    if (response.data && 'data' in response.data) {
      return (response.data as ApiResponse<AlertResponse>).data;
    }
    return response.data as AlertResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to retrieve alert', 500);
  }
};

/**
 * Update alert status.
 * 
 * @param alertId - Alert identifier
 * @param status - New status (Pending, Verified, Rejected)
 * @returns Promise resolving to updated alert data
 * @throws {ApiError} If the request fails
 */
export const updateAlertStatus = async (
  alertId: string,
  status: AlertStatus
): Promise<AlertResponse> => {
  if (!alertId || !alertId.trim()) {
    throw new ApiError('alertId is required', 400);
  }

  const validStatuses: AlertStatus[] = ['Pending', 'Verified', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      400
    );
  }

  try {
    const response = await apiClient.put<ApiResponse<AlertResponse>>(
      `/api/v1/alerts/${alertId}/status`,
      { status } as AlertStatusUpdate
    );

    // Handle both wrapped and unwrapped responses
    if (response.data && 'data' in response.data) {
      return (response.data as ApiResponse<AlertResponse>).data;
    }
    return response.data as AlertResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update alert status', 500);
  }
};
