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

export const batchRegisterUsers = (credentials) => API.post('auth/register/batch', credentials);


export const getProfile = () => API.get('/me');

export const getAllUsers = () => API.get('/user?limit=100&page=1');

export const getUserEquipment = () => API.get('equipment/logged?limit=100&page=1');

export const getAttendanceQR = (data) => API.get(`/attendance/${data.user}/in/code`);

export const getVoucherQR = (data) => API.get(`/voucher/${data.user}/code`);

export const getAttendanceOutQR = (data) => API.get(`/attendance/${data.user}/out/code`);

export const getUserLocationHistory = (params) => API.get(`/location/${params.user}?date=${params.date}`);

export const getUserAttendanceHistory = (params) => API.get(`user/${params.user}/history?limit=100&page=1`);

