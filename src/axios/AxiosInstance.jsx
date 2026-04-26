import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: '/api-php/', // Base URL for PHP backend with MySQL persistence
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT token
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle errors
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('nm_token');
      localStorage.removeItem('nasirahmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
