import axios from 'axios';

const AxiosInstance = axios.create({
  // নিশ্চিত করুন যে আপনার XAMPP এর htdocs ফোল্ডারের নাম 'nasirah-mart'
  baseURL: 'http://localhost/nasirah-mart/api-php/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: টোকেন থাকলে সেটি হেডারে যোগ করবে
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

// Response Interceptor: ৪০১ এরর (Unauthorized) হলে লগআউট করাবে
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nm_token');
      localStorage.removeItem('nasirahmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;