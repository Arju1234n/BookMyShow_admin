import axios from 'axios';

const api = axios.create({
  baseURL: 'https://book-my-show-backend-bejg.vercel.app',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 — skip login route (wrong password also returns 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url === '/admin/login';
    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('adminToken');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
