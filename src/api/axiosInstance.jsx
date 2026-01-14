import axios from 'axios';

import { base_url } from "../api/config";
// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: `${base_url}`,  // Replace with your API base URL
  timeout: 10000, // Optional: Set a timeout for requests
});


axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * RESPONSE: handle auth errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Token issues
    if (status === 401) {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");

      // redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
