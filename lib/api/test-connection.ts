/**
 * Test backend API connection
 * This is a non-blocking diagnostic check
 */
import apiClient from './client';

export async function testBackendConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Use a shorter timeout for health check
    const response = await apiClient.get('/health', { timeout: 5000 });
    return {
      success: true,
      message: 'Backend is reachable',
      details: response.data
    };
  } catch (error: any) {
    // Don't throw - this is just a diagnostic check
    // Alerts might still work even if health check fails
    return {
      success: false,
      message: error.message || 'Health check failed (alerts may still work)',
      details: {
        url: apiClient.defaults.baseURL,
        error: error.response?.data || error.message,
        note: 'This is a diagnostic check. Alerts functionality may still work.'
      }
    };
  }
}

