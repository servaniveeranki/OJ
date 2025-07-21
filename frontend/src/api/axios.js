import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Use proxy in dev, full URL in prod
  withCredentials: true
});

// Add request interceptor for debugging
instance.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for debugging
instance.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default instance;
