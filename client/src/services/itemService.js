import { apiRequest } from './api';

export const itemService = {
  // Fetch items with query params (search, type, category, location, status, page)
  getItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/items${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  // Fetch single item details
  getItemById: async (id) => {
    return await apiRequest(`/api/items/${id}`);
  },

  // Create new item (supports FormData for image upload)
  createItem: async (formData) => {
    return await apiRequest('/api/items', {
      method: 'POST',
      body: formData
    });
  },

  // Update item
  updateItem: async (id, formData) => {
    return await apiRequest(`/api/items/${id}`, {
      method: 'PUT',
      body: formData
    });
  },

  // Delete item
  deleteItem: async (id) => {
    return await apiRequest(`/api/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Get current user's reported items
  getMyItems: async () => {
    return await apiRequest('/api/items/mine');
  },

  // Quick status update (e.g. mark resolved)
  updateStatus: async (id, status) => {
    return await apiRequest(`/api/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
