/**
 * Image presigned URL API endpoints.
 * 
 * Provides type-safe functions for generating presigned URLs for S3 images.
 * Matches backend: kkd_backend_bot/api/face_recognition.py
 */
import apiClient, { ApiError } from './client';
import { ImageUrlRequest, ImageUrlResponse } from '../types/api';

/**
 * Generate presigned URL for S3 image.
 * 
 * @param request - Request with s3_key or image_url
 * @returns Promise resolving to presigned URL response
 * @throws {ApiError} If the request fails
 */
export const getPresignedUrl = async (
  request: ImageUrlRequest
): Promise<ImageUrlResponse> => {
  // Validate that at least one parameter is provided
  if (!request.s3_key && !request.image_url) {
    throw new ApiError('Either s3_key or image_url must be provided', 400);
  }

  // Validate s3_key if provided
  if (request.s3_key && !request.s3_key.trim()) {
    throw new ApiError('s3_key cannot be empty', 400);
  }

  // Validate image_url if provided
  if (request.image_url) {
    const trimmedUrl = request.image_url.trim();
    if (!trimmedUrl) {
      throw new ApiError('image_url cannot be empty', 400);
    }
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new ApiError('image_url must be a valid HTTP/HTTPS URL', 400);
    }
  }

  try {
    const response = await apiClient.post<ImageUrlResponse>(
      '/api/v1/images/presigned-url',
      {
        s3_key: request.s3_key?.trim(),
        image_url: request.image_url?.trim(),
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate presigned URL', 500);
  }
};

/**
 * Helper function to get presigned URL from S3 key.
 * 
 * @param s3Key - S3 object key
 * @returns Promise resolving to presigned URL string
 * @throws {ApiError} If the request fails
 */
export const getPresignedUrlFromS3Key = async (
  s3Key: string
): Promise<string> => {
  if (!s3Key || !s3Key.trim()) {
    throw new ApiError('s3Key is required', 400);
  }

  const response = await getPresignedUrl({ s3_key: s3Key.trim() });
  return response.presigned_url;
};

/**
 * Helper function to get presigned URL from image URL.
 * 
 * @param imageUrl - Full S3 image URL
 * @returns Promise resolving to presigned URL string
 * @throws {ApiError} If the request fails
 */
export const getPresignedUrlFromImageUrl = async (
  imageUrl: string
): Promise<string> => {
  if (!imageUrl || !imageUrl.trim()) {
    throw new ApiError('imageUrl is required', 400);
  }

  const response = await getPresignedUrl({ image_url: imageUrl.trim() });
  return response.presigned_url;
};
