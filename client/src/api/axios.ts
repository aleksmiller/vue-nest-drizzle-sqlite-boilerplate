import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        console.error('Unauthorized - session may have expired');
      }

      return Promise.reject({
        status,
        message: data.error || 'An error occurred',
        details: data.details || null,
      });
    } else if (error.request) {
      return Promise.reject({
        status: null,
        message: 'Network error - please check your connection',
        details: null,
      });
    } else {
      return Promise.reject({
        status: null,
        message: error.message || 'An unexpected error occurred',
        details: null,
      });
    }
  }
);

export default apiClient;

