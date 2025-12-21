import apiClient from './axios';
import {
  loginCredentialsSchema,
  registerDataSchema,
  authResponseSchema,
  authErrorSchema,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type AuthError,
} from './schemas';

// Re-export types for convenience
export type { LoginCredentials, RegisterData, AuthResponse, AuthError };

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  // Validate input data
  const validatedData = registerDataSchema.parse(data);

  const response = await apiClient.post('/api/auth/register', validatedData);

  // Validate response
  return authResponseSchema.parse(response.data);
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Validate input data
  const validatedCredentials = loginCredentialsSchema.parse(credentials);

  const response = await apiClient.post('/api/auth/login', validatedCredentials);

  // Validate response
  return authResponseSchema.parse(response.data);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/api/auth/sign-out');
  return response.data;
}

/**
 * Parse and validate an auth error from the API
 */
export function parseAuthError(error: unknown): AuthError {
  if (typeof error === 'object' && error !== null) {
    // Check if it's already in the correct format
    if ('status' in error && 'message' in error) {
      try {
        return authErrorSchema.parse(error);
      } catch {
        // If parsing fails, extract what we can
        return {
          status: (error as { status?: number }).status ?? null,
          message: (error as { message?: string }).message || 'An unexpected error occurred',
          details: (error as { details?: Record<string, string[]> }).details || null,
        };
      }
    }

    // Handle Error objects (e.g., from login() throwing new Error())
    if (error instanceof Error) {
      return {
        status: null,
        message: error.message || 'An unexpected error occurred',
        details: null,
      };
    }

    // Try to parse as AuthError
    try {
      return authErrorSchema.parse(error);
    } catch {
      // If parsing fails, return a default error structure
      return {
        status: null,
        message: 'An unexpected error occurred',
        details: null,
      };
    }
  }

  // Handle string errors or other primitives
  return {
    status: null,
    message: String(error) || 'An unexpected error occurred',
    details: null,
  };
}

