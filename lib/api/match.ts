/**
 * Face matching API endpoints.
 * 
 * Provides type-safe functions for face matching operations.
 * Matches backend: kkd_backend_bot/api/face_recognition.py
 */
import apiClient, { ApiError } from './client';
import { MatchResponse, MatchRequest } from '../types/api';

/**
 * Match face from uploaded image.
 * 
 * @param image - Image file to match
 * @param maxResults - Maximum number of results (1-100, default: 5)
 * @param similarityThreshold - Similarity threshold (0-100, default: 80.0)
 * @param createAlert - Whether to create an alert if matches found (default: true)
 * @param senderId - Optional sender identifier
 * @returns Promise resolving to match response
 * @throws {ApiError} If the request fails
 */
export const matchFace = async (
  image: File,
  maxResults: number = 5,
  similarityThreshold: number = 80.0,
  createAlert: boolean = true,
  senderId?: string
): Promise<MatchResponse> => {
  // Validate inputs
  if (!image) {
    throw new ApiError('Image file is required', 400);
  }

  if (maxResults < 1 || maxResults > 100) {
    throw new ApiError('maxResults must be between 1 and 100', 400);
  }

  if (similarityThreshold < 0 || similarityThreshold > 100) {
    throw new ApiError('similarityThreshold must be between 0 and 100', 400);
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('max_results', String(maxResults));
  formData.append('similarity_threshold', String(similarityThreshold));
  formData.append('create_alert', String(createAlert));
  
  if (senderId) {
    formData.append('sender_id', senderId);
  }

  try {
    const response = await apiClient.post<MatchResponse>(
      '/api/v1/match',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to match face', 500);
  }
};

/**
 * Match face from image URL.
 * 
 * @param request - Match request with image URL and parameters
 * @returns Promise resolving to match response
 * @throws {ApiError} If the request fails
 */
export const matchFaceFromUrl = async (
  request: MatchRequest
): Promise<MatchResponse> => {
  // Validate inputs
  if (!request.image_url || !request.image_url.trim()) {
    throw new ApiError('image_url is required', 400);
  }

  if (!request.image_url.startsWith('http://') && !request.image_url.startsWith('https://')) {
    throw new ApiError('image_url must be a valid HTTP/HTTPS URL', 400);
  }

  if (request.max_results !== undefined) {
    if (request.max_results < 1 || request.max_results > 100) {
      throw new ApiError('max_results must be between 1 and 100', 400);
    }
  }

  if (request.similarity_threshold !== undefined) {
    if (request.similarity_threshold < 0 || request.similarity_threshold > 100) {
      throw new ApiError('similarity_threshold must be between 0 and 100', 400);
    }
  }

  try {
    const response = await apiClient.post<MatchResponse>(
      '/api/v1/match/url',
      request
    );

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to match face from URL', 500);
  }
};
