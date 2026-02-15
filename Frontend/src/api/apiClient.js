import axios from 'axios';

// ตั้งค่า Base URL สำหรับทุก API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

// สร้าง axios instance พร้อมค่าตั้งต้น
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: เพิ่ม JWT Token ในทุก request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // ส่งทั้ง Bearer header และ bearer header สำหรับ backward compatibility
    config.headers.bearer = token;
  }
  return config;
});

// Interceptor: จัดการ response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // ถ้า 401 (Unauthorized) - ลบ token และ redirect ไป login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
