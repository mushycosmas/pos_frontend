import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import authApi from "../services/auth";


// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);


// ============================================================
// AUTH PROVIDER
// ============================================================

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const [user, setUser] = useState(
    () => authApi.getUser()
  );

  const [accessToken, setAccessToken] = useState(
    () => authApi.getAccessToken()
  );

  const [loading, setLoading] = useState(true);


  // ==========================================================
  // INITIALIZE AUTH
  // ==========================================================

  useEffect(() => {

    const initializeAuth = async () => {

      try {

        const token =
          authApi.getAccessToken();

        const storedUser =
          authApi.getUser();


        // ----------------------------------------------------
        // No token = not authenticated
        // ----------------------------------------------------

        if (!token) {

          setUser(null);
          setAccessToken(null);

          return;
        }


        // ----------------------------------------------------
        // Token exists
        // ----------------------------------------------------

        setAccessToken(token);


        // ----------------------------------------------------
        // Load stored user
        // ----------------------------------------------------

        if (storedUser) {

          setUser(storedUser);

        }


        /*
         * Optional:
         *
         * If your backend has /auth/me/,
         * we can verify the current user here.
         *
         * This is intentionally enabled because
         * your authApi already provides getCurrentUser().
         */

        try {

          const currentUser =
            await authApi.getCurrentUser();

          if (currentUser) {

            setUser(currentUser);

          }

        } catch (error) {

          console.warn(
            "Could not verify current user:",
            error
          );

          /*
           * Do NOT immediately logout here.
           *
           * The stored authentication can still be
           * valid if /auth/me/ has not been implemented.
           */
        }

      } catch (error) {

        console.error(
          "Failed to initialize authentication:",
          error
        );

      } finally {

        setLoading(false);

      }
    };


    initializeAuth();

  }, []);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    credentials,
    rememberMe = false
  ) => {

    try {

      const data =
        await authApi.login(
          credentials,
          rememberMe
        );


      // ------------------------------------------------------
      // Update React state
      // ------------------------------------------------------

      const token =
        authApi.getAccessToken();

      const loggedInUser =
        authApi.getUser();


      setAccessToken(token);
      setUser(loggedInUser);


      return {
        success: true,
        data,
        user: loggedInUser,
      };

    } catch (error) {

      console.error(
        "Login failed:",
        error
      );


      let message =
        "Login failed. Please try again.";


      if (error.response?.data?.detail) {

        message =
          error.response.data.detail;

      } else if (error.response?.data?.message) {

        message =
          error.response.data.message;

      } else if (error.message) {

        message =
          error.message;

      }


      return {
        success: false,
        error: message,
      };
    }
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {

    try {

      await authApi.logout();

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    } finally {

      // ------------------------------------------------------
      // Always clear React state
      // ------------------------------------------------------

      setUser(null);
      setAccessToken(null);


      // ------------------------------------------------------
      // Redirect to login
      // ------------------------------------------------------

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  };


  // ==========================================================
  // REFRESH ACCESS TOKEN
  // ==========================================================

  const refreshToken = async () => {

    try {

      const data =
        await authApi.refreshToken();


      const token =
        authApi.getAccessToken();


      setAccessToken(token);


      return {
        success: true,
        data,
      };

    } catch (error) {

      console.error(
        "Token refresh failed:",
        error
      );


      // ------------------------------------------------------
      // Refresh failed = authentication is no longer valid
      // ------------------------------------------------------

      authApi.clearStorage();

      setUser(null);
      setAccessToken(null);


      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Session expired.",
      };
    }
  };


  // ==========================================================
  // REFRESH CURRENT USER
  // ==========================================================

  const refreshUser = async () => {

    try {

      const currentUser =
        await authApi.getCurrentUser();


      setUser(currentUser);


      return {
        success: true,
        user: currentUser,
      };

    } catch (error) {

      console.error(
        "Failed to refresh user:",
        error
      );


      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to load user.",
      };
    }
  };


  // ==========================================================
  // ROLE HELPERS
  // ==========================================================

  const hasRole = (role) => {

    if (!user) {
      return false;
    }

    return user.role === role;
  };


  const hasAnyRole = (roles = []) => {

    if (!user) {
      return false;
    }

    return roles.includes(
      user.role
    );
  };


  // ==========================================================
  // GET ROLE
  // ==========================================================

  const getRole = () => {

    return user?.role || null;
  };


  // ==========================================================
  // GET BRANCH
  // ==========================================================

  const getBranch = () => {

    return user?.branch || null;
  };


  // ==========================================================
  // AUTHENTICATION STATUS
  // ==========================================================

  const isAuthenticated =
    Boolean(
      accessToken
    );


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    // --------------------------------------------------------
    // User
    // --------------------------------------------------------

    user,

    setUser,


    // --------------------------------------------------------
    // Token
    // --------------------------------------------------------

    accessToken,


    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    isAuthenticated,

    loading,


    // --------------------------------------------------------
    // Authentication actions
    // --------------------------------------------------------

    login,

    logout,

    refreshToken,

    refreshUser,


    // --------------------------------------------------------
    // Role
    // --------------------------------------------------------

    getRole,

    hasRole,

    hasAnyRole,


    // --------------------------------------------------------
    // Branch
    // --------------------------------------------------------

    getBranch,

  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


// ============================================================
// USE AUTH
// ============================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;
};


export default AuthContext;