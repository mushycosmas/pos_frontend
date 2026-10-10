
import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// =========================================================
// STORAGE KEYS
// =========================================================

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const CURRENT_BRANCH_KEY = "current_branch";

// =========================================================
// GET CURRENT BRANCH ID
// =========================================================

const getCurrentBranchId = () => {
  try {
    const storedBranch = localStorage.getItem(
      CURRENT_BRANCH_KEY
    );

    if (!storedBranch) {
      return null;
    }

    const branch = JSON.parse(storedBranch);

    if (
      !branch ||
      branch.id === null ||
      branch.id === undefined ||
      String(branch.id).trim() === ""
    ) {
      return null;
    }

    return String(branch.id);
  } catch (error) {
    console.error(
      "Unable to read the current branch:",
      error
    );

    return null;
  }
};

// =========================================================
// REQUEST INTERCEPTOR
// Attach JWT and active branch
// =========================================================

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // -------------------------------------------------------
    // JWT ACCESS TOKEN
    // -------------------------------------------------------

    const accessToken =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    // -------------------------------------------------------
    // ACTIVE BRANCH
    // -------------------------------------------------------
    // The backend must validate that the authenticated user
    // is authorized to access this branch.
    // -------------------------------------------------------

    const branchId = getCurrentBranchId();

    if (branchId) {
      config.headers["X-Branch-ID"] = branchId;
    } else {
      delete config.headers["X-Branch-ID"];
      delete config.headers["x-branch-id"];
    }

    // -------------------------------------------------------
    // CONTENT TYPE
    // -------------------------------------------------------
    // For FormData, let Axios/browser set the multipart
    // content type and boundary automatically.
    // -------------------------------------------------------

    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else if (
      config.data !== undefined &&
      config.data !== null
    ) {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR
// Handle authentication errors
// =========================================================

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    // -------------------------------------------------------
    // SESSION EXPIRED
    // -------------------------------------------------------

    if (
      status === 401 &&
      !isLoggingOut
    ) {
      isLoggingOut = true;

      console.warn(
        "Session expired. Logging out..."
      );

      // Clear authentication data.
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      // Clear the previous user's branch selection.
      localStorage.removeItem(CURRENT_BRANCH_KEY);

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;