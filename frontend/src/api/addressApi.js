import { apiClient } from './apiClient.js';

const buildAddressQuery = (fields) => {
  const params = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

const getOptions = (signal) => (signal === undefined ? {} : { signal });

export const addressApi = {
  getProvinces: ({ signal } = {}) => apiClient.get('/addresses/provinces', getOptions(signal)),
  getWards: (provinceCode, { signal } = {}) => apiClient.get(
    `/addresses/wards${buildAddressQuery({ provinceCode })}`,
    getOptions(signal)
  )
};
