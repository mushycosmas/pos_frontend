import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// REQUEST INTERCEPTOR
// Attach JWT access token to every API request
// =========================================================

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (accessToken) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// Handle authentication errors
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "Authentication failed:",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;

