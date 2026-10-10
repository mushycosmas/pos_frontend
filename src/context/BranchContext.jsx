import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import branchesApi from "../services/branchesApi";

// ============================================================
// BRANCH CONTEXT
// ============================================================

const BranchContext = createContext(null);

// ============================================================
// STORAGE KEY
// ============================================================

const CURRENT_BRANCH_KEY = "current_branch";

// ============================================================
// STORAGE HELPERS
// ============================================================

const getStoredBranch = () => {
  try {
    const storedBranch =
      localStorage.getItem(CURRENT_BRANCH_KEY);

    if (!storedBranch) {
      return null;
    }

    return JSON.parse(storedBranch);
  } catch (error) {
    console.error(
      "Failed to load stored branch:",
      error
    );

    localStorage.removeItem(
      CURRENT_BRANCH_KEY
    );

    return null;
  }
};

const saveStoredBranch = (branch) => {
  try {
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
  } catch (error) {
    console.error(
      "Failed to save current branch:",
      error
    );
  }
};

const removeStoredBranch = () => {
  try {
    localStorage.removeItem(
      CURRENT_BRANCH_KEY
    );
  } catch (error) {
    console.error(
      "Failed to clear stored branch:",
      error
    );
  }
};

// ============================================================
// NORMALIZE BRANCH
// ============================================================

const normalizeBranch = (branch) => {
  if (!branch) {
    return null;
  }

  return {
    id: branch.id ?? null,

    name:
      branch.name ||
      "Branch",

    code:
      branch.code ||
      "",

    location:
      branch.location ||
      "",

    phone:
      branch.phone ||
      "",

    email:
      branch.email ||
      null,

    is_main:
      Boolean(branch.is_main),

    is_active:
      branch.is_active !== false,

    is_default:
      Boolean(branch.is_default),

    company:
      branch.company ||
      null,

    company_name:
      branch.company_name ||
      null,
  };
};

// ============================================================
// BRANCH PROVIDER
// ============================================================

