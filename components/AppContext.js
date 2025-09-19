"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

// Initial state
const initialState = {
  imageUrls: [],
  testType: "CBC (Complete Blood Count)",
  analysis: null,
  isLoading: false,
  error: null,
  isChatOpen: false,
  copiedText: "",
  showSkeleton: false,
  history: [],
  searchQuery: "",
  filterStatus: "all",
};

// Action types
const ACTIONS = {
  SET_IMAGE_URLS: "SET_IMAGE_URLS",
  ADD_IMAGE_URLS: "ADD_IMAGE_URLS",
  REMOVE_IMAGE_URL: "REMOVE_IMAGE_URL",
  CLEAR_IMAGE_URLS: "CLEAR_IMAGE_URLS",
  SET_TEST_TYPE: "SET_TEST_TYPE",
  SET_ANALYSIS: "SET_ANALYSIS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CHAT_OPEN: "SET_CHAT_OPEN",
  SET_COPIED_TEXT: "SET_COPIED_TEXT",
  SET_SHOW_SKELETON: "SET_SHOW_SKELETON",
  SET_HISTORY: "SET_HISTORY",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_FILTER_STATUS: "SET_FILTER_STATUS",
  RESET_ANALYSIS: "RESET_ANALYSIS",
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_IMAGE_URLS:
      return { ...state, imageUrls: action.payload };
    case ACTIONS.ADD_IMAGE_URLS:
      return { ...state, imageUrls: [...state.imageUrls, ...action.payload] };
    case ACTIONS.REMOVE_IMAGE_URL:
      return {
        ...state,
        imageUrls: state.imageUrls.filter(
          (_, index) => index !== action.payload
        ),
      };
    case ACTIONS.CLEAR_IMAGE_URLS:
      return { ...state, imageUrls: [] };
    case ACTIONS.SET_TEST_TYPE:
      return { ...state, testType: action.payload };
    case ACTIONS.SET_ANALYSIS:
      return { ...state, analysis: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_CHAT_OPEN:
      return { ...state, isChatOpen: action.payload };
    case ACTIONS.SET_COPIED_TEXT:
      return { ...state, copiedText: action.payload };
    case ACTIONS.SET_SHOW_SKELETON:
      return { ...state, showSkeleton: action.payload };
    case ACTIONS.SET_HISTORY:
      return { ...state, history: action.payload };
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ACTIONS.SET_FILTER_STATUS:
      return { ...state, filterStatus: action.payload };
    case ACTIONS.RESET_ANALYSIS:
      return { ...state, analysis: null, error: null, showSkeleton: false };
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      dispatch({ type: ACTIONS.SET_HISTORY, payload: data });
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Action creators
  const actions = {
    setImageUrls: (urls) =>
      dispatch({ type: ACTIONS.SET_IMAGE_URLS, payload: urls }),
    addImageUrls: (urls) =>
      dispatch({ type: ACTIONS.ADD_IMAGE_URLS, payload: urls }),
    removeImageUrl: (index) =>
      dispatch({ type: ACTIONS.REMOVE_IMAGE_URL, payload: index }),
    clearImageUrls: () => dispatch({ type: ACTIONS.CLEAR_IMAGE_URLS }),
    setTestType: (testType) =>
      dispatch({ type: ACTIONS.SET_TEST_TYPE, payload: testType }),
    setAnalysis: (analysis) =>
      dispatch({ type: ACTIONS.SET_ANALYSIS, payload: analysis }),
    setLoading: (loading) =>
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    setChatOpen: (open) =>
      dispatch({ type: ACTIONS.SET_CHAT_OPEN, payload: open }),
    setCopiedText: (text) =>
      dispatch({ type: ACTIONS.SET_COPIED_TEXT, payload: text }),
    setShowSkeleton: (show) =>
      dispatch({ type: ACTIONS.SET_SHOW_SKELETON, payload: show }),
    setSearchQuery: (query) =>
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    setFilterStatus: (status) =>
      dispatch({ type: ACTIONS.SET_FILTER_STATUS, payload: status }),
    resetAnalysis: () => dispatch({ type: ACTIONS.RESET_ANALYSIS }),
    refreshHistory: fetchHistory,
  };

  // Computed values
  const filteredHistory = state.history.filter((report) => {
    const matchesSearch =
      report.test_name
        .toLowerCase()
        .includes(state.searchQuery.toLowerCase()) ||
      report.filename.toLowerCase().includes(state.searchQuery.toLowerCase());

    const matchesFilter =
      state.filterStatus === "all" ||
      (state.filterStatus === "normal" &&
        report.ai_result_json?.summary?.overallStatus === "Normal") ||
      (state.filterStatus === "abnormal" &&
        report.ai_result_json?.summary?.overallStatus !== "Normal");

    return matchesSearch && matchesFilter;
  });

  const value = {
    state,
    actions,
    filteredHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };
