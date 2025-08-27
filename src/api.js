import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
export const login = (credentials) => API.post('/auth/admin/login', credentials);

export const batchRegisterUsers = (credentials) => API.post('/auth/register/batch', credentials);

export const batchAddEquipments = (data) => API.post('/equipment/batch', data);


export const getProfile = () => API.get('/me');

export const getAllUsers = () => API.get('/user?limit=100&page=1');

export const getUserEquipment = () => API.get('/equipment/logged?limit=100&page=1');

export const getAllEquipment = () => API.get('/equipment?limit=100&page=1');

export const getAttendanceQR = (data) => API.get(`/attendance/${data.user}/in/code`);

export const getVoucherQR = (data) => API.get(`/voucher/${data.user}/code`);

export const getAttendanceOutQR = (data) => API.get(`/attendance/${data.user}/out/code`);

export const getUserLocationHistory = (params) => API.get(`/location/${params.user}?date=${params.date}`);

export const getUserAttendanceHistory = (params) => API.get(`/attendance/${params.user}/history?limit=100&page=1`);

export const deleteAllUsers = () => API.delete('/user/staffs');

export const deleteEquipmentLogs = () => API.delete('/internal/equipment-logs');



export const getAttendanceData = (date) => API.get(`/attendance?date=${date}`);
export const exportAttendance = (date) => API.get(`/attendance/export?date=${date}`, { responseType: "blob" });
export const exportLocation = (data) => API.get(`/location/${data.user}/export?date=${data.date}`, { responseType: "blob" });
