/**
 * Enrollment API endpoints.
 * 
 * Provides type-safe functions for criminal enrollment operations.
 * Matches backend: kkd_backend_bot/api/face_recognition.py
 */
import apiClient, { ApiError } from './client';
import { EnrollmentResponse } from '../types/api';

/**
 * Single image enrollment.
 * 
 * @param image - Image file to enroll
 * @param name - Criminal name (required)
 * @param personId - Optional person ID (will be generated if not provided)
 * @param crimeType - Optional crime type
 * @param gender - Optional gender (male/female)
 * @param state - Required state
 * @param district - Required district
 * @param ageRange - Required age range
 * @param applyAugmentations - Whether to apply image augmentations (default: false)
 * @returns Promise resolving to enrollment response
 * @throws {ApiError} If the request fails
 */
export const uploadSingleImage = async (
  image: File,
  name: string,
  personId: string | undefined,
  crimeType: string,
  gender: string | undefined,
  state: string,
  district: string,
  ageRange: string,
  applyAugmentations: boolean = false
): Promise<EnrollmentResponse> => {
  // Validate inputs
  if (!image) {
    throw new ApiError('Image file is required', 400);
  }

  if (!name || !name.trim()) {
    throw new ApiError('Name is required', 400);
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];
  if (!validTypes.includes(image.type.toLowerCase())) {
    throw new ApiError(
      'Invalid image type. Supported: JPEG, PNG, BMP, GIF',
      400
    );
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('name', name.trim());
  
  if (personId && personId.trim()) {
    formData.append('person_id', personId.trim());
  }
  
  // Required fields - already validated above
  formData.append('state', state.trim());
  formData.append('district', district.trim());
  formData.append('age_range', ageRange.trim());
  formData.append('crime_type', crimeType.trim());
  
  if (gender && gender.trim()) {
    formData.append('gender', gender.trim().toLowerCase());
  }
  
  formData.append('apply_augmentations', String(applyAugmentations));

  try {
    const response = await apiClient.post<EnrollmentResponse>(
      '/api/v1/enroll/image',
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
    throw new ApiError('Failed to enroll image', 500);
  }
};

/**
 * Multiple images enrollment for one criminal.
 * 
 * @param images - Array of image files to enroll
 * @param name - Criminal name (required)
 * @param personId - Optional person ID (will be generated if not provided)
 * @param crimeType - Optional crime type
 * @param applyAugmentations - Whether to apply image augmentations (default: false)
 * @returns Promise resolving to enrollment response
 * @throws {ApiError} If the request fails
 */
export const uploadMultipleImages = async (
  images: File[],
  name: string,
  personId?: string,
  crimeType?: string,
  applyAugmentations: boolean = false
): Promise<EnrollmentResponse> => {
  // Validate inputs
  if (!images || images.length === 0) {
    throw new ApiError('At least one image is required', 400);
  }

  if (!name || !name.trim()) {
    throw new ApiError('Name is required', 400);
  }

  // Validate file types
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];
  for (const image of images) {
    if (!validTypes.includes(image.type.toLowerCase())) {
      throw new ApiError(
        `Invalid image type: ${image.name}. Supported: JPEG, PNG, BMP, GIF`,
        400
      );
    }
  }

  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });
  
  formData.append('name', name.trim());
  
  if (personId && personId.trim()) {
    formData.append('person_id', personId.trim());
  }
  
  if (crimeType && crimeType.trim()) {
    formData.append('crime_type', crimeType.trim());
  }
  
  formData.append('apply_augmentations', String(applyAugmentations));

  try {
    const response = await apiClient.post<EnrollmentResponse>(
      '/api/v1/enroll/images',
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
    throw new ApiError('Failed to enroll images', 500);
  }
};

/**
 * Bulk enrollment from Excel/CSV file.
 * 
 * @param excelFile - Excel or CSV file with criminal data
 * @param imagesFolderPath - Path to folder containing images (server-side path)
 * @returns Promise resolving to enrollment response
 * @throws {ApiError} If the request fails
 */
export const enrollBulk = async (
  excelFile: File,
  imagesFolderPath?: string
): Promise<EnrollmentResponse> => {
  // Validate inputs
  if (!excelFile) {
    throw new ApiError('Excel/CSV file is required', 400);
  }

  // Validate file type
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = excelFile.name.toLowerCase().substring(
    excelFile.name.lastIndexOf('.')
  );
  
  if (!validExtensions.includes(fileExtension)) {
    throw new ApiError(
      'Invalid file type. Supported: .xlsx, .xls, .csv',
      400
    );
  }

  const formData = new FormData();
  formData.append('excel_file', excelFile);
  
  if (imagesFolderPath && imagesFolderPath.trim()) {
    formData.append('images_folder', imagesFolderPath.trim());
  }

  try {
    const response = await apiClient.post<EnrollmentResponse>(
      '/api/v1/enroll',
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
    throw new ApiError('Failed to enroll from Excel/CSV', 500);
  }
};
