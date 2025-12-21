import apiClient from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId: string;
}

export interface AuthError {
  status: number | null;
  message: string;
  details?: Record<string, string[]> | null;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return response.data;
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
  return response.data;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/api/auth/sign-out');
  return response.data;
}

