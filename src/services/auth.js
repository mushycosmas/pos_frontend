import api from "./api";

// ============================================================
// AUTH STORAGE KEYS
// ============================================================

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// ============================================================
// STORAGE HELPERS
// ============================================================

const getActiveStorage = () => {
  if (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(REFRESH_TOKEN_KEY)
  ) {
    return localStorage;
  }

  if (
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  ) {
    return sessionStorage;
  }

  return null;
};

// ============================================================
// AUTH SERVICE
// ============================================================

const authApi = {

  // ==========================================================
  // LOGIN
  // ==========================================================

  login: async (credentials, rememberMe = false) => {

    const response = await api.post(
      "/auth/login/",
      credentials
    );

    const data = response.data;

    const accessToken =
      data.access || data.access_token;

    const refreshToken =
      data.refresh || data.refresh_token;


    if (!accessToken) {
      throw new Error(
        "Login successful, but no access token was returned."
      );
    }


    // --------------------------------------------------------
    // Clear previous authentication
    // --------------------------------------------------------

    authApi.clearStorage();


    // --------------------------------------------------------
    // Select storage
    // --------------------------------------------------------

    const storage = rememberMe
      ? localStorage
      : sessionStorage;


    // --------------------------------------------------------
    // Save access token
    // --------------------------------------------------------

    storage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );


    // --------------------------------------------------------
    // Save refresh token
    // --------------------------------------------------------

    if (refreshToken) {

      storage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken
      );
    }


    // --------------------------------------------------------
    // Save user
    // --------------------------------------------------------

    if (data.user) {

      storage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
      );
    }


    return data;
  },


  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout: async () => {

    try {

      const refreshToken =
        authApi.getRefreshToken();


      /*
       * This endpoint must exist in Django for
       * server-side token blacklisting.
       */

      if (refreshToken) {

        await api.post(
          "/auth/logout/",
          {
            refresh: refreshToken,
          }
        );
      }

    } catch (error) {

      /*
       * Local logout must still happen even if
       * the backend logout endpoint fails.
       */

      console.warn(
        "Logout API request failed:",
        error
      );

    } finally {

      authApi.clearStorage();

    }

    return true;
  },


  // ==========================================================
  // GET CURRENT USER
  // ==========================================================

  getCurrentUser: async () => {

    const response = await api.get(
      "/auth/me/"
    );

    const user = response.data;

    authApi.setUser(user);

    return user;
  },


  // ==========================================================
  // REFRESH ACCESS TOKEN
  // ==========================================================

  refreshToken: async () => {

    const refreshToken =
      authApi.getRefreshToken();


    if (!refreshToken) {

      throw new Error(
        "No refresh token available."
      );
    }


    const response = await api.post(
      "/auth/refresh/",
      {
        refresh: refreshToken,
      }
    );


    const data = response.data;


    const accessToken =
      data.access || data.access_token;


    if (!accessToken) {

      throw new Error(
        "No access token returned."
      );
    }


    authApi.setAccessToken(
      accessToken
    );


    // --------------------------------------------------------
    // Handle rotated refresh token
    // --------------------------------------------------------

    const newRefreshToken =
      data.refresh || data.refresh_token;


    if (newRefreshToken) {

      authApi.setRefreshToken(
        newRefreshToken
      );
    }


    return data;
  },


  // ==========================================================
  // GET ACCESS TOKEN
  // ==========================================================

  getAccessToken: () => {

    return (
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      ) ||
      sessionStorage.getItem(
        ACCESS_TOKEN_KEY
      )
    );
  },


  // ==========================================================
  // GET REFRESH TOKEN
  // ==========================================================

  getRefreshToken: () => {

    return (
      localStorage.getItem(
        REFRESH_TOKEN_KEY
      ) ||
      sessionStorage.getItem(
        REFRESH_TOKEN_KEY
      )
    );
  },


  // ==========================================================
  // SET ACCESS TOKEN
  // ==========================================================

  setAccessToken: (token) => {

    if (!token) {
      return;
    }


    const storage =
      getActiveStorage();


    if (storage) {

      storage.setItem(
        ACCESS_TOKEN_KEY,
        token
      );

      return;
    }


    // Fallback
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );
  },


  // ==========================================================
  // SET REFRESH TOKEN
  // ==========================================================

  setRefreshToken: (token) => {

    if (!token) {
      return;
    }


    const storage =
      getActiveStorage();


    if (storage) {

      storage.setItem(
        REFRESH_TOKEN_KEY,
        token
      );

      return;
    }


    // Fallback
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      token
    );
  },


  // ==========================================================
  // GET STORED USER
  // ==========================================================

  getUser: () => {

    const user =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY);


    if (!user) {
      return null;
    }


    try {

      return JSON.parse(user);

    } catch (error) {

      console.error(
        "Failed to parse stored user:",
        error
      );

      return null;
    }
  },


  // ==========================================================
  // SET USER
  // ==========================================================

  setUser: (user) => {

    if (!user) {
      return;
    }


    const storage =
      getActiveStorage();


    if (storage) {

      storage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      return;
    }


    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  },


  // ==========================================================
  // IS AUTHENTICATED
  // ==========================================================

  isAuthenticated: () => {

    return Boolean(
      authApi.getAccessToken()
    );
  },


  // ==========================================================
  // CLEAR AUTH STORAGE
  // ==========================================================

  clearStorage: () => {

    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );


    sessionStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    sessionStorage.removeItem(
      REFRESH_TOKEN_KEY
    );

    sessionStorage.removeItem(
      USER_KEY
    );
  },


  // ==========================================================
  // GET USER ROLE
  // ==========================================================

  getRole: () => {

    const user =
      authApi.getUser();

    return user?.role || null;
  },


  // ==========================================================
  // GET USER BRANCH
  // ==========================================================

  getBranch: () => {

    const user =
      authApi.getUser();

    return user?.branch || null;
  },


  // ==========================================================
  // CHECK ROLE
  // ==========================================================

  hasRole: (role) => {

    const user =
      authApi.getUser();


    if (!user) {
      return false;
    }


    return user.role === role;
  },


  // ==========================================================
  // CHECK ANY ROLE
  // ==========================================================

  hasAnyRole: (roles = []) => {

    const user =
      authApi.getUser();


    if (!user) {
      return false;
    }


    return roles.includes(
      user.role
    );
  },
};


export default authApi;