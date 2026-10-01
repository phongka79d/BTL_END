import { API_BASE_URL } from '../config.js';

/**
 * Hàm hỗ trợ yêu cầu dùng chung dựa trên fetch
 * Xử lý yêu cầu HTTP, chèn bearer token và phân tích phản hồi.
 * 
 * @param {string} endpoint - Đường dẫn endpoint API (ví dụ '/auth/login')
 * @param {Object} options - Tùy chọn fetch
 * @returns {Promise<Object>} Phản hồi API đã được phân tích
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Gắn bearer token nếu token tồn tại trong localStorage
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
    
    // Phân tích phần thân phản hồi, dùng đối tượng rỗng nếu phản hồi không phải JSON
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
    // Xử lý lỗi mạng hoặc tình trạng máy chủ ngừng hoạt động
    if (!error.status) {
      error.message = 'Lỗi mạng: Không thể kết nối đến máy chủ';
    }
    throw error;
  }
};

const isStockRead = (endpoint) => {
  const path = endpoint.split('?', 1)[0].replace(/\/+$/, '');
  return path === '/cart' || /^\/products(?:\/[^/]+)?$/.test(path);
};

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, {
    ...options,
    method: 'GET',
    ...(isStockRead(endpoint) ? { cache: 'no-store' } : {})
  }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
