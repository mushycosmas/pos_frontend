import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// =========================================================
// REQUEST INTERCEPTOR
// Attach JWT access token
// =========================================================

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    // -------------------------------------------------------
    // JWT
    // -------------------------------------------------------

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // -------------------------------------------------------
    // CONTENT TYPE
    // -------------------------------------------------------
    //
    // Normal request:
    // application/json
    //
    // File upload:
    // Let browser/Axios set multipart/form-data
    // including the required boundary.
    // -------------------------------------------------------

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
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

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    // -------------------------------------------------------
    // SESSION EXPIRED
    // -------------------------------------------------------

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      console.warn("Session expired. Logging out...");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

