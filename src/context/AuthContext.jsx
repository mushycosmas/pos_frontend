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
// STORAGE KEY
// ============================================================

const CURRENT_BRANCH_KEY = "current_branch";


// ============================================================
// BRANCH STORAGE HELPERS
// ============================================================

const getStoredBranch = () => {

  try {

    const stored =
      localStorage.getItem(
        CURRENT_BRANCH_KEY
      );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);

  } catch (error) {

    console.error(
      "Failed to read stored branch:",
      error
    );

    localStorage.removeItem(
      CURRENT_BRANCH_KEY
    );

    return null;
  }
};


const saveBranch = (branch) => {

  if (!branch) {

    localStorage.removeItem(
      CURRENT_BRANCH_KEY
    );

    return;
  }

  localStorage.setItem(
    CURRENT_BRANCH_KEY,
    JSON.stringify(branch)
  );
};


const clearStoredBranch = () => {

  localStorage.removeItem(
    CURRENT_BRANCH_KEY
  );
};


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

  const [loading, setLoading] = useState(
    true
  );


  // ==========================================================
  // CURRENT BRANCH
  // ==========================================================

  const [currentBranch, setCurrentBranchState] = useState(
    () => getStoredBranch()
  );


  // ==========================================================
  // AVAILABLE BRANCHES
  // ==========================================================

  const [branches, setBranches] = useState(
    []
  );


  // ==========================================================
  // SET CURRENT BRANCH
  // ==========================================================

  const setCurrentBranch = (branch) => {

    if (!branch) {

      clearStoredBranch();

      setCurrentBranchState(null);

      return;
    }

    setCurrentBranchState(
      branch
    );

    saveBranch(
      branch
    );
  };


  // ==========================================================
  // INITIALIZE DEFAULT BRANCH
  // ==========================================================

  const initializeBranch = (loggedInUser) => {

    if (!loggedInUser) {

      setBranches([]);

      setCurrentBranchState(null);

      clearStoredBranch();

      return;
    }


    // --------------------------------------------------------
    // Get branches from user
    // --------------------------------------------------------

    let userBranches =
      Array.isArray(
        loggedInUser.branches
      )
        ? loggedInUser.branches
        : [];


    // --------------------------------------------------------
    // Backward compatibility
    //
    // Current backend currently returns:
    //
    // branch
    // branch_name
    //
    // So create a temporary branch object from it.
    // --------------------------------------------------------

    if (
      userBranches.length === 0 &&
      loggedInUser.branch
    ) {

      userBranches = [
        {
          id: loggedInUser.branch,
          name:
            loggedInUser.branch_name ||
            "Main Branch",

          code:
            loggedInUser.branch_code ||
            "MAIN",

          is_main:
            loggedInUser.branch_is_main ??
            true,

          is_active: true,
        },
      ];
    }


    // --------------------------------------------------------
    // Save available branches
    // --------------------------------------------------------

    setBranches(
      userBranches
    );


    // --------------------------------------------------------
    // Existing selected branch
    // --------------------------------------------------------

    const storedBranch =
      getStoredBranch();


    // --------------------------------------------------------
    // Check if stored branch is still available
    // --------------------------------------------------------

    if (storedBranch) {

      const validStoredBranch =
        userBranches.find(
          (branch) =>
            Number(branch.id) ===
            Number(storedBranch.id)
        );


      if (validStoredBranch) {

        setCurrentBranchState(
          validStoredBranch
        );

        return;
      }
    }


    // --------------------------------------------------------
    // Find user's default branch
    // --------------------------------------------------------

    const defaultBranch =
      userBranches.find(
        (branch) =>
          branch.is_default === true
      );


    if (defaultBranch) {

      setCurrentBranch(
        defaultBranch
      );

      return;
    }


    // --------------------------------------------------------
    // Find Main Branch
    // --------------------------------------------------------

    const mainBranch =
      userBranches.find(
        (branch) =>
          branch.is_main === true
      );


    if (mainBranch) {

      setCurrentBranch(
        mainBranch
      );

      return;
    }


    // --------------------------------------------------------
    // First available branch
    // --------------------------------------------------------

    if (userBranches.length > 0) {

      setCurrentBranch(
        userBranches[0]
      );

      return;
    }


    // --------------------------------------------------------
    // No branch available
    // --------------------------------------------------------

    clearStoredBranch();

    setCurrentBranchState(
      null
    );
  };


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
        // No token
        // ----------------------------------------------------

        if (!token) {

          setUser(null);

          setAccessToken(null);

          setBranches([]);

          setCurrentBranchState(null);

          clearStoredBranch();

          return;
        }


        // ----------------------------------------------------
        // Token exists
        // ----------------------------------------------------

        setAccessToken(
          token
        );


        // ----------------------------------------------------
        // Load stored user
        // ----------------------------------------------------

        if (storedUser) {

          setUser(
            storedUser
          );

          initializeBranch(
            storedUser
          );
        }


        // ----------------------------------------------------
        // Verify current user
        // ----------------------------------------------------

        try {

          const currentUser =
            await authApi.getCurrentUser();

          if (currentUser) {

            setUser(
              currentUser
            );

            initializeBranch(
              currentUser
            );
          }

        } catch (error) {

          console.warn(
            "Could not verify current user:",
            error
          );

        }

      } catch (error) {

        console.error(
          "Failed to initialize authentication:",
          error
        );

        setUser(null);

        setAccessToken(null);

        setBranches([]);

        setCurrentBranchState(null);

        clearStoredBranch();

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
      // Get authentication data
      // ------------------------------------------------------

      const token =
        authApi.getAccessToken();

      const loggedInUser =
        authApi.getUser();


      // ------------------------------------------------------
      // Update state
      // ------------------------------------------------------

      setAccessToken(
        token
      );

      setUser(
        loggedInUser
      );


      // ------------------------------------------------------
      // Initialize branch
      // ------------------------------------------------------

      initializeBranch(
        loggedInUser
      );


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


      if (
        error.response?.data?.detail
      ) {

        message =
          error.response.data.detail;

      } else if (
        error.response?.data?.message
      ) {

        message =
          error.response.data.message;

      } else if (
        error.message
      ) {

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
      // Clear authentication
      // ------------------------------------------------------

      setUser(null);

      setAccessToken(null);


      // ------------------------------------------------------
      // Clear branches
      // ------------------------------------------------------

      setBranches([]);


      // ------------------------------------------------------
      // Clear current branch
      // ------------------------------------------------------

      setCurrentBranchState(
        null
      );

      clearStoredBranch();


      // ------------------------------------------------------
      // Redirect
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


      setAccessToken(
        token
      );


      // ------------------------------------------------------
      // Refresh current user
      // ------------------------------------------------------

      try {

        const currentUser =
          await authApi.getCurrentUser();

        if (currentUser) {

          setUser(
            currentUser
          );

          initializeBranch(
            currentUser
          );
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


      authApi.clearStorage();

      clearStoredBranch();


      setUser(null);

      setAccessToken(null);

      setBranches([]);

      setCurrentBranchState(null);


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


      setUser(
        currentUser
      );


      initializeBranch(
        currentUser
      );


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
  // GET CURRENT BRANCH
  // ==========================================================

  const getBranch = () => {

    return currentBranch;
  };


  // ==========================================================
  // GET BRANCH ID
  // ==========================================================

  const getBranchId = () => {

    return currentBranch?.id || null;
  };


  // ==========================================================
  // CHECK CURRENT BRANCH
  // ==========================================================

  const isCurrentBranch = (branchId) => {

    if (!currentBranch) {
      return false;
    }

    return (
      Number(currentBranch.id) ===
      Number(branchId)
    );
  };


  // ==========================================================
  // SWITCH BRANCH
  // ==========================================================

  const switchBranch = (branch) => {

    if (!branch) {

      return {
        success: false,
        error: "Branch is required.",
      };
    }


    // --------------------------------------------------------
    // Check branch exists in user's available branches
    // --------------------------------------------------------

    const allowedBranch =
      branches.find(
        (item) =>
          Number(item.id) ===
          Number(branch.id)
      );


    if (!allowedBranch) {

      return {
        success: false,
        error:
          "You are not allowed to access this branch.",
      };
    }


    // --------------------------------------------------------
    // Check active
    // --------------------------------------------------------

    if (
      allowedBranch.is_active === false
    ) {

      return {
        success: false,
        error:
          "This branch is currently inactive.",
      };
    }


    // --------------------------------------------------------
    // Change branch
    // --------------------------------------------------------

    setCurrentBranch(
      allowedBranch
    );


    return {
      success: true,
      branch: allowedBranch,
    };
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

    if (
      !user ||
      !permission
    ) {

      return false;
    }


    if (user.is_superuser) {

      return true;
    }


    return (
      Array.isArray(user.permissions) &&
      user.permissions.includes(
        permission
      )
    );
  };


  // ==========================================================
  // CHECK ANY PERMISSION
  // ==========================================================

  const hasAnyPermission = (
    permissions = []
  ) => {

    if (
      !user ||
      !Array.isArray(permissions)
    ) {

      return false;
    }


    if (user.is_superuser) {

      return true;
    }


    if (
      !Array.isArray(
        user.permissions
      )
    ) {

      return false;
    }


    return permissions.some(
      (permission) =>
        user.permissions.includes(
          permission
        )
    );
  };


  // ==========================================================
  // CHECK ALL PERMISSIONS
  // ==========================================================

  const hasAllPermissions = (
    permissions = []
  ) => {

    if (
      !user ||
      !Array.isArray(permissions)
    ) {

      return false;
    }


    if (user.is_superuser) {

      return true;
    }


    if (
      !Array.isArray(
        user.permissions
      )
    ) {

      return false;
    }


    return permissions.every(
      (permission) =>
        user.permissions.includes(
          permission
        )
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

    branches,

    currentBranch,

    setCurrentBranch,

    switchBranch,

    getBranch,

    getBranchId,

    isCurrentBranch,


    // --------------------------------------------------------
    // Permissions
    // --------------------------------------------------------

    getPermissions,

    hasPermission,

    hasAnyPermission,

    hasAllPermissions,

  };


  return (
    <AuthContext.Provider
      value={value}
    >
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