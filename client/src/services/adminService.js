import { apiRequest } from './api';

export const adminService = {
  // Get admin stats & analytics
  getStats: async () => {
    return await apiRequest('/api/admin/stats');
  },

  // Get items list for moderation
  getItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/items${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  // Moderate item (flag, note, status)
  moderateItem: async (id, moderationData) => {
    return await apiRequest(`/api/admin/items/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify(moderationData)
    });
  },

  // Admin delete item
  deleteItem: async (id) => {
    return await apiRequest(`/api/admin/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Get users list
  getUsers: async () => {
    return await apiRequest('/api/admin/users');
  }
};
