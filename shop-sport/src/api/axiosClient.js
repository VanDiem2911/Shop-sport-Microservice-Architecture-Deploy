import axios from 'axios';

const axiosClient = axios.create({
  // Dùng import.meta.env thay cho process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Giữ nguyên các interceptors bên dưới
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Khớp với key ở trang Login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;