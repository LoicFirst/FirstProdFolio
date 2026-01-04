/**
 * Helper function to make authenticated API requests with JWT token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  // Only set Content-Type for JSON if body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle token expiration
  if (response.status === 401 || response.status === 403) {
    try {
      const data = await response.clone().json();
      if (data.error && (data.error.includes('expired') || data.error.includes('Invalid'))) {
        console.warn('[API] Token expired or invalid, clearing session...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_email');
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  return response;
}

/**
 * Helper to handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
