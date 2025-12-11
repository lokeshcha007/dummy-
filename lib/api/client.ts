/**
 * Axios client configuration for Next.js.
 * 
 * Centralized API client with interceptors, error handling, and type safety.
 * Follows industrial standards with proper error handling and logging.
 */
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Next.js uses NEXT_PUBLIC_ prefix for client-side env vars
// Primary source: environment variable (set in Netlify, Vercel, etc.)
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Fallback to staging URL if env is not set
  return 'https://policestaging.codegnan.ai/';
}

const API_BASE_URL = getApiBaseUrl();

// Log API base URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment variable NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  statusCode?: number;
  response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Create configured Axios instance.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding auth tokens and logging.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (check if we're in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.debug('API Request:', config.method?.toUpperCase(), fullUrl, config.params || '');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and logging.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${response.config.baseURL}${response.config.url}`;
      console.debug('API Response:', response.status, fullUrl, 'Data:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors with proper error objects
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { error?: string; detail?: string; message?: string };

      const errorMessage = data?.error || data?.detail || data?.message || error.message;

      switch (status) {
        case 400:
          console.error('Bad Request:', errorMessage);
          throw new ApiError(errorMessage || 'Invalid request', 400, error.response.data);
        case 401:
          console.error('Unauthorized access');
          // Handle unauthorized (e.g., redirect to login)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          throw new ApiError('Unauthorized access', 401, error.response.data);
        case 403:
          console.error('Forbidden:', errorMessage);
          throw new ApiError(errorMessage || 'Access forbidden', 403, error.response.data);
        case 404:
          console.error('Resource not found:', error.config?.url);
          throw new ApiError('Resource not found', 404, error.response.data);
        case 500:
          console.error('Server error:', errorMessage);
          throw new ApiError(errorMessage || 'Internal server error', 500, error.response.data);
        case 503:
          console.error('Service unavailable:', errorMessage);
          throw new ApiError(errorMessage || 'Service temporarily unavailable', 503, error.response.data);
        default:
          console.error('API error:', status, errorMessage);
          throw new ApiError(errorMessage || 'An error occurred', status, error.response.data);
      }
    } else if (error.request) {
      // Network error - no response received
      const apiUrl = API_BASE_URL;
      // Only log as warning, not error, since this might be a transient issue
      console.warn('Network error: No response received from server', {
        url: apiUrl,
        message: 'This may be a transient network issue. If alerts are loading, you can ignore this.',
        error: error.message
      });
      throw new ApiError(
        `Network error: Unable to reach server at ${apiUrl}. Please ensure the backend is running.`,
        0
      );
    } else {
      // Request setup error
      console.error('Request error:', error.message);
      throw new ApiError(error.message || 'Request setup failed', 0);
    }
  }
);

export default apiClient;
