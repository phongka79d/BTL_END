import { API_BASE_URL } from '../config';

/**
 * Shared fetch-based request helper
 * Handles HTTP requests, bearer token insertion, and response parsing.
 * 
 * @param {string} endpoint - The API endpoint path (e.g. '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} The parsed API response
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach bearer token if it exists in localStorage
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Parse response body, fallback to empty object if response is not JSON
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(result.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      error.status = response.status;
      error.errors = result.errors || [];
      error.success = false;
      throw error;
    }

    return result;
  } catch (error) {
    // Handle network errors or server downtime
    if (!error.status) {
      error.message = 'Lỗi mạng: Không thể kết nối đến máy chủ';
    }
    throw error;
  }
};

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
