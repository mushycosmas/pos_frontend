
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
        // Load stored user immediately
        // ----------------------------------------------------

        if (storedUser) {

          setUser(storedUser);
        }


        // ----------------------------------------------------
        // Verify and refresh current user
        // ----------------------------------------------------

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
           * We don't immediately logout here.
           *
           * The API interceptor can handle expired
           * access tokens using the refresh token.
           */
        }

      } catch (error) {

        console.error(
          "Failed to initialize authentication:",
          error
        );

        setUser(null);
        setAccessToken(null);

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
      // Get stored authentication data
      // ------------------------------------------------------

      const token =
        authApi.getAccessToken();

      const loggedInUser =
        authApi.getUser();


      // ------------------------------------------------------
      // Update React state
      // ------------------------------------------------------

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


      /*
       * Refresh current user as well.
       *
       * This is useful because permissions can be
       * changed by an administrator.
       */

      try {

        const currentUser =
          await authApi.getCurrentUser();

        if (currentUser) {

          setUser(currentUser);
        }

      } catch (userError) {

        console.warn(
          "Could not refresh current user:",
          userError
        );
      }


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
      // Refresh failed = authentication expired
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
  // PERMISSION HELPERS
  // ==========================================================

  const getPermissions = () => {

    if (!user) {
      return [];
    }

    return user.permissions || [];
  };


  // ==========================================================
  // CHECK SINGLE PERMISSION
  // ==========================================================

  const hasPermission = (permission) => {

    if (!user || !permission) {
      return false;
    }


    // --------------------------------------------------------
    // Superuser has all permissions
    // --------------------------------------------------------

    if (user.is_superuser) {
      return true;
    }


    // --------------------------------------------------------
    // Check permission
    // --------------------------------------------------------

    return (
      Array.isArray(user.permissions) &&
      user.permissions.includes(permission)
    );
  };


  // ==========================================================
  // CHECK ANY PERMISSION
  // ==========================================================

  const hasAnyPermission = (permissions = []) => {

    if (
      !user ||
      !Array.isArray(permissions)
    ) {
      return false;
    }


    // --------------------------------------------------------
    // Superuser has all permissions
    // --------------------------------------------------------

    if (user.is_superuser) {
      return true;
    }


    if (!Array.isArray(user.permissions)) {
      return false;
    }


    return permissions.some(
      (permission) =>
        user.permissions.includes(permission)
    );
  };


  // ==========================================================
  // CHECK ALL PERMISSIONS
  // ==========================================================

  const hasAllPermissions = (permissions = []) => {

    if (
      !user ||
      !Array.isArray(permissions)
    ) {
      return false;
    }


    // --------------------------------------------------------
    // Superuser has all permissions
    // --------------------------------------------------------

    if (user.is_superuser) {
      return true;
    }


    if (!Array.isArray(user.permissions)) {
      return false;
    }


    return permissions.every(
      (permission) =>
        user.permissions.includes(permission)
    );
  };


  // ==========================================================
  // AUTHENTICATION STATUS
  // ==========================================================

  const isAuthenticated =
    Boolean(accessToken);


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


    // --------------------------------------------------------
    // Permissions
    // --------------------------------------------------------

    getPermissions,

    hasPermission,

    hasAnyPermission,

    hasAllPermissions,

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

