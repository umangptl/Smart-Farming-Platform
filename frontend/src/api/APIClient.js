import axios from 'axios';

/**
 * A centralized axios instance that automatically attaches the JWT access token
 * from localStorage (or any other storage) to the Authorization header.
 * You can import this client anywhere in your app to make authenticated requests.
 */

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