export const BranchProvider = ({
  children,
}) => {

  const {
    user,
    isAuthenticated,
  } = useAuth();

  // ==========================================================
  // BRANCH STATE
  // ==========================================================

  const [
    branches,
    setBranches,
  ] = useState([]);

  const [
    currentBranch,
    setCurrentBranchState,
  ] = useState(
    () => getStoredBranch()
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  // ==========================================================
  // LOAD BRANCHES FROM BACKEND
  // ==========================================================

  const refreshBranches = useCallback(
    async () => {

      if (!isAuthenticated) {

        setBranches([]);

        setCurrentBranchState(null);

        setError(null);

        removeStoredBranch();

        return [];
      }

      try {

        setLoading(true);

        setError(null);

        console.log(
          "Loading branches from API..."
        );

        const response =
          await branchesApi.getAll();

        console.log(
          "Branches API response:",
          response
        );

        // ====================================================
        // EXTRACT DATA
        // ====================================================

        let data = [];

        // Django REST Framework pagination
        if (
          response &&
          Array.isArray(
            response.results
          )
        ) {
          data =
            response.results;
        }

        // Normal array
        else if (
          Array.isArray(response)
        ) {
          data = response;
        }

        // Single object
        else if (
          response &&
          typeof response ===
            "object"
        ) {
          data = [response];
        }

        // ====================================================
        // NORMALIZE
        // ====================================================

        const normalizedBranches =
          data
            .filter(Boolean)
            .map(normalizeBranch)
            .filter(
              (branch) =>
                branch.id !== null &&
                branch.id !== undefined
            );

        console.log(
          "Available branches:",
          normalizedBranches
        );

        setBranches(
          normalizedBranches
        );

        // ====================================================
        // CURRENT BRANCH
        // ====================================================

        const storedBranch =
          getStoredBranch();

        // ----------------------------------------------------
        // 1. KEEP STORED BRANCH IF STILL AVAILABLE
        // ----------------------------------------------------

        if (storedBranch?.id) {

          const storedMatch =
            normalizedBranches.find(
              (branch) =>
                Number(branch.id) ===
                Number(
                  storedBranch.id
                )
            );

          if (
            storedMatch &&
            storedMatch.is_active
          ) {

            setCurrentBranchState(
              storedMatch
            );

            saveStoredBranch(
              storedMatch
            );

            return normalizedBranches;
          }
        }

        // ----------------------------------------------------
        // 2. USER ASSIGNED BRANCH
        // ----------------------------------------------------

        if (user?.branch) {

          const userBranch =
            normalizedBranches.find(
              (branch) =>
                Number(branch.id) ===
                Number(user.branch)
            );

          if (
            userBranch &&
            userBranch.is_active
          ) {

            setCurrentBranchState(
              userBranch
            );

            saveStoredBranch(
              userBranch
            );

            return normalizedBranches;
          }
        }

        // ----------------------------------------------------
        // 3. DEFAULT BRANCH
        // ----------------------------------------------------

        const defaultBranch =
          normalizedBranches.find(
            (branch) =>
              branch.is_default === true &&
              branch.is_active !== false
          );

        if (defaultBranch) {

          setCurrentBranchState(
            defaultBranch
          );

          saveStoredBranch(
            defaultBranch
          );

          return normalizedBranches;
        }

        // ----------------------------------------------------
        // 4. MAIN BRANCH
        // ----------------------------------------------------

        const mainBranch =
          normalizedBranches.find(
            (branch) =>
              branch.is_main === true &&
              branch.is_active !== false
          );

        if (mainBranch) {

          setCurrentBranchState(
            mainBranch
          );

          saveStoredBranch(
            mainBranch
          );

          return normalizedBranches;
        }

        // ----------------------------------------------------
        // 5. FIRST ACTIVE BRANCH
        // ----------------------------------------------------

        const firstActiveBranch =
          normalizedBranches.find(
            (branch) =>
              branch.is_active !== false
          );

        if (firstActiveBranch) {

          setCurrentBranchState(
            firstActiveBranch
          );

          saveStoredBranch(
            firstActiveBranch
          );

          return normalizedBranches;
        }

        // ----------------------------------------------------
        // NO BRANCH
        // ----------------------------------------------------

        setCurrentBranchState(
          null
        );

        removeStoredBranch();

        return normalizedBranches;

      } catch (err) {

        console.error(
          "Failed to load branches:",
          err
        );

        console.error(
          "Server response:",
          err?.response?.data
        );

        const errorMessage =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load branches.";

        setError(
          errorMessage
        );

        return [];

      } finally {

        setLoading(false);

      }
    },
    [
      isAuthenticated,
      user,
    ]
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    if (!isAuthenticated) {

      setBranches([]);

      setCurrentBranchState(null);

      setError(null);

      removeStoredBranch();

      return;
    }

    refreshBranches();

  }, [
    isAuthenticated,
    refreshBranches,
  ]);

  // ==========================================================
  // SWITCH BRANCH
  // ==========================================================

  const switchBranch = useCallback(
    (branchOrId) => {

      if (!isAuthenticated) {

        return {
          success: false,
          error:
            "You must be logged in to change branch.",
        };
      }

      // ======================================================
      // FIND SELECTED BRANCH
      // ======================================================

      let selectedBranch = null;

      // Branch object
      if (
        typeof branchOrId === "object" &&
        branchOrId !== null
      ) {

        selectedBranch =
          branches.find(
            (branch) =>
              Number(branch.id) ===
              Number(
                branchOrId.id
              )
          );

      }

      // Branch ID
      else {

        selectedBranch =
          branches.find(
            (branch) =>
              Number(branch.id) ===
              Number(branchOrId)
          );
      }

      // ======================================================
      // BRANCH NOT FOUND
      // ======================================================

      if (!selectedBranch) {

        console.error(
          "Branch not found:",
          branchOrId
        );

        return {
          success: false,
          error:
            "You are not allowed to access this branch.",
        };
      }

      // ======================================================
      // INACTIVE BRANCH
      // ======================================================

      if (
        selectedBranch.is_active === false
      ) {

        return {
          success: false,
          error:
            "This branch is currently inactive.",
        };
      }

      // ======================================================
      // ALREADY CURRENT
      // ======================================================

      if (
        Number(
          currentBranch?.id
        ) ===
        Number(
          selectedBranch.id
        )
      ) {

        return {
          success: true,
          changed: false,
          branch:
            selectedBranch,
        };
      }

      // ======================================================
      // SET CURRENT BRANCH
      // ======================================================

      console.log(
        "Switching branch:",
        selectedBranch
      );

      setCurrentBranchState(
        selectedBranch
      );

      saveStoredBranch(
        selectedBranch
      );

      return {
        success: true,
        changed: true,
        branch:
          selectedBranch,
      };

    },
    [
      branches,
      currentBranch,
      isAuthenticated,
    ]
  );

  // ==========================================================
  // SWITCH TO MAIN BRANCH
  // ==========================================================

  const switchToMainBranch =
    useCallback(() => {

      const mainBranch =
        branches.find(
          (branch) =>
            branch.is_main === true &&
            branch.is_active !== false
        );

      if (!mainBranch) {

        return {
          success: false,
          error:
            "Main branch was not found.",
        };
      }

      return switchBranch(
        mainBranch
      );

    }, [
      branches,
      switchBranch,
    ]);

  // ==========================================================
  // SET CURRENT BRANCH
  // ==========================================================

  const setCurrentBranch =
    useCallback(
      (branch) => {

        return switchBranch(
          branch
        );

      },
      [switchBranch]
    );

  // ==========================================================
  // GET CURRENT BRANCH
  // ==========================================================

  const getCurrentBranch =
    useCallback(
      () => currentBranch,
      [currentBranch]
    );

  // ==========================================================
  // GET BRANCH ID
  // ==========================================================

  const getBranchId =
    useCallback(
      () =>
        currentBranch?.id ||
        null,
      [currentBranch]
    );

  // ==========================================================
  // GET BRANCH CODE
  // ==========================================================

  const getBranchCode =
    useCallback(
      () =>
        currentBranch?.code ||
        null,
      [currentBranch]
    );

  // ==========================================================
  // GET BRANCH NAME
  // ==========================================================

  const getBranchName =
    useCallback(
      () =>
        currentBranch?.name ||
        null,
      [currentBranch]
    );

  // ==========================================================
  // CHECK CURRENT BRANCH
  // ==========================================================

  const isCurrentBranch =
    useCallback(
      (branchId) => {

        if (!currentBranch) {
          return false;
        }

        return (
          Number(
            currentBranch.id
          ) ===
          Number(branchId)
        );
      },
      [currentBranch]
    );

  // ==========================================================
  // CHECK MAIN BRANCH
  // ==========================================================

  const isMainBranch =
    useCallback(
      () =>
        Boolean(
          currentBranch?.is_main
        ),
      [currentBranch]
    );

  // ==========================================================
  // ACTIVE BRANCHES
  // ==========================================================

  const activeBranches =
    useMemo(
      () =>
        branches.filter(
          (branch) =>
            branch.is_active !== false
        ),
      [branches]
    );

  // ==========================================================
  // MAIN BRANCH
  // ==========================================================

  const mainBranch =
    useMemo(
      () =>
        branches.find(
          (branch) =>
            branch.is_main === true
        ) || null,
      [branches]
    );

  // ==========================================================
  // MULTIPLE BRANCHES
  // ==========================================================

  const hasMultipleBranches =
    activeBranches.length > 1;

  // ==========================================================
  // CLEAR CURRENT BRANCH
  // ==========================================================

  const clearBranch =
    useCallback(() => {

      setCurrentBranchState(
        null
      );

      removeStoredBranch();

    }, []);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    // --------------------------------------------------------
    // Branch data
    // --------------------------------------------------------

    branches,

    activeBranches,

    mainBranch,

    hasMultipleBranches,

    // --------------------------------------------------------
    // Current branch
    // --------------------------------------------------------

    currentBranch,

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    loading,

    error,

    // --------------------------------------------------------
    // Actions
    // --------------------------------------------------------

    refreshBranches,

    switchBranch,

    switchToMainBranch,

    setCurrentBranch,

    clearBranch,

    // --------------------------------------------------------
    // Getters
    // --------------------------------------------------------

    getCurrentBranch,

    getBranchId,

    getBranchCode,

    getBranchName,

    // --------------------------------------------------------
    // Checks
    // --------------------------------------------------------

    isCurrentBranch,

    isMainBranch,
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <BranchContext.Provider
      value={value}
    >
      {children}
    </BranchContext.Provider>
  );
};

// ============================================================
// USE BRANCH HOOK
// ============================================================

export const useBranch = () => {

  const context =
    useContext(
      BranchContext
    );

  if (!context) {

    throw new Error(
      "useBranch must be used inside BranchProvider"
    );
  }

  return context;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default BranchContext;