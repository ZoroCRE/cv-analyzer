import axios from 'axios';
import { authStorage } from './authStorage';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// This is a simplified refresh logic. In a real app, you'd handle concurrent requests.
let isRefreshing = false;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });
            authStorage.setToken(data.accessToken);
            authStorage.setRefreshToken(data.refreshToken);
            http.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
            return http(originalRequest);
          } catch (refreshError) {
            authStorage.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
            authStorage.clearTokens();
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default http;