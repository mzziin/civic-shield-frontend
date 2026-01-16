import api from './api';

export const evacuationApi = {
  // Calculate evacuation routes
  calculateRoutes: async (latitude, longitude) => {
    const response = await api.post('/evacuation/calculate', {
      latitude,
      longitude
    });
    return response.data;
  },
  
  // Check if user is in danger
  checkDangerStatus: async (latitude, longitude) => {
    const response = await api.post('/evacuation/check-danger', {
      latitude,
      longitude
    });
    return response.data;
  }
};
