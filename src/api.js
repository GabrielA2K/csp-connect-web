import axios from 'axios';

const API = axios.create({
  baseURL: 'https://checkins-api.onrender.com/api/v1', // Base URL of your backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Get all users
export const getUsers = () => API.get('/users');

// Example: Create a new user
export const createUser = (userData) => API.post('/users', userData);

// Example: Login
export const login = (credentials) => API.post('auth/admin/login', credentials);

export const getProfile = () => API.get('/me');

export const getAllUsers = () => API.get('/user?');

export const getAttendanceQR = (data) => API.get(`/attendance/${data.user}/in/code`, data);