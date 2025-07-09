import axios from 'axios';

// Create an instance of axios that will work with the Vite proxy
const instance = axios.create({
  // No baseURL needed when using Vite proxy
  withCredentials: true
});

// Add request interceptor for debugging
instance.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
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
