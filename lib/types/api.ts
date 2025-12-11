/**
 * TypeScript types matching backend API responses.
 * 
 * These types ensure type safety between frontend and backend.
 * Follows industrial standards with comprehensive type definitions.
 */

// ==================== Common Types ====================

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  count?: number;
  limit?: number;
  offset?: number;
}

/**
 * Standard API error response.
 */
export interface ApiErrorResponse {
  error: string;
  detail?: string;
  status_code?: number;
}

// ==================== Enrollment Types ====================

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    person_id: string;
    face_id: string;
    image_url: string;
  };
  total_criminals: number;
  total_images_indexed: number;
  errors: string[];
}

// ==================== Match Types ====================

export interface MatchResult {
  person_id: string;
  name: string;
  crime_type?: string;
  confidence: number; // 0-100
  face_id?: string;
  image_url?: string;
  gender?: 'male' | 'female';
  state?: string;
  district?: string;
  age_range?: string;
}

export interface MatchResponse {
  query_image_url: string;
  matches: MatchResult[];
  total_matches: number;
  processing_time_ms?: number;
}

export interface MatchRequest {
  image_url: string;
  max_results?: number; // 1-100, default 5
  similarity_threshold?: number; // 0-100, default 80.0
  create_alert?: boolean;
  sender_id?: string;
}

// ==================== Alert Types ====================

export type AlertStatus = 'Pending' | 'Verified' | 'Rejected';

export interface AlertResponse {
  alert_id: string;
  query_image_url: string;
  matches: MatchResult[];
  sender_id?: string;
  status: AlertStatus;
  created_at: string;
  updated_at?: string;
}

export interface AlertStatusUpdate {
  status: AlertStatus;
}

export interface AlertsQueryParams {
  status?: AlertStatus;
  limit?: number; // 1-1000, default 100
  offset?: number; // >= 0, default 0
}

// ==================== Criminal Types ====================

export interface CriminalResponse {
  person_id: string;
  name: string;
  crime_type?: string;
  gender?: 'male' | 'female';
  state?: string;
  district?: string;
  age_range?: string;
  images: string[];
  s3_paths: string[];
  created_at: string;
  updated_at?: string;
}

export interface CriminalsQueryParams {
  limit?: number; // 1-1000, default 100
  offset?: number; // >= 0, default 0
  search?: string;
  crime_type?: string;
  state?: string;
  district?: string;
  gender?: string;
}

export interface UpdateCriminalRequest {
  name?: string;
  crime_type?: string;
  state?: string;
  district?: string;
  gender?: 'male' | 'female';
  image?: File;
}

// ==================== Image Types ====================

export interface ImageUrlRequest {
  s3_key?: string;
  image_url?: string;
}

export interface ImageUrlResponse {
  presigned_url: string;
  expires_in: number;
  s3_key?: string;
  note?: string;
}

// ==================== Health Check Types ====================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResponse {
  status: HealthStatus;
  aws_rekognition: boolean;
  s3: boolean;
  supabase: boolean;
  timestamp: string;
  errors?: {
    rekognition?: string;
    s3?: string;
    supabase?: string;
  };
}

// ==================== API Error Types ====================

export interface ApiError {
  detail?: string;
  error?: string;
  message?: string;
  status_code?: number;
}
