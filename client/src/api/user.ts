import apiClient from './axios';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: Date | string;
  profile: {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    updatedAt: Date | string | null;
  } | null;
}

export interface ProfileUpdateData {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
}

export interface ProfileUpdateResponse {
  message: string;
  profile: {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    updatedAt: Date | string | null;
  } | null;
}

export interface ApiError {
  status: number | null;
  message: string;
  details?: Record<string, string[]> | null;
}

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/api/user/profile');
  return response.data;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  data: ProfileUpdateData
): Promise<ProfileUpdateResponse> {
  const response = await apiClient.put<ProfileUpdateResponse>(
    '/api/user/profile',
    data
  );
  return response.data;
}

