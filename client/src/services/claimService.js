import { apiRequest } from './api';

export const claimService = {
  // Submit new claim
  createClaim: async (claimData) => {
    return await apiRequest('/api/claims', {
      method: 'POST',
      body: JSON.stringify(claimData)
    });
  },

  // Get claims submitted by current user
  getMyClaims: async () => {
    return await apiRequest('/api/claims/mine');
  },

  // Get claims received for current user's items
  getReceivedClaims: async () => {
    return await apiRequest('/api/claims/received');
  },

  // Update claim status (approve, reject, complete)
  updateStatus: async (claimId, status, ownerFeedback = '') => {
    return await apiRequest(`/api/claims/${claimId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ownerFeedback })
    });
  }
};
