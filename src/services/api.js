import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API
export const authAPI = {
  sendOTP: (mobileNumber) => api.post('/auth/send-otp', { mobileNumber }),
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// Location API
export const locationAPI = {
  updateLocation: (latitude, longitude) => 
    api.post('/location/update', { latitude, longitude })
};

// Incident API
export const incidentAPI = {
  reportIncident: (latitude, longitude) => 
    api.post('/incidents/report', { latitude, longitude }),
  getDangerZones: () => api.get('/incidents/danger-zones')
};

export default api;
